import { type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() || ''

  if (!q) {
    return Response.json({ folders: [], media: [] })
  }

  const [foldersResult, mediaResult] = await Promise.all([
    supabaseAdmin
      .from('folders')
      .select('*')
      .or(`name.ilike.%${q}%,created_by.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20),

    supabaseAdmin
      .from('media')
      .select('*')
      .or(`name.ilike.%${q}%,uploaded_by.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(40),
  ])

  // Генеруємо підписані URL для медіафайлів
  const mediaWithUrls = await Promise.all(
    (mediaResult.data || []).map(async (item) => {
      const { data: urlData } = await supabaseAdmin.storage
        .from('family-media')
        .createSignedUrl(item.storage_path, 3600)
      return { ...item, url: urlData?.signedUrl || null }
    })
  )

  return Response.json({
    folders: foldersResult.data || [],
    media: mediaWithUrls,
  })
}
