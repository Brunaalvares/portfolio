import Link from "next/link"
import { notFound } from "next/navigation"
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
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

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
