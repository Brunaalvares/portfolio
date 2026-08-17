import { promises as fs } from "fs"
import path from "path"
import type { BlogInput, BlogPost, Project, ProjectInput } from "./types"
import { slugify } from "./types"

const dataDir = path.join(process.cwd(), "data")

async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(dataDir, filename)
  const raw = await fs.readFile(filePath, "utf-8")
  return JSON.parse(raw) as T
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename)
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8")
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro desconhecido"
    throw new Error(
      `Falha ao gravar ${filename}: ${message}. Em hospedagem serverless o disco pode ser somente leitura.`,
    )
  }
}

function ensureUniqueSlug(base: string, existing: string[], currentId?: string): string {
  let slug = base || "item"
  let counter = 2
  while (existing.some((s) => s === slug)) {
    slug = `${base}-${counter}`
    counter++
  }
  // If editing and slug belongs to current item, existing list should exclude it
  void currentId
  return slug
}

export async function getProjects(): Promise<Project[]> {
  const projects = await readJsonFile<Project[]>("projects.json")
  return projects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects()
  return projects.filter((p) => p.featured).slice(0, 6)
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await getProjects()
  return projects.find((p) => p.slug === slug)
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const projects = await getProjects()
  return projects.find((p) => p.id === id)
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const projects = await getProjects()
  const now = new Date().toISOString()
  const baseSlug = slugify(input.slug || input.title)
  const slug = ensureUniqueSlug(
    baseSlug,
    projects.map((p) => p.slug),
  )

  const project: Project = {
    id: `proj-${Date.now()}`,
    title: input.title.trim(),
    slug,
    tag: input.tag.trim(),
    description: input.description.trim(),
    content: input.content.trim(),
    image: input.image.trim(),
    url: input.url.trim(),
    featured: Boolean(input.featured),
    order: Number.isFinite(input.order) ? input.order : projects.length + 1,
    createdAt: now,
    updatedAt: now,
  }

  projects.push(project)
  await writeJsonFile("projects.json", projects)
  return project
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project | null> {
  const projects = await getProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null

  const current = projects[index]
  const nextTitle = input.title?.trim() ?? current.title
  const requestedSlug = slugify(input.slug || nextTitle)
  const slug = ensureUniqueSlug(
    requestedSlug,
    projects.filter((p) => p.id !== id).map((p) => p.slug),
    id,
  )

  const updated: Project = {
    ...current,
    title: nextTitle,
    slug,
    tag: input.tag?.trim() ?? current.tag,
    description: input.description?.trim() ?? current.description,
    content: input.content?.trim() ?? current.content,
    image: input.image?.trim() ?? current.image,
    url: input.url?.trim() ?? current.url,
    featured: input.featured !== undefined ? Boolean(input.featured) : current.featured,
    order: input.order !== undefined && Number.isFinite(input.order) ? input.order : current.order,
    updatedAt: new Date().toISOString(),
  }

  projects[index] = updated
  await writeJsonFile("projects.json", projects)
  return updated
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects()
  const next = projects.filter((p) => p.id !== id)
  if (next.length === projects.length) return false
  await writeJsonFile("projects.json", next)
  return true
}

export async function getBlogs(includeDrafts = false): Promise<BlogPost[]> {
  const blogs = await readJsonFile<BlogPost[]>("blogs.json")
  const filtered = includeDrafts ? blogs : blogs.filter((b) => b.published)
  return filtered.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const blogs = await getBlogs(true)
  return blogs.find((b) => b.slug === slug)
}

export async function getBlogById(id: string): Promise<BlogPost | undefined> {
  const blogs = await getBlogs(true)
  return blogs.find((b) => b.id === id)
}

export async function createBlog(input: BlogInput): Promise<BlogPost> {
  const blogs = await getBlogs(true)
  const now = new Date().toISOString()
  const baseSlug = slugify(input.slug || input.title)
  const slug = ensureUniqueSlug(
    baseSlug,
    blogs.map((b) => b.slug),
  )

  const blog: BlogPost = {
    id: `blog-${Date.now()}`,
    title: input.title.trim(),
    slug,
    tag: input.tag.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    image: input.image.trim(),
    published: Boolean(input.published),
    publishedAt: input.publishedAt || now,
    createdAt: now,
    updatedAt: now,
  }

  blogs.push(blog)
  await writeJsonFile("blogs.json", blogs)
  return blog
}

export async function updateBlog(id: string, input: Partial<BlogInput>): Promise<BlogPost | null> {
  const blogs = await getBlogs(true)
  const index = blogs.findIndex((b) => b.id === id)
  if (index === -1) return null

  const current = blogs[index]
  const nextTitle = input.title?.trim() ?? current.title
  const requestedSlug = slugify(input.slug || nextTitle)
  const slug = ensureUniqueSlug(
    requestedSlug,
    blogs.filter((b) => b.id !== id).map((b) => b.slug),
    id,
  )

  const updated: BlogPost = {
    ...current,
    title: nextTitle,
    slug,
    tag: input.tag?.trim() ?? current.tag,
    excerpt: input.excerpt?.trim() ?? current.excerpt,
    content: input.content?.trim() ?? current.content,
    image: input.image?.trim() ?? current.image,
    published: input.published !== undefined ? Boolean(input.published) : current.published,
    publishedAt: input.publishedAt || current.publishedAt,
    updatedAt: new Date().toISOString(),
  }

  blogs[index] = updated
  await writeJsonFile("blogs.json", blogs)
  return updated
}

export async function deleteBlog(id: string): Promise<boolean> {
  const blogs = await getBlogs(true)
  const next = blogs.filter((b) => b.id !== id)
  if (next.length === blogs.length) return false
  await writeJsonFile("blogs.json", next)
  return true
}
