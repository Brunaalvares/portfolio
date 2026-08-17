import ProjectDetail from "@/components/project-detail"
import { getProjectBySlug } from "@/lib/content"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: "Projeto | Bruna Alvares" }
  return {
    title: `${project.title} | Bruna Alvares`,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = (await getProjectBySlug(slug)) || null
  return <ProjectDetail slug={slug} initialProject={project} />
}
