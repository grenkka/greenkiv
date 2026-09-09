import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { getSignedR2Url, deleteFromR2 } from '@/lib/r2'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('media')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return Response.json({ error: 'Медіафайл не знайдено' }, { status: 404 })
  }

  const url = await getSignedR2Url(data.storage_path)

  return Response.json({ ...data, url })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const { id } = await params

  const { data, error: fetchError } = await supabaseAdmin
    .from('media')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError) {
    return Response.json({ error: 'Медіафайл не знайдено' }, { status: 404 })
  }

  const { error: dbError } = await supabaseAdmin
    .from('media')
    .delete()
    .eq('id', id)

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  await deleteFromR2(data.storage_path)

  return Response.json({ ok: true })
}
