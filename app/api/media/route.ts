import { type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { getSignedR2Url } from '@/lib/r2'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const folderId = searchParams.get('folder_id')
  const sort = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search') || ''

  let query = supabaseAdmin.from('media').select('*')

  if (folderId) {
    query = query.eq('folder_id', folderId)
  } else {
    query = query.is('folder_id', null)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,uploaded_by.ilike.%${search}%`)
  }

  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'author':
      query = query.order('uploaded_by', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const mediaWithUrls = await Promise.all(
    (data || []).map(async (item) => {
      const url = await getSignedR2Url(item.storage_path)
      return { ...item, url }
    })
  )

  return Response.json(mediaWithUrls)
}
