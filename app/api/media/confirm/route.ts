import { getSession } from '@/lib/auth'
import { getSignedR2Url, deleteFromR2 } from '@/lib/r2'
import { supabaseAdmin } from '@/lib/supabase'

const MEDIA_TYPE: Record<string, string> = {
  'image/jpeg': 'photo',
  'image/jpg': 'photo',
  'image/png': 'photo',
  'image/heic': 'photo',
  'image/heif': 'photo',
  'video/mp4': 'video',
  'video/quicktime': 'video',
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Не авторизовано' }, { status: 401 })
  }

  const { storageKey, name, contentType, size, folderId } = await request.json()

  const mediaType = MEDIA_TYPE[contentType]
  if (!mediaType) {
    return Response.json({ error: 'Тип файлу не підтримується' }, { status: 400 })
  }

  const { data: mediaRecord, error: dbError } = await supabaseAdmin
    .from('media')
    .insert({
      folder_id: folderId || null,
      storage_path: storageKey,
      name,
      type: mediaType,
      size_bytes: size,
      uploaded_by: session.memberName,
    })
    .select()
    .single()

  if (dbError) {
    await deleteFromR2(storageKey)
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  const url = await getSignedR2Url(storageKey)

  return Response.json({ ...mediaRecord, url }, { status: 201 })
}
