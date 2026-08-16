import Link from "next/link"
import { getProjects } from "@/lib/content"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Work | Bruna Alvares",
  description: "Projetos e experiências de produto de Bruna Alvares",
}

export default async function WorkPage() {
  const projects = await getProjects()

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
              {projects.map((project) => (
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
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
