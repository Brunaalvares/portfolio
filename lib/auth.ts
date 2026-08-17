import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

export const ADMIN_COOKIE = "ba_admin_session"

function getUsername(): string {
  return process.env.ADMIN_USERNAME || "bruna-admin"
}

function getPassword(): string {
  return process.env.ADMIN_PASSWORD || "portfoliodabruna"
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "bruna-portfolio-secret"
}

function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

export function createSessionToken(): string {
  return createHmac("sha256", getSecret())
    .update(`${getUsername()}:${getPassword()}`)
    .digest("hex")
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false
  return safeEqual(token, createSessionToken())
}

export function verifyCredentials(username: string, password: string): boolean {
  return safeEqual(username, getUsername()) && safeEqual(password, getPassword())
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
