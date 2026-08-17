"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { BlogPost } from "@/lib/types"
import { BLOGS_STORAGE_KEY, readLocalJson } from "@/lib/client-store"

type Props = {
  slug: string
  initialBlog: BlogPost | null
}

function formatBlogDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function BlogDetail({ slug, initialBlog }: Props) {
  const [blog, setBlog] = useState<BlogPost | null>(initialBlog)

  useEffect(() => {
    if (blog) return
    const local = readLocalJson<BlogPost[]>(BLOGS_STORAGE_KEY)
    const found = local?.find((b) => b.slug === slug && b.published) || null
    if (found) setBlog(found)
  }, [slug, blog])

  if (!blog) {
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
            <div className="container">
              <p className="card-desc">Artigo não encontrado.</p>
            </div>
          </section>
        </main>
      </div>
    )
  }

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
