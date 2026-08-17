import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { isAuthenticated } from "@/lib/auth"

export const runtime = "nodejs"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const MAX_BYTES = 8 * 1024 * 1024

function extensionFor(type: string): string {
  switch (type) {
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "jpg"
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo de imagem é obrigatório" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG, WEBP ou GIF." },
        { status: 400 },
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Imagem muito grande (máx. 8MB)" }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })

    const safeBase = file.name
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40)

    const filename = `${Date.now()}-${safeBase || "image"}.${extensionFor(file.type)}`
    await fs.writeFile(path.join(uploadsDir, filename), bytes)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload"
    return NextResponse.json(
      {
        error: `Não foi possível salvar o arquivo no servidor (${message}).`,
      },
      { status: 500 },
    )
  }
}
