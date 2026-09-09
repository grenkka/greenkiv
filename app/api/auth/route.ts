import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { SessionData, sessionOptions } from '@/lib/session'

const LIMIT = 10
const WINDOW_MS = 15 * 60 * 1000 // 15 хвилин

const attempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  const now = Date.now()
  const entry = attempts.get(ip)

  if (entry && now < entry.resetAt) {
    if (entry.count >= LIMIT) {
      const waitSec = Math.ceil((entry.resetAt - now) / 1000)
      return Response.json(
        { error: `Забагато спроб. Спробуйте через ${waitSec} секунд.` },
        { status: 429 }
      )
    }
  } else {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS })
  }

  const { password } = await request.json()

  if (!password || password !== process.env.FAMILY_PASSWORD) {
    const current = attempts.get(ip)!
    current.count++
    return Response.json({ error: 'Невірне кодове слово' }, { status: 401 })
  }

  attempts.delete(ip)

  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  session.isLoggedIn = true
  session.memberName = ''
  await session.save()

  return Response.json({ ok: true })
}
