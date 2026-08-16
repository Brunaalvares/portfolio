import { NextResponse } from "next/server"
import { createSessionToken, sessionCookieOptions, verifyPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = String(body.password || "")

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    const token = createSessionToken()
    const response = NextResponse.json({ ok: true })
    const options = sessionCookieOptions(token)
    response.cookies.set(options)
    return response
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }
}
