"use client"

export function AdminLogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <button type="button" className="admin-logout" onClick={handleLogout}>
      Sair
    </button>
  )
}
