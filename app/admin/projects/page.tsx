"use client"

import { FormEvent, useEffect, useState } from "react"
import type { Project } from "@/lib/types"
import { PROJECTS_STORAGE_KEY, readLocalJson, writeLocalJson } from "@/lib/client-store"
import { uploadImageFile } from "@/lib/image-upload"
import { slugify } from "@/lib/types"

const emptyForm = {
  title: "",
  slug: "",
  tag: "",
  description: "",
  content: "",
  image: "",
  url: "",
  featured: true,
  order: 0,
}

function sortProjects(list: Project[]) {
  return [...list].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  function persistLocal(next: Project[]) {
    const sorted = sortProjects(next)
    writeLocalJson(PROJECTS_STORAGE_KEY, sorted)
    setProjects(sorted)
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

      const local = readLocalJson<Project[]>(PROJECTS_STORAGE_KEY)
      const res = await fetch("/api/projects")
      const remote = res.ok ? ((await res.json()) as Project[]) : []

      if (local !== null) {
        persistLocal(local)
      } else {
        persistLocal(remote)
      }
    } catch {
      const local = readLocalJson<Project[]>(PROJECTS_STORAGE_KEY)
      if (local) {
        persistLocal(local)
      } else {
        setError("Erro ao carregar projetos")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, order: projects.length + 1 })
    setError("")
    setNotice("")
    setDialogOpen(true)
  }

  function openEdit(project: Project) {
    setEditing(project)
    setForm({
      title: project.title,
      slug: project.slug,
      tag: project.tag,
      description: project.description,
      content: project.content,
      image: project.image,
      url: project.url,
      featured: project.featured,
      order: project.order,
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
      if (!result.persisted) {
        setNotice("Imagem anexada neste navegador (upload no servidor indisponível).")
      } else {
        setNotice("Imagem enviada com sucesso.")
      }
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
    const baseSlug = slugify(form.slug || form.title)
    let slug = baseSlug || "projeto"
    let n = 2
    while (projects.some((p) => p.slug === slug && p.id !== editing?.id)) {
      slug = `${baseSlug}-${n}`
      n++
    }

    const payload = {
      ...form,
      slug,
      content: form.content || form.description,
    }

    try {
      const url = editing ? `/api/projects/${editing.id}` : "/api/projects"
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
        const saved = (await res.json()) as Project
        const next = editing
          ? projects.map((p) => (p.id === saved.id ? saved : p))
          : [...projects, saved]
        persistLocal(next)
        setDialogOpen(false)
        setSaving(false)
        setNotice("Projeto salvo.")
        return
      }

      // Server write failed (common on serverless). Keep working via localStorage.
      const data = await res.json().catch(() => ({}))
      const localProject: Project = editing
        ? {
            ...editing,
            ...payload,
            updatedAt: now,
          }
        : {
            id: `proj-${Date.now()}`,
            title: payload.title.trim(),
            slug,
            tag: payload.tag.trim(),
            description: payload.description.trim(),
            content: payload.content.trim(),
            image: payload.image.trim(),
            url: payload.url.trim(),
            featured: Boolean(payload.featured),
            order: Number.isFinite(payload.order) ? payload.order : projects.length + 1,
            createdAt: now,
            updatedAt: now,
          }

      const next = editing
        ? projects.map((p) => (p.id === localProject.id ? localProject : p))
        : [...projects, localProject]
      persistLocal(next)
      setDialogOpen(false)
      setNotice(
        data.error
          ? `Salvo neste navegador. Servidor: ${data.error}`
          : "Salvo neste navegador (servidor indisponível para gravar).",
      )
    } catch {
      const localProject: Project = editing
        ? { ...editing, ...payload, updatedAt: now }
        : {
            id: `proj-${Date.now()}`,
            title: payload.title.trim(),
            slug,
            tag: payload.tag.trim(),
            description: payload.description.trim(),
            content: (payload.content || payload.description).trim(),
            image: payload.image.trim(),
            url: payload.url.trim(),
            featured: Boolean(payload.featured),
            order: Number.isFinite(payload.order) ? payload.order : projects.length + 1,
            createdAt: now,
            updatedAt: now,
          }
      const next = editing
        ? projects.map((p) => (p.id === localProject.id ? localProject : p))
        : [...projects, localProject]
      persistLocal(next)
      setDialogOpen(false)
      setNotice("Salvo neste navegador (sem conexão com a API).")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este projeto?")) return
    setError("")
    setNotice("")

    const next = projects.filter((p) => p.id !== id)
    persistLocal(next)

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
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
      setNotice("Projeto excluído.")
    } catch {
      setNotice("Removido neste navegador (sem conexão com a API).")
    }
  }

  return (
    <>
      <h1 className="admin-page-title">Projetos</h1>
      <p className="admin-page-desc">
        Adicione, edite ou remova os projetos exibidos na seção Work do portfólio. Você pode enviar
        fotos do computador.
      </p>

      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          Novo projeto
        </button>
      </div>

      {error ? <p className="admin-error" style={{ marginBottom: "1rem" }}>{error}</p> : null}
      {notice ? <p className="admin-success" style={{ marginBottom: "1rem" }}>{notice}</p> : null}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="admin-empty">Nenhum projeto ainda. Crie o primeiro.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tag</th>
                <th>Ordem</th>
                <th>Destaque</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      {project.image ? (
                        <img
                          src={project.image}
                          alt=""
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 8,
                            flexShrink: 0,
                          }}
                        />
                      ) : null}
                      <div>
                        <strong>{project.title}</strong>
                        <div style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                          {project.description.slice(0, 80)}
                          {project.description.length > 80 ? "…" : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge">{project.tag || "—"}</span>
                  </td>
                  <td>{project.order}</td>
                  <td>
                    <span className={`admin-badge ${project.featured ? "" : "admin-badge-muted"}`}>
                      {project.featured ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => openEdit(project)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(project.id)}
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
            <h2>{editing ? "Editar projeto" : "Novo projeto"}</h2>
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
                    placeholder="Ex: Design System"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="order">Ordem</label>
                  <input
                    id="order"
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
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
                <label htmlFor="description">Descrição curta *</label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="content">Conteúdo completo</label>
                <textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  style={{ minHeight: 160 }}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="imageFile">Foto do projeto</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploading || saving}
                  onChange={(e) => handleImagePick(e.target.files?.[0] || null)}
                />
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "#666" }}>
                  Envie uma imagem do computador (JPG, PNG, WEBP ou GIF).
                </p>
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
              <div className="admin-field">
                <label htmlFor="url">Link externo</label>
                <input
                  id="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Exibir na home (destaque)
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
