import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword } from "@/lib/auth"
import { generateStudentToken, setStudentAuthCookie } from "@/lib/utils/studentAuth"
import type { Student } from "@/lib/models/Student"

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        const db = await getDatabase()
        const studentsCollection = db.collection<Student>("students")

        // Find student
        const student = await studentsCollection.findOne({ email })
        if (!student) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Check account status
        if (student.accountStatus === "suspended") {
            return NextResponse.json({ error: "Account has been suspended. Please contact support." }, { status: 403 })
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, student.password)
        if (!isValidPassword) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Update login information
        const now = new Date()
        await studentsCollection.updateOne(
            { _id: student._id },
            {
                $set: {
                    lastLoginAt: now,
                    updatedAt: now
                },
                $inc: { loginCount: 1 }
            }
        )

        // Generate JWT token
        const token = generateStudentToken({
            studentId: student._id!.toString(),
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
            subscriptionTier: student.subscriptionTier || "free",
            accountStatus: student.accountStatus || "active",
            practiceQuota: student.practiceQuota || 0,
            practiceUsed: student.practiceUsed || 0,
        })

        // Set cookie
        await setStudentAuthCookie(token)

        return NextResponse.json({
            message: "Login successful",
            student: {
                id: student._id,
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName,
                university: student.university,
                major: student.major,
                targetRole: student.targetRole,
                subscriptionTier: student.subscriptionTier,
                practiceQuota: student.practiceQuota,
                practiceUsed: student.practiceUsed,
                accountStatus: student.accountStatus,
                isEmailVerified: student.isEmailVerified,
                loginCount: student.loginCount + 1,
                createdAt: student.createdAt,
                lastLoginAt: now
            },
        })
    } catch (error) {
        console.error("Student login error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}