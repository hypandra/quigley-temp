import pg from 'pg'
import type { Pool as PgPool } from 'pg'

const { Pool } = pg

let pool: PgPool | null = null

function getPool(): PgPool | null {
  if (!process.env.DATABASE_URL) return null
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.SUPABASE_CA_CERT
        ? { ca: Buffer.from(process.env.SUPABASE_CA_CERT, 'base64').toString() }
        : undefined,
      max: 3,
    })
  }
  return pool
}

/** Fire-and-forget: logs a chat turn to re_chat_log. Never throws. */
export function logChatTurn(params: {
  sessionId: string | null
  eraId: string
  personaName: string
  yearLabel: string
  location: string
  systemPrompt: string
  userMessage: string
  assistantResponse: string
  model?: string
}) {
  const p = getPool()
  if (!p) return

  p.query(
    `INSERT INTO re_chat_log
      (session_id, era_id, persona_name, year_label, location, system_prompt, user_message, assistant_response, model)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      params.sessionId,
      params.eraId,
      params.personaName,
      params.yearLabel,
      params.location,
      params.systemPrompt,
      params.userMessage,
      params.assistantResponse,
      params.model ?? 'anthropic/claude-3.5-haiku',
    ]
  ).catch((err: unknown) => console.error('Failed to log chat turn:', err))
}
