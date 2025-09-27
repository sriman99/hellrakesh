import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (role === "company" && !companyName) {
      return NextResponse.json({ error: "Company name is required for company accounts" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser: Omit<User, "_id"> = {
      email,
      password: hashedPassword,
      name,
      role,
      ...(role === "company" && {
        companyName,
        interviewQuota: 10, // Default quota
        interviewsUsed: 0,
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    // Generate JWT token
    const token = generateToken({
      userId: result.insertedId.toString(),
      email,
      role,
      ...(role === "company" && { companyName }),
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: result.insertedId,
        email,
        name,
        role,
        ...(role === "company" && { companyName }),
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
