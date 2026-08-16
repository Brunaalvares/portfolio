import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { createBlog, getBlogs } from "@/lib/content"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeDrafts = searchParams.get("all") === "1"
  const authenticated = await isAuthenticated()
  const blogs = await getBlogs(includeDrafts && authenticated)
  return NextResponse.json(blogs)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }

    const blog = await createBlog({
      title: body.title,
      slug: body.slug,
      tag: body.tag || "",
      excerpt: body.excerpt || "",
      content: body.content || body.excerpt || "",
      image: body.image || "",
      published: body.published ?? true,
      publishedAt: body.publishedAt || new Date().toISOString(),
    })

    return NextResponse.json(blog, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o post" }, { status: 500 })
  }
}
