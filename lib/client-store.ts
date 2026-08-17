export const PROJECTS_STORAGE_KEY = "ba_portfolio_projects"
export const BLOGS_STORAGE_KEY = "ba_portfolio_blogs"

export function readLocalJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeLocalJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function clearLocalJson(key: string): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(key)
}
