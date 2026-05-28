/// <reference types="vite/client" />

/**
 * Compile-time constant injected by vite.config.ts via `define`.
 * True when USE_MOCK_EVALUATIONS is absent or any value other than "false".
 * False only when USE_MOCK_EVALUATIONS=false is explicitly set.
 */
declare const __AI_RUNTIME_PAUSED__: boolean
