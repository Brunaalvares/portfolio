import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default async function AdminLoginRedirect({
  children,
}: {
  children: React.ReactNode
}) {
  if (await isAuthenticated()) {
    redirect("/admin")
  }
  return children
}
