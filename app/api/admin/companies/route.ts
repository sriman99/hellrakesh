import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    if (!db) {
      console.error("Database connection failed")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const usersCollection = db.collection<User>("users")
    const companies = await usersCollection.find({ role: "company" }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ companies })
  } catch (error) {
    console.error("Get companies error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, interviewQuota, addToExisting } = body

    if (!companyId || interviewQuota === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!ObjectId.isValid(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 })
    }

    const db = await getDatabase()
    if (!db) {
      console.error("Database connection failed")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const usersCollection = db.collection<User>("users")
    const company = await usersCollection.findOne({ _id: new ObjectId(companyId), role: "company" })
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const updateQuery = addToExisting
      ? { $inc: { interviewQuota: Number.parseInt(interviewQuota) }, $set: { updatedAt: new Date() } }
      : { $set: { interviewQuota: Number.parseInt(interviewQuota), updatedAt: new Date() } }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(companyId), role: "company" },
      updateQuery,
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update company quota" }, { status: 500 })
    }

    return NextResponse.json({ message: "Company quota updated successfully" })
  } catch (error) {
    console.error("Update company quota error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
