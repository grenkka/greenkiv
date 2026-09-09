import { type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const parentId = searchParams.get('parent_id')

  let query = supabaseAdmin
    .from('folders')
    .select('*')
    .order('created_at', { ascending: false })

  if (parentId) {
    query = query.eq('parent_id', parentId)
  } else {
    query = query.is('parent_id', null)
  }

  const { data, error } = await query

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

  const { name, parent_id } = await request.json()

  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'Назва папки обов\'язкова' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('folders')
    .insert({
      name: name.trim(),
      parent_id: parent_id || null,
      created_by: session.memberName,
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
