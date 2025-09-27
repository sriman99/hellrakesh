import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth"
import type { Student, StudentRegistration } from "@/lib/models/Student"

export async function POST(request: NextRequest) {
    try {
        const registrationData: StudentRegistration = await request.json()

        const {
            email,
            password,
            firstName,
            lastName,
            university,
            major,
            graduationYear,
            targetRole,
            phoneNumber,
            agreeToTerms,
        } = registrationData

        // Basic validation
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({
                error: "Email, password, first name, and last name are required"
            }, { status: 400 })
        }

        if (!agreeToTerms) {
            return NextResponse.json({
                error: "You must agree to the terms and conditions"
            }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({
                error: "Password must be at least 6 characters long"
            }, { status: 400 })
        }

        const db = await getDatabase()
        const studentsCollection = db.collection<Student>("students")

        // Check if student already exists
        const existingStudent = await studentsCollection.findOne({ email })
        if (existingStudent) {
            return NextResponse.json({
                error: "An account with this email already exists"
            }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create student document
        const now = new Date()
        const quotaResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        const newStudent: Student = {
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            university: university?.trim(),
            major: major?.trim(),
            graduationYear,
            targetRole: targetRole?.trim(),
            phoneNumber: phoneNumber?.trim(),
            isEmailVerified: true, // Set to true for demo
            loginCount: 0,
            accountStatus: "active",
            practiceQuota: 10, // Free tier gets 10 sessions per month
            practiceUsed: 0,
            quotaResetDate,
            sessions: [],
            analytics: {
                totalSessions: 0,
                completedSessions: 0,
                averageScore: 0,
                timeSpent: 0,
                improvementTrend: [],
                strongAreas: [],
                weakAreas: [],
                lastActivity: now,
                streakDays: 0,
                preferredPracticeTime: "afternoon",
                skillProgress: {
                    communication: 0,
                    technicalKnowledge: 0,
                    problemSolving: 0,
                    confidence: 0,
                    professionalism: 0
                }
            },
            preferences: {
                emailNotifications: true,
                practiceReminders: true,
                reminderFrequency: "weekly",
                preferredDifficulty: "beginner",
                focusAreas: [],
                language: "en",
                timezone: "UTC"
            },
            subscriptionTier: "free",
            createdAt: now,
            updatedAt: now
        }

        // Insert student into database
        const result = await studentsCollection.insertOne(newStudent)

        // Generate JWT token
        const token = generateToken({
            userId: result.insertedId.toString(),
            email: newStudent.email,
            role: "student" as any,
            firstName: newStudent.firstName,
            lastName: newStudent.lastName,
        })

        // Set authentication cookie
        await setAuthCookie(token)

        return NextResponse.json({
            message: "Registration successful",
            student: {
                id: result.insertedId,
                email: newStudent.email,
                firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                university: newStudent.university,
                major: newStudent.major,
                targetRole: newStudent.targetRole,
                subscriptionTier: newStudent.subscriptionTier,
                practiceQuota: newStudent.practiceQuota,
                practiceUsed: newStudent.practiceUsed,
                accountStatus: newStudent.accountStatus,
                isEmailVerified: newStudent.isEmailVerified,
                loginCount: 0,
                createdAt: newStudent.createdAt
            }
        }, { status: 201 })

    } catch (error) {
        console.error("Student registration error:", error)

        // Handle duplicate key error
        if (error instanceof Error && 'code' in error && error.code === 11000) {
            return NextResponse.json({
                error: "An account with this email already exists"
            }, { status: 409 })
        }

        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 })
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