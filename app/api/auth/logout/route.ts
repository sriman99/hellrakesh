import { NextResponse } from "next/server"
import { removeAuthCookie } from "@/lib/auth"
import { removeStudentAuthCookie } from "@/lib/utils/studentAuth"

export async function POST() {
  try {
    // Clear both company and student auth cookies to prevent conflicts
    await removeAuthCookie()
    await removeStudentAuthCookie()

    console.log('🚪 User logged out - cleared both auth tokens')
    return NextResponse.json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
