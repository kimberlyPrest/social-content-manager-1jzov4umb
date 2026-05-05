import { useCallback, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  images: File[]
  existingImages?: string[]
  onChange: (files: File[]) => void
  onRemoveExisting?: (img: string) => void
}

export function ImageUploader({
  images,
  existingImages = [],
  onChange,
  onRemoveExisting,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
      addFiles(files)
    },
    [images, existingImages],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (files: File[]) => {
    const totalCount = images.length + existingImages.length + files.length
    if (totalCount > 5) {
      toast.error('Máximo de 5 imagens permitido')
      return
    }

    const validFiles = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`A imagem ${f.name} excede o limite de 5MB`)
        return false
      }
      return true
    })

    if (validFiles.length) {
      onChange([...images, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Clique ou arraste imagens aqui</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP até 5MB (máx 5)</p>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {(images.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {existingImages.map((url, i) => (
            <div
              key={`ext-${i}`}
              className="relative aspect-square rounded-md overflow-hidden border group"
            >
              <img src={url} alt="preview" className="object-cover w-full h-full" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveExisting?.(url)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.map((file, i) => (
            <div
              key={`new-${i}`}
              className="relative aspect-square rounded-md overflow-hidden border group"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
