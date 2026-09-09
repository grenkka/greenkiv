import { getSession } from '@/lib/auth'
import { getSignedUploadUrl } from '@/lib/r2'

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

  const { filename, contentType } = await request.json()

  if (!ALLOWED_TYPES[contentType]) {
    return Response.json({ error: 'Тип файлу не підтримується' }, { status: 400 })
  }

  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storageKey = `${Date.now()}_${sanitizedName}`

  const uploadUrl = await getSignedUploadUrl(storageKey, contentType)

  return Response.json({ uploadUrl, storageKey })
}
