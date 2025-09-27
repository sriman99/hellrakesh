import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"

// Helper function to generate secure session ID
function generateSecureSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// GET - Retrieve practice sessions for student
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
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const status = url.searchParams.get('status')

        // Build query
        const query: any = {
            studentEmail: student.email
        }

        if (status && status !== 'all') {
            query.status = status
        }

        // Get practice sessions
        const sessions = await db.collection('practice_sessions')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray()

        // Format sessions for dashboard
        const formattedSessions = sessions.map(session => ({
            id: session.sessionId,
            templateId: session.templateId,
            title: session.templateTitle,
            type: session.sessionType || "practice",
            difficulty: session.difficulty || "intermediate",
            category: session.category || "general",
            duration: session.duration || 0,
            score: session.score,
            status: session.status,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
            createdAt: session.createdAt
        }))

        return NextResponse.json({
            sessions: formattedSessions,
            totalCount: sessions.length
        })

    } catch (error) {
        console.error("Get practice sessions error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}

// POST - Create new practice session
export async function POST(request: NextRequest) {
    try {
        // Authenticate student
        const student = await getCurrentStudent()
        if (!student) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const { templateId } = await request.json()

        if (!templateId || !ObjectId.isValid(templateId)) {
            return NextResponse.json({
                error: "Valid template ID is required"
            }, { status: 400 })
        }

        const db = await getDatabase()

        // Get template details from correct collection
        const template = await db.collection('templates').findOne({
            _id: new ObjectId(templateId),
            isActive: true
        })

        if (!template) {
            return NextResponse.json({
                error: "Template not found or not available for practice"
            }, { status: 404 })
        }

        // Create new practice session with all required fields
        const sessionId = generateSecureSessionId()
        const now = new Date()

        const newSession = {
            sessionId,
            studentId: new ObjectId(student.studentId),
            studentEmail: student.email,
            templateId: new ObjectId(templateId),
            templateTitle: template.title,
            sessionType: "practice",
            difficulty: template.difficulty || "intermediate",
            category: template.category || "general",
            duration: 0,
            score: null,
            status: "not-started",
            startedAt: now,
            completedAt: null,
            responses: [],
            metadata: {
                sessionType: "practice",
                estimatedDuration: template.estimatedDuration,
                questionCount: template.questions?.length || 0
            },
            createdAt: now,
            updatedAt: now
        }

        // Insert session
        const result = await db.collection('practice_sessions').insertOne(newSession)

        if (!result.insertedId) {
            return NextResponse.json({
                error: "Failed to create practice session"
            }, { status: 500 })
        }

        // Update student's practiceUsed count
        const studentsCollection = db.collection("students")
        await studentsCollection.updateOne(
            { email: student.email },
            {
                $inc: { practiceUsed: 1 },
                $set: { updatedAt: now }
            }
        )

        return NextResponse.json({
            message: "Practice session created successfully",
            session: {
                sessionId,
                templateId,
                templateTitle: template.title,
                difficulty: template.difficulty || "intermediate",
                category: template.category || "general",
                status: "not-started",
                startedAt: now,
                template: {
                    id: template._id,
                    title: template.title,
                    description: template.description,
                    questions: template.questions,
                    estimatedDuration: template.estimatedDuration,
                    difficulty: template.difficulty || "intermediate",
                    category: template.category || "general",
                    agentId: template.agentId
                }
            }
        }, { status: 201 })

    } catch (error) {
        console.error("Create practice session error:", error)
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
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}