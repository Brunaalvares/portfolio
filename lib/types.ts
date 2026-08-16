export type Project = {
  id: string
  title: string
  slug: string
  tag: string
  description: string
  content: string
  image: string
  url: string
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  tag: string
  excerpt: string
  content: string
  image: string
  published: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export type ProjectInput = Omit<Project, "id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string
}

export type BlogInput = Omit<BlogPost, "id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
