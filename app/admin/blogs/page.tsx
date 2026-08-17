"use client"

import { FormEvent, useEffect, useState } from "react"
import type { BlogPost } from "@/lib/types"
import { BLOGS_STORAGE_KEY, readLocalJson, writeLocalJson } from "@/lib/client-store"
import { uploadImageFile } from "@/lib/image-upload"
import { slugify } from "@/lib/types"

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

function sortBlogs(list: BlogPost[]) {
  return [...list].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  function persistLocal(next: BlogPost[]) {
    const sorted = sortBlogs(next)
    writeLocalJson(BLOGS_STORAGE_KEY, sorted)
    setBlogs(sorted)
  }

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

      const local = readLocalJson<BlogPost[]>(BLOGS_STORAGE_KEY)
      const res = await fetch("/api/blogs?all=1")
      const remote = res.ok ? ((await res.json()) as BlogPost[]) : []

      if (local !== null) {
        persistLocal(local)
      } else {
        persistLocal(remote)
      }
    } catch {
      const local = readLocalJson<BlogPost[]>(BLOGS_STORAGE_KEY)
      if (local) persistLocal(local)
      else setError("Erro ao carregar blogs")
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
    setError("")
    setNotice("")
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
    setError("")
    setNotice("")
    setDialogOpen(true)
  }

  async function handleImagePick(file: File | null) {
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const result = await uploadImageFile(file)
      setForm((prev) => ({ ...prev, image: result.url }))
      setNotice(
        result.persisted
          ? "Imagem enviada com sucesso."
          : "Imagem anexada neste navegador (upload no servidor indisponível).",
      )
    } catch {
      setError("Não foi possível processar a imagem")
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setNotice("")

    const now = new Date().toISOString()
    const publishedAt = form.publishedAt
      ? new Date(`${form.publishedAt}T12:00:00.000Z`).toISOString()
      : now

    const baseSlug = slugify(form.slug || form.title)
    let slug = baseSlug || "post"
    let n = 2
    while (blogs.some((b) => b.slug === slug && b.id !== editing?.id)) {
      slug = `${baseSlug}-${n}`
      n++
    }

    const payload = {
      ...form,
      slug,
      publishedAt,
      content: form.content || form.excerpt,
    }

    try {
      const url = editing ? `/api/blogs/${editing.id}` : "/api/blogs"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.status === 401) {
        window.location.href = "/admin/login"
        return
      }

      if (res.ok) {
        const saved = (await res.json()) as BlogPost
        const next = editing
          ? blogs.map((b) => (b.id === saved.id ? saved : b))
          : [...blogs, saved]
        persistLocal(next)
        setDialogOpen(false)
        setNotice("Post salvo.")
        return
      }

      const data = await res.json().catch(() => ({}))
      const localBlog: BlogPost = editing
        ? { ...editing, ...payload, updatedAt: now }
        : {
            id: `blog-${Date.now()}`,
            title: payload.title.trim(),
            slug,
            tag: payload.tag.trim(),
            excerpt: payload.excerpt.trim(),
            content: payload.content.trim(),
            image: payload.image.trim(),
            published: Boolean(payload.published),
            publishedAt,
            createdAt: now,
            updatedAt: now,
          }

      const next = editing
        ? blogs.map((b) => (b.id === localBlog.id ? localBlog : b))
        : [...blogs, localBlog]
      persistLocal(next)
      setDialogOpen(false)
      setNotice(
        data.error
          ? `Salvo neste navegador. Servidor: ${data.error}`
          : "Salvo neste navegador (servidor indisponível para gravar).",
      )
    } catch {
      const localBlog: BlogPost = editing
        ? { ...editing, ...payload, updatedAt: now }
        : {
            id: `blog-${Date.now()}`,
            title: payload.title.trim(),
            slug,
            tag: payload.tag.trim(),
            excerpt: payload.excerpt.trim(),
            content: (payload.content || payload.excerpt).trim(),
            image: payload.image.trim(),
            published: Boolean(payload.published),
            publishedAt,
            createdAt: now,
            updatedAt: now,
          }
      const next = editing
        ? blogs.map((b) => (b.id === localBlog.id ? localBlog : b))
        : [...blogs, localBlog]
      persistLocal(next)
      setDialogOpen(false)
      setNotice("Salvo neste navegador (sem conexão com a API).")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este post?")) return
    setError("")
    setNotice("")

    const next = blogs.filter((b) => b.id !== id)
    persistLocal(next)

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" })
      if (res.status === 401) {
        window.location.href = "/admin/login"
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setNotice(
          data.error
            ? `Removido neste navegador. Servidor: ${data.error}`
            : "Removido neste navegador (servidor não gravou).",
        )
        return
      }
      setNotice("Post excluído.")
    } catch {
      setNotice("Removido neste navegador (sem conexão com a API).")
    }
  }

  return (
    <>
      <h1 className="admin-page-title">Blogs</h1>
      <p className="admin-page-desc">
        Crie e edite artigos que aparecem na seção Blog do site. Você pode enviar fotos do
        computador.
      </p>

      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          Novo post
        </button>
      </div>

      {error ? <p className="admin-error" style={{ marginBottom: "1rem" }}>{error}</p> : null}
      {notice ? <p className="admin-success" style={{ marginBottom: "1rem" }}>{notice}</p> : null}

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
                <label htmlFor="imageFile">Imagem de capa</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploading || saving}
                  onChange={(e) => handleImagePick(e.target.files?.[0] || null)}
                />
              </div>
              {form.image ? (
                <div className="admin-field">
                  <label>Pré-visualização</label>
                  <img
                    src={form.image}
                    alt="Pré-visualização"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid rgba(26,26,26,0.08)",
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    style={{ marginTop: "0.35rem", width: "fit-content" }}
                    onClick={() => setForm({ ...form, image: "" })}
                  >
                    Remover imagem
                  </button>
                </div>
              ) : null}
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Publicado
              </label>
              {error ? <p className="admin-error">{error}</p> : null}
              {notice ? <p className="admin-success">{notice}</p> : null}
              <div className="admin-actions" style={{ marginBottom: 0, marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving || uploading}
                >
                  {saving ? "Salvando..." : uploading ? "Enviando imagem..." : "Salvar"}
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
