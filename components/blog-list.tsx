"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { BlogPost } from "@/lib/types"
import { BLOGS_STORAGE_KEY, readLocalJson } from "@/lib/client-store"

type Props = {
  initialBlogs: BlogPost[]
}

function formatBlogDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function BlogList({ initialBlogs }: Props) {
  const [blogs, setBlogs] = useState(initialBlogs)

  useEffect(() => {
    const local = readLocalJson<BlogPost[]>(BLOGS_STORAGE_KEY)
    if (local !== null) {
      setBlogs(
        local
          .filter((b) => b.published)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
      )
    }
  }, [])

  return (
    <div>
      <header>
        <div className="container">
          <nav>
            <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
              BRUNA ALVARES
            </Link>
            <div className="nav-links">
              <Link href="/#about">About</Link>
              <Link href="/work">Work</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/#contact">Contact</Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="section blog-section" style={{ paddingTop: "8rem" }}>
          <div className="container">
            <div className="section-header">
              <h1 className="section-title">All Articles</h1>
              <Link href="/" className="view-all">
                ← Home
              </Link>
            </div>
            <div className="grid">
              {blogs.length === 0 ? (
                <p className="card-desc">Nenhum artigo publicado ainda.</p>
              ) : (
                blogs.map((blog) => (
                  <article key={blog.id} className="card">
                    <div className="card-content">
                      {blog.tag ? <span className="card-tag">{blog.tag}</span> : null}
                      <div className="blog-date">{formatBlogDate(blog.publishedAt)}</div>
                      <h2 className="card-title">{blog.title}</h2>
                      <p className="card-desc">{blog.excerpt}</p>
                      <Link href={`/blog/${blog.slug}`} className="read-more">
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
