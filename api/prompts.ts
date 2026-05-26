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

// No module-level cache — .md files are read fresh on every call.
// In dev: ensures prompt edits take effect immediately without a server restart.
// In production (Vercel serverless): each invocation is a fresh process anyway.
export function loadPrompt(mode: IdeaMode): LoadedPrompt {
  const system = readPromptFile('system.md')
  const modeContent = readPromptFile(`${mode}.md`)

  const closingReminder = [
    '---',
    '',
    'FINAL REMINDER: You are a JSON generator. Your response is a single JSON object.',
    'First character: {',
    'Last character: }',
    'No other text.',
  ].join('\n')

  const systemPrompt = `${system}\n\n---\n\n${modeContent}\n\n${closingReminder}`

  const hash = createHash('sha256')
    .update(systemPrompt)
    .digest('hex')
    .slice(0, 8)

  return { systemPrompt, promptVersion: `${mode}@${hash}` }
}
