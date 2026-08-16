import Link from "next/link"
import { isAuthenticated } from "@/lib/auth"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import "./admin.css"

export const metadata = {
  title: "Admin | Bruna Alvares",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    return <div className="admin-shell">{children}</div>
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/admin" className="admin-brand">
            Admin · Bruna Alvares
          </Link>
          <nav className="admin-nav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/projects">Projetos</Link>
            <Link href="/admin/blogs">Blogs</Link>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              Ver site
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  )
}
