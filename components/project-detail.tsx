"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { Project } from "@/lib/types"
import { PROJECTS_STORAGE_KEY, readLocalJson } from "@/lib/client-store"

type Props = {
  slug: string
  initialProject: Project | null
}

export default function ProjectDetail({ slug, initialProject }: Props) {
  const [project, setProject] = useState<Project | null>(initialProject)

  useEffect(() => {
    if (project) return
    const local = readLocalJson<Project[]>(PROJECTS_STORAGE_KEY)
    const found = local?.find((p) => p.slug === slug) || null
    if (found) setProject(found)
  }, [slug, project])

  if (!project) {
    return (
      <div>
        <header>
          <div className="container">
            <nav>
              <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
                BRUNA ALVARES
              </Link>
              <div className="nav-links">
                <Link href="/work">← Todos os projetos</Link>
              </div>
            </nav>
          </div>
        </header>
        <main>
          <section className="section" style={{ paddingTop: "8rem" }}>
            <div className="container">
              <p className="card-desc">Projeto não encontrado.</p>
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
              <Link href="/work">← Todos os projetos</Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="section" style={{ paddingTop: "8rem" }}>
          <div className="container" style={{ maxWidth: 800 }}>
            {project.tag ? <span className="card-tag">{project.tag}</span> : null}
            <h1 className="section-title" style={{ marginTop: "0.75rem" }}>
              {project.title}
            </h1>
            <p className="contact-desc" style={{ marginTop: "1rem" }}>
              {project.description}
            </p>
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="card-image"
                style={{ marginTop: "2rem", borderRadius: 12, width: "100%" }}
              />
            ) : null}
            <div
              className="contact-desc"
              style={{ marginTop: "2rem", whiteSpace: "pre-wrap", lineHeight: 1.7 }}
            >
              {project.content}
            </div>
            {project.url ? (
              <p style={{ marginTop: "2rem" }}>
                <a href={project.url} className="read-more" target="_blank" rel="noopener noreferrer">
                  Ver projeto →
                </a>
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}
