import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

export const ADMIN_COOKIE = "ba_admin_session"

function getPassword(): string {
  return process.env.ADMIN_PASSWORD || "bruna-admin"
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "bruna-portfolio-secret"
}

export function createSessionToken(): string {
  return createHmac("sha256", getSecret()).update(getPassword()).digest("hex")
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false
  const expected = createSessionToken()
  try {
    const a = Buffer.from(token)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function verifyPassword(password: string): boolean {
  const expected = getPassword()
  try {
    const a = Buffer.from(password)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  return verifySessionToken(token)
}

export function sessionCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }
}
