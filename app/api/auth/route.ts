import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { SessionData, sessionOptions } from '@/lib/session'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!password || password !== process.env.FAMILY_PASSWORD) {
    return Response.json({ error: 'Невірне кодове слово' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  session.isLoggedIn = true
  session.memberName = ''
  await session.save()

  return Response.json({ ok: true })
}
