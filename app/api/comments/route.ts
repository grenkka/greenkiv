import { type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const mediaId = request.nextUrl.searchParams.get('media_id')

  if (!mediaId) {
    return Response.json({ error: 'media_id обов\'язковий' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*')
    .eq('media_id', mediaId)
    .order('created_at', { ascending: true })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const { media_id, content } = await request.json()

  if (!media_id || !content || !content.trim()) {
    return Response.json({ error: 'media_id та content обов\'язкові' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({
      media_id,
      content: content.trim(),
      author: session.memberName,
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
