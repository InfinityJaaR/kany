import { createClient } from '@/lib/supabase/client'

export type StorageBucket = 'pet-images' | 'campaign-images' | 'avatars'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

function getExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  if (file.type === 'image/jpeg') return 'jpg'
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return 'Solo se permiten imágenes JPG, PNG o WebP.'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'La imagen no puede superar 5 MB.'
  }
  return null
}

export async function uploadImage({
  bucket,
  folder,
  file,
  userId,
}: {
  bucket: StorageBucket
  folder: string
  file: File
  userId: string
}): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  const ext = getExtension(file)
  const path = `${folder}/${userId}/${Date.now()}.${ext}`

  const supabase = createClient()
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
