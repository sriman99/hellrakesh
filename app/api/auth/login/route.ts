import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user
    const user = await usersCollection.findOne({ email, role })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
      ...(user.role === "company" && { companyName: user.companyName }),
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...(user.role === "company" && {
          companyName: user.companyName,
          interviewQuota: user.interviewQuota,
          interviewsUsed: user.interviewsUsed,
        }),
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
