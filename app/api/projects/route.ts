import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { createProject, getProjects } from "@/lib/content"

export async function GET() {
  const projects = await getProjects()
  return NextResponse.json(projects)
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

    const project = await createProject({
      title: body.title,
      slug: body.slug,
      tag: body.tag || "",
      description: body.description || "",
      content: body.content || body.description || "",
      image: body.image || "",
      url: body.url || "",
      featured: body.featured ?? true,
      order: body.order ?? 0,
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o projeto" }, { status: 500 })
  }
}
