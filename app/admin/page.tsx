import Link from "next/link"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { getBlogs, getProjects } from "@/lib/content"

export default async function AdminDashboardPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login")
  }

  const [projects, blogs] = await Promise.all([getProjects(), getBlogs(true)])
  const publishedBlogs = blogs.filter((b) => b.published).length

  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-desc">
        Gerencie os projetos do portfólio e os posts do blog. As alterações aparecem no site
        automaticamente.
      </p>

      <div className="admin-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat">
          <h3>Projetos</h3>
          <p>{projects.length}</p>
        </div>
        <div className="admin-stat">
          <h3>Posts publicados</h3>
          <p>{publishedBlogs}</p>
        </div>
        <div className="admin-stat">
          <h3>Rascunhos</h3>
          <p>{blogs.length - publishedBlogs}</p>
        </div>
      </div>

      <div className="admin-actions">
        <Link href="/admin/projects" className="admin-btn admin-btn-primary">
          Gerenciar projetos
        </Link>
        <Link href="/admin/blogs" className="admin-btn admin-btn-secondary">
          Gerenciar blogs
        </Link>
      </div>
    </>
  )
}
