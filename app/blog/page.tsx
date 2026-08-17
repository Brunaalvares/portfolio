import BlogList from "@/components/blog-list"
import { getBlogs } from "@/lib/content"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Blog | Bruna Alvares",
  description: "Artigos e reflexões sobre produto, design e tecnologia",
}

export default async function BlogIndexPage() {
  const blogs = await getBlogs(false)
  return <BlogList initialBlogs={blogs} />
}
