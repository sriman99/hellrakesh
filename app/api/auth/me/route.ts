import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const userData = await usersCollection.findOne({ _id: new ObjectId(user.userId) })
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      companyName: userData.companyName,
      interviewQuota: userData.interviewQuota || 0,
      interviewsUsed: userData.interviewsUsed || 0,
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
