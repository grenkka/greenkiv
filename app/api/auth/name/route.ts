import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { SessionData, sessionOptions } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  return Response.json({ memberName: session.memberName })
}

export async function POST(request: Request) {
  const { name } = await request.json()

  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'Ім\'я не вказано' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  session.memberName = name.trim()
  await session.save()

  return Response.json({ ok: true, memberName: session.memberName })
}
