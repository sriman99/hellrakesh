import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"

// GET - Retrieve specific practice session for interview
export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        // Authenticate student
        const student = await getCurrentStudent()
        if (!student) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const { sessionId } = await params

        if (!sessionId) {
            return NextResponse.json({
                error: "Session ID is required"
            }, { status: 400 })
        }

        const db = await getDatabase()

        // Find practice session by sessionId
        const session = await db.collection('practice_sessions').findOne({
            sessionId: sessionId,
            studentEmail: student.email
        })

        if (!session) {
            return NextResponse.json({
                error: "Practice session not found"
            }, { status: 404 })
        }

        // Get template details from correct collection
        const template = await db.collection('templates').findOne({
            _id: new ObjectId(session.templateId)
        })

        if (!template) {
            return NextResponse.json({
                error: "Template not found"
            }, { status: 404 })
        }

        // Format the response to match the interview API structure
        const practiceData = {
            interview: {
                candidateName: student.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : student.email,
                candidateEmail: student.email,
                status: session.status,
                sessionId: session.sessionId,
                isPractice: true
            },
            template: {
                title: template.title,
                description: template.description,
                questions: template.questions,
                agentId: template.agentId,
                estimatedDuration: template.estimatedDuration
            },
            companyName: "Practice Mode",
            session: session
        }

        return NextResponse.json(practiceData)

    } catch (error) {
        console.error("Get practice session error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}

// PATCH - Update practice session
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        // Authenticate student
        const student = await getCurrentStudent()
        if (!student) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const { sessionId } = await params
        const {
            responses,
            status,
            score,
            feedback,
            audioUrl,
            audioS3,
            videoUrl,
            videoS3,
            transcript,
            analysis,
            finalScore,
            conversationId
        } = await request.json()

        if (!sessionId) {
            return NextResponse.json({
                error: "Session ID is required"
            }, { status: 400 })
        }

        const db = await getDatabase()

        // Prepare update data
        const now = new Date()
        const updateData: any = { updatedAt: now }

        if (responses) updateData.responses = responses
        if (status) {
            updateData.status = status
            if (status === 'completed') {
                updateData.completedAt = now
            }
        }
        if (score !== undefined) updateData.score = score
        if (feedback) updateData.feedback = feedback
        if (audioUrl) updateData.audioUrl = audioUrl
        if (audioS3) updateData.audioS3 = audioS3
        if (videoUrl) updateData.videoUrl = videoUrl
        if (videoS3) updateData.videoS3 = videoS3
        if (transcript) updateData.transcript = transcript
        if (analysis) updateData.analysis = analysis
        if (finalScore) updateData.finalScore = finalScore
        if (conversationId) updateData.conversationId = conversationId

        // Calculate duration if completing session
        if (status === 'completed') {
            const session = await db.collection('practice_sessions').findOne({
                sessionId: sessionId,
                studentEmail: student.email
            })

            if (session) {
                const duration = Math.floor((now.getTime() - new Date(session.startedAt).getTime()) / 1000)
                updateData.duration = duration
            }
        }

        // Update the specific session
        const result = await db.collection('practice_sessions').updateOne(
            {
                sessionId: sessionId,
                studentEmail: student.email
            },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({
                error: "Practice session not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Practice session updated successfully"
        })

    } catch (error) {
        console.error("Update practice session error:", error)
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
            'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}