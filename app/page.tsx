import PortfolioHome from "@/components/portfolio-home"
import { getBlogs, getFeaturedProjects } from "@/lib/content"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [projects, blogs] = await Promise.all([getFeaturedProjects(), getBlogs(false)])

  return <PortfolioHome projects={projects} blogs={blogs.slice(0, 3)} />
}
