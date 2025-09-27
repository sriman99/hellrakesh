import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"

// GET - Retrieve available practice templates
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
        const templatesCollection = db.collection("templates")

        // Get query parameters
        const url = new URL(request.url)
        const difficulty = url.searchParams.get('difficulty')
        const category = url.searchParams.get('category')
        const duration = url.searchParams.get('duration')
        const search = url.searchParams.get('search')
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')

        // Build query - only show active templates
        const query: any = {
            isActive: true
        }

        // Add filters
        if (difficulty) {
            query.difficulty = difficulty
        }

        if (category) {
            query.category = category
        }

        if (duration) {
            const maxDuration = parseInt(duration)
            query.estimatedDuration = { $lte: maxDuration }
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'questions.question': { $regex: search, $options: 'i' } }
            ]
        }

        // Calculate pagination
        const skip = (page - 1) * limit

        // Get templates with pagination
        const [templates, totalCount] = await Promise.all([
            templatesCollection
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            templatesCollection.countDocuments(query)
        ])

        // Get student quota information
        const studentsCollection = db.collection("students")
        const studentDoc = await studentsCollection.findOne({
            email: student.email
        })

        const practiceStats = studentDoc ? {
            practiceUsed: studentDoc.practiceUsed || 0,
            practiceQuota: studentDoc.practiceQuota || 10,
            remainingSessions: (studentDoc.practiceQuota || 10) - (studentDoc.practiceUsed || 0)
        } : {
            practiceUsed: 0,
            practiceQuota: 10,
            remainingSessions: 10
        }

        return NextResponse.json({
            templates: templates.map(template => ({
                _id: template._id,
                title: template.title,
                description: template.description,
                estimatedDuration: template.estimatedDuration,
                difficulty: template.difficulty || 'intermediate',
                category: template.category || 'general',
                questions: template.questions || [],
                questionCount: template.questions?.length || 0,
                createdAt: template.createdAt,
                companyName: template.companyName,
                isPublic: true,
                practiceAllowed: true
            })),
            practiceStats,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        })

    } catch (error) {
        console.error("Get practice templates error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}

// GET specific template details for practice
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

        if (!templateId) {
            return NextResponse.json({
                error: "Template ID is required"
            }, { status: 400 })
        }

        // Validate ObjectId
        if (!ObjectId.isValid(templateId)) {
            return NextResponse.json({
                error: "Invalid template ID"
            }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("templates")

        // Get template details
        const template = await templatesCollection.findOne({
            _id: new ObjectId(templateId),
            isActive: true
        })

        if (!template) {
            return NextResponse.json({
                error: "Template not found or not available for practice"
            }, { status: 404 })
        }

        // Return full template details for practice session
        return NextResponse.json({
            template: {
                id: template._id,
                title: template.title,
                description: template.description,
                questions: template.questions,
                estimatedDuration: template.estimatedDuration,
                difficulty: template.difficulty || 'intermediate',
                category: template.category || 'general',
                agentId: template.agentId,
                createdAt: template.createdAt
            }
        })

    } catch (error) {
        console.error("Get template details error:", error)
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