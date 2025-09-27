import { NextResponse } from "next/server"
import { removeStudentAuthCookie } from "@/lib/utils/studentAuth"
import { removeAuthCookie } from "@/lib/auth"

export async function POST() {
    try {
        // Clear both student and company auth cookies to prevent conflicts
        await removeStudentAuthCookie()
        await removeAuthCookie()

        console.log('🚪 Student logged out - cleared both auth tokens')
        return NextResponse.json({ message: "Student logout successful" })
    } catch (error) {
        console.error("Student logout error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}