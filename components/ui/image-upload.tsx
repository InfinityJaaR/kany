'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImage, validateImageFile, type StorageBucket } from '@/lib/supabase/upload-image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  bucket: StorageBucket
  folder: string
  label?: string
  initialUrl?: string | null
  onUploaded: (url: string) => void
  onClear?: () => void
}

export function ImageUpload({
  bucket,
  folder,
  label = 'Foto',
  initialUrl = null,
  onUploaded,
  onClear,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync preview when the initialUrl prop changes
    setPreview(initialUrl)
  }, [initialUrl])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setUploading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Debes iniciar sesión para subir imágenes.')

      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      const publicUrl = await uploadImage({ bucket, folder, file, userId: user.id })
      onUploaded(publicUrl)
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.')
      onClear?.()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleClear() {
    setPreview(null)
    setError(null)
    onClear?.()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa"
            className="h-40 w-40 object-cover rounded-xl border border-border"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white"
            aria-label="Quitar imagen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="gap-2"
        >
          <ImagePlus className="w-4 h-4" />
          {uploading ? 'Subiendo…' : 'Seleccionar imagen'}
        </Button>
      )}
      <p className="text-xs text-foreground/60">JPG, PNG o WebP. Máximo 5 MB.</p>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
