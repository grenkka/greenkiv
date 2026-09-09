import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { uploadToR2, getSignedR2Url, deleteFromR2 } from '@/lib/r2'

const ALLOWED_TYPES: Record<string, string> = {
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

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const folderId = formData.get('folder_id') as string | null

  if (!file) {
    return Response.json({ error: 'Файл не вибрано' }, { status: 400 })
  }

  const mediaType = ALLOWED_TYPES[file.type]
  if (!mediaType) {
    return Response.json(
      { error: 'Тип файлу не підтримується. Дозволені: jpg, png, heic, mp4, mov' },
      { status: 400 }
    )
  }

  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storageKey = `${timestamp}_${sanitizedName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  try {
    await uploadToR2(storageKey, buffer, file.type)
  } catch (err) {
    console.error('R2 upload error:', err)
    return Response.json({ error: 'Помилка завантаження файлу' }, { status: 500 })
  }

  const { data: mediaRecord, error: dbError } = await supabaseAdmin
    .from('media')
    .insert({
      folder_id: folderId || null,
      storage_path: storageKey,
      name: file.name,
      type: mediaType,
      size_bytes: file.size,
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
