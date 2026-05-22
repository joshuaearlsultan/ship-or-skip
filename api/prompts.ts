import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IdeaMode } from '../src/types/request'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function readPromptFile(filename: string): string {
  return readFileSync(join(ROOT, 'prompts', filename), 'utf-8')
}

interface LoadedPrompt {
  systemPrompt: string
  promptVersion: string
}

const cache = new Map<IdeaMode, LoadedPrompt>()

export function loadPrompt(mode: IdeaMode): LoadedPrompt {
  const cached = cache.get(mode)
  if (cached) return cached

  const system = readPromptFile('system.md')
  const modeContent = readPromptFile(`${mode}.md`)
  const systemPrompt = `${system}\n\n---\n\n${modeContent}`

  const hash = createHash('sha256')
    .update(systemPrompt)
    .digest('hex')
    .slice(0, 8)

  const loaded: LoadedPrompt = {
    systemPrompt,
    promptVersion: `${mode}@${hash}`,
  }

  cache.set(mode, loaded)
  return loaded
}

export function clearPromptCache(): void {
  cache.clear()
}
