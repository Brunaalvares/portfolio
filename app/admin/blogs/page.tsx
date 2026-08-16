"use client"

import { FormEvent, useEffect, useState } from "react"
import type { BlogPost } from "@/lib/types"

const emptyForm = {
  title: "",
  slug: "",
  tag: "",
  excerpt: "",
  content: "",
  image: "",
  published: true,
  publishedAt: "",
}

function toDateInput(value: string) {
  if (!value) return ""
  return value.slice(0, 10)
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError("")
    try {
      const me = await fetch("/api/auth/me")
      const auth = await me.json()
      if (!auth.authenticated) {
        window.location.href = "/admin/login"
        return
      }
      const res = await fetch("/api/blogs?all=1")
      const data = await res.json()
      setBlogs(data)
    } catch {
      setError("Erro ao carregar blogs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm,
      publishedAt: new Date().toISOString().slice(0, 10),
    })
    setDialogOpen(true)
  }

  function openEdit(blog: BlogPost) {
    setEditing(blog)
    setForm({
      title: blog.title,
      slug: blog.slug,
      tag: blog.tag,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.image,
      published: blog.published,
      publishedAt: toDateInput(blog.publishedAt),
    })
    setDialogOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const payload = {
      ...form,
      publishedAt: form.publishedAt
        ? new Date(`${form.publishedAt}T12:00:00.000Z`).toISOString()
        : new Date().toISOString(),
    }

    try {
      const url = editing ? `/api/blogs/${editing.id}` : "/api/blogs"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Erro ao salvar")
        setSaving(false)
        return
      }

      setDialogOpen(false)
      setSaving(false)
      await load()
    } catch {
      setError("Erro ao salvar post")
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este post?")) return
    const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" })
    if (!res.ok) {
      setError("Erro ao excluir")
      return
    }
    await load()
  }

  return (
    <>
      <h1 className="admin-page-title">Blogs</h1>
      <p className="admin-page-desc">
        Crie e edite artigos que aparecem na seção Blog do site e nas páginas individuais.
      </p>

      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          Novo post
        </button>
      </div>

      {error ? <p className="admin-error" style={{ marginBottom: "1rem" }}>{error}</p> : null}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Carregando...</div>
        ) : blogs.length === 0 ? (
          <div className="admin-empty">Nenhum post ainda. Crie o primeiro.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tag</th>
                <th>Data</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <strong>{blog.title}</strong>
                    <div style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      {blog.excerpt.slice(0, 80)}
                      {blog.excerpt.length > 80 ? "…" : ""}
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge">{blog.tag || "—"}</span>
                  </td>
                  <td>
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>
                    <span className={`admin-badge ${blog.published ? "" : "admin-badge-muted"}`}>
                      {blog.published ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => openEdit(blog)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(blog.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dialogOpen ? (
        <div className="admin-dialog-backdrop" onClick={() => !saving && setDialogOpen(false)}>
          <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Editar post" : "Novo post"}</h2>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-field">
                <label htmlFor="title">Título *</label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="tag">Tag</label>
                  <input
                    id="tag"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="Ex: Product Design"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="publishedAt">Data de publicação</label>
                  <input
                    id="publishedAt"
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="slug">Slug (URL)</label>
                <input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="gerado automaticamente se vazio"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="excerpt">Resumo *</label>
                <textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="content">Conteúdo *</label>
                <textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  style={{ minHeight: 180 }}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="image">URL da imagem (opcional)</label>
                <input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/minha-imagem.png"
                />
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Publicado
              </label>
              <div className="admin-actions" style={{ marginBottom: 0, marginTop: "0.5rem" }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
