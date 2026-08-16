import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { deleteBlog, getBlogById, updateBlog } from "@/lib/content"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const blog = await getBlogById(id)
  if (!blog) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
  }
  if (!blog.published && !(await isAuthenticated())) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
  }
  return NextResponse.json(blog)
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const blog = await updateBlog(id, body)
    if (!blog) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }
    return NextResponse.json(blog)
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o post" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const ok = await deleteBlog(id)
  if (!ok) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
