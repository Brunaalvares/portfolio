import WorkList from "@/components/work-list"
import { getProjects } from "@/lib/content"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Work | Bruna Alvares",
  description: "Projetos e experiências de produto de Bruna Alvares",
}

export default async function WorkPage() {
  const projects = await getProjects()
  return <WorkList initialProjects={projects} />
}
