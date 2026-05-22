import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "api-dev-server",
      configureServer(server) {
        server.middlewares.use(
          "/api/evaluate",
          (req: IncomingMessage, res: ServerResponse) => {
            if (req.method !== "POST") {
              res.writeHead(405, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  error: { code: "internal", message: "Method not allowed." },
                }),
              );
              return;
            }

            const chunks: Buffer[] = [];
            req.on("data", (chunk: Buffer) => chunks.push(chunk));
            req.on("end", () => {
              let body: unknown;
              try {
                body = JSON.parse(Buffer.concat(chunks).toString());
              } catch {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    error: { code: "invalid_input", message: "Invalid JSON." },
                  }),
                );
                return;
              }

              const ip =
                (req.headers["x-forwarded-for"] as string | undefined)
                  ?.split(",")[0]
                  ?.trim() ?? "dev";

              import("./api/evaluate")
                .then(({ handleEvaluate }) => handleEvaluate(body, ip))
                .then((result) => {
                  res.setHeader("Content-Type", "application/json");
                  if (result.ok) {
                    res.writeHead(200);
                    res.end(JSON.stringify(result.data));
                  } else {
                    const err = result.error as {
                      code: string;
                      retryAfterMs?: number;
                    };
                    const status =
                      err.code === "invalid_input"
                        ? 400
                        : err.code === "rate_limited"
                          ? 429
                          : err.code === "upstream_error"
                            ? 502
                            : 500;
                    res.writeHead(status);
                    res.end(JSON.stringify({ error: result.error }));
                  }
                })
                .catch((err: unknown) => {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({
                      error: {
                        code: "internal",
                        message:
                          err instanceof Error
                            ? err.message
                            : "Internal server error.",
                      },
                    }),
                  );
                });
            });
          },
        );
      },
    },
  ],
});
