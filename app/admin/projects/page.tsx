"use client"

import { FormEvent, useEffect, useState } from "react"
import type { Project } from "@/lib/types"

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

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
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
      const res = await fetch("/api/projects")
      const data = await res.json()
      setProjects(data)
    } catch {
      setError("Erro ao carregar projetos")
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
    setDialogOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = editing ? `/api/projects/${editing.id}` : "/api/projects"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      setError("Erro ao salvar projeto")
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este projeto?")) return
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
    if (!res.ok) {
      setError("Erro ao excluir")
      return
    }
    await load()
  }

  return (
    <>
      <h1 className="admin-page-title">Projetos</h1>
      <p className="admin-page-desc">
        Adicione, edite ou remova os projetos exibidos na seção Work do portfólio.
      </p>

      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          Novo projeto
        </button>
      </div>

      {error ? <p className="admin-error" style={{ marginBottom: "1rem" }}>{error}</p> : null}

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
                    <strong>{project.title}</strong>
                    <div style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      {project.description.slice(0, 80)}
                      {project.description.length > 80 ? "…" : ""}
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
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="image">URL da imagem</label>
                  <input
                    id="image"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="/minha-imagem.png"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="url">Link externo</label>
                  <input
                    id="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Exibir na home (destaque)
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
