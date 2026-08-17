import BlogDetail from "@/components/blog-detail"
import { getBlogBySlug } from "@/lib/content"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog || !blog.published) return { title: "Blog | Bruna Alvares" }
  return {
    title: `${blog.title} | Bruna Alvares`,
    description: blog.excerpt,
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  const initial = blog && blog.published ? blog : null
  return <BlogDetail slug={slug} initialBlog={initial} />
}
