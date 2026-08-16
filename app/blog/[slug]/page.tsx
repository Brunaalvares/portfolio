import Link from "next/link"
import { notFound } from "next/navigation"
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

function formatBlogDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog || !blog.published) notFound()

  return (
    <div>
      <header>
        <div className="container">
          <nav>
            <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
              BRUNA ALVARES
            </Link>
            <div className="nav-links">
              <Link href="/blog">← Todos os artigos</Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="section" style={{ paddingTop: "8rem" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            {blog.tag ? <span className="card-tag">{blog.tag}</span> : null}
            <div className="blog-date" style={{ marginTop: "0.75rem" }}>
              {formatBlogDate(blog.publishedAt)}
            </div>
            <h1 className="section-title" style={{ marginTop: "0.5rem" }}>
              {blog.title}
            </h1>
            {blog.image ? (
              <img
                src={blog.image}
                alt={blog.title}
                className="card-image"
                style={{ marginTop: "2rem", borderRadius: 12, width: "100%" }}
              />
            ) : null}
            <div
              className="contact-desc"
              style={{ marginTop: "2rem", whiteSpace: "pre-wrap", lineHeight: 1.75 }}
            >
              {blog.content}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
