// SERVER ONLY. Anthropic wrapper: calls the model and returns schema-validated JSON.
// Never import this from a client component (it reads ANTHROPIC_API_KEY).
import Anthropic from '@anthropic-ai/sdk'
import type { ZodType } from 'zod'

const MODEL = process.env.ATLAS_AI_MODEL ?? 'claude-sonnet-4-6'

let _client: Anthropic | null = null
function client() {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
    _client = new Anthropic({ apiKey })
  }
  return _client
}

// Pull the first balanced JSON object out of a model response (tolerates code fences / prose).
function extractJSON(text: string): unknown {
  let t = text.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Model returned no JSON object')
  return JSON.parse(t.slice(start, end + 1))
}

// Strip em-dashes from every string value in the model output (a writing "tell").
// Deterministic, so no em-dash reaches the DB or the user regardless of what the model writes.
function stripEmDashes(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/[ \t]*—[ \t]*/g, ', ')
  if (Array.isArray(value)) return value.map(stripEmDashes)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = stripEmDashes(v)
    return out
  }
  return value
}

export async function generateJSON<T>(opts: {
  system: string
  prompt: string
  schema: ZodType<T>
  maxTokens?: number
  temperature?: number
}): Promise<T> {
  const { system, prompt, schema, maxTokens = 2000, temperature = 0.3 } = opts

  async function once(extra = ''): Promise<T> {
    const msg = await client().messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: prompt + extra }],
    })
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    return schema.parse(stripEmDashes(extractJSON(text)))
  }

  try {
    return await once()
  } catch {
    // One retry with a stricter nudge before giving up.
    return await once('\n\nRespond with ONLY the raw JSON object. No prose, no code fences.')
  }
}
