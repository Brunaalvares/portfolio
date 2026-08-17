"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { Project } from "@/lib/types"
import { PROJECTS_STORAGE_KEY, readLocalJson } from "@/lib/client-store"

type Props = {
  initialProjects: Project[]
}

export default function WorkList({ initialProjects }: Props) {
  const [projects, setProjects] = useState(initialProjects)

  useEffect(() => {
    const local = readLocalJson<Project[]>(PROJECTS_STORAGE_KEY)
    if (local !== null) {
      setProjects([...local].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)))
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
        <section className="section" style={{ paddingTop: "8rem" }}>
          <div className="container">
            <div className="section-header">
              <h1 className="section-title">All Work</h1>
              <Link href="/" className="view-all">
                ← Home
              </Link>
            </div>
            <div className="grid">
              {projects.length === 0 ? (
                <p className="card-desc">Nenhum projeto publicado ainda.</p>
              ) : (
                projects.map((project) => (
                  <article key={project.id} className="card">
                    <Link
                      href={`/work/${project.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {project.image ? (
                        <img src={project.image} alt={project.title} className="card-image" />
                      ) : null}
                      <div className="card-content">
                        {project.tag ? <span className="card-tag">{project.tag}</span> : null}
                        <h2 className="card-title">{project.title}</h2>
                        <p className="card-desc">{project.description}</p>
                      </div>
                    </Link>
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
