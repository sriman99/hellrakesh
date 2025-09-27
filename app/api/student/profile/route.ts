import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"

// GET - Retrieve student profile
export async function GET(request: NextRequest) {
    try {
        // Authenticate student
        const studentAuth = await getCurrentStudent()
        if (!studentAuth) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const db = await getDatabase()
        const studentsCollection = db.collection("students")

        // Find student by email
        const student = await studentsCollection.findOne({
            email: studentAuth.email
        })

        if (!student) {
            return NextResponse.json({
                error: "Student not found"
            }, { status: 404 })
        }

        // Return profile data (excluding sensitive information)
        return NextResponse.json({
            student: {
                _id: student._id,
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName,
                practiceQuota: student.practiceQuota || 10,
                practiceUsed: student.practiceUsed || 0,
                createdAt: student.createdAt
            }
        })

    } catch (error) {
        console.error("Get student profile error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}

// PUT - Update student profile
export async function PUT(request: NextRequest) {
    try {
        const studentAuth = await getCurrentStudent()
        if (!studentAuth) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const profileData = await request.json()
        const db = await getDatabase()
        const studentsCollection = db.collection("students")

        // Prepare update object
        const updateData: any = {
            updatedAt: new Date()
        }

        // Add fields to update if provided
        if (profileData.firstName) updateData.firstName = profileData.firstName.trim()
        if (profileData.lastName) updateData.lastName = profileData.lastName.trim()

        // Update student profile by email
        const result = await studentsCollection.updateOne(
            { email: studentAuth.email },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({
                error: "Student not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            message: "Profile updated successfully"
        })

    } catch (error) {
        console.error("Update student profile error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}