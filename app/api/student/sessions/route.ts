import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
    try {
        // Authenticate student
        const student = await getCurrentStudent()
        if (!student) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const db = await getDatabase()

        // Find all practice sessions for this student
        const sessions = await db.collection('practice_sessions').find({
            studentEmail: student.email
        }).sort({ startedAt: -1 }).toArray()

        return NextResponse.json({ sessions })

    } catch (error) {
        console.error("Get student sessions error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}