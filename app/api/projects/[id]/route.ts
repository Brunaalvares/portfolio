import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { deleteProject, getProjectById, updateProject } from "@/lib/content"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
  }
  return NextResponse.json(project)
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const project = await updateProject(id, body)
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o projeto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const ok = await deleteProject(id)
    if (!ok) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível excluir o projeto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
