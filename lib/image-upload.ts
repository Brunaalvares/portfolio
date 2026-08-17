/** Compress an image file to a JPEG data URL for portfolio uploads. */
export async function compressImageFile(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<string> {
  const maxWidth = options.maxWidth ?? 1600
  const maxHeight = options.maxHeight ?? 1600
  const quality = options.quality ?? 0.82

  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1)
  const width = Math.round(bitmap.width * ratio)
  const height = Math.round(bitmap.height * ratio)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    throw new Error("Não foi possível processar a imagem")
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL("image/jpeg", quality)
}

export async function uploadImageFile(file: File): Promise<{ url: string; persisted: boolean }> {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      return { url: data.url as string, persisted: true }
    }
  } catch {
    // fall through to local compression
  }

  const dataUrl = await compressImageFile(file)
  return { url: dataUrl, persisted: false }
}
