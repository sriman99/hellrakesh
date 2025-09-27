import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
    try {
        // Authenticate student
        const currentStudent = await getCurrentStudent()
        if (!currentStudent) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const db = await getDatabase()
        const interviewsCollection = db.collection("interviews")

        // Fetch student's practice interviews (support both old and new metadata structures)
        const interviews = await interviewsCollection.find({
            companyId: new ObjectId(currentStudent.studentId),
            $or: [
                { isStudentPractice: true }, // Legacy format
                { "metadata.sessionType": "practice" } // New format
            ]
        }).sort({ createdAt: -1 }).toArray()

        // Calculate analytics from interview data
        const completedSessions = interviews.filter(i => i.status === 'completed')
        const totalSessions = interviews.length

        // Calculate average score (placeholder - you can implement actual scoring)
        const averageScore = completedSessions.length > 0
            ? Math.round(Math.random() * 30 + 70) // Placeholder: random score between 70-100
            : 0

        // Calculate total time spent (in hours) 
        let totalDuration = 0
        completedSessions.forEach(interview => {
            if (interview.responses && interview.responses.length > 0) {
                const firstResponse = interview.responses[0]
                const lastResponse = interview.responses[interview.responses.length - 1]
                if (firstResponse.timestamp && lastResponse.timestamp) {
                    totalDuration += (new Date(lastResponse.timestamp).getTime() - new Date(firstResponse.timestamp).getTime()) / 1000
                }
            }
        })
        const timeSpentHours = Math.round((totalDuration / 3600) * 10) / 10

        // Get recent sessions from our new API
        const sessionsResponse = await fetch(`${request.nextUrl.origin}/api/student/sessions`, {
            headers: {
                'Cookie': request.headers.get('Cookie') || ''
            }
        })

        let recentSessions = []
        if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json()
            recentSessions = sessionsData.recentSessions || []
        }

        // Default analytics structure
        const analytics = {
            totalSessions,
            completedSessions: completedSessions.length,
            averageScore,
            timeSpent: timeSpentHours,
            streakDays: Math.floor(Math.random() * 7), // Placeholder
            improvementData: [],
            skillsData: [
                { skill: 'Communication', score: averageScore - 5, fullMark: 100 },
                { skill: 'Technical', score: averageScore, fullMark: 100 },
                { skill: 'Problem Solving', score: averageScore + 5, fullMark: 100 },
                { skill: 'Confidence', score: averageScore - 10, fullMark: 100 },
                { skill: 'Professionalism', score: averageScore + 2, fullMark: 100 }
            ],
            sessionTypeData: [
                { name: 'Technical', value: Math.max(1, Math.floor(totalSessions * 0.6)), percentage: 60 },
                { name: 'Behavioral', value: Math.max(1, Math.floor(totalSessions * 0.3)), percentage: 30 },
                { name: 'Case Study', value: Math.max(1, Math.floor(totalSessions * 0.1)), percentage: 10 }
            ],
            weeklyData: [
                { day: 'Mon', sessions: Math.floor(Math.random() * 3) },
                { day: 'Tue', sessions: Math.floor(Math.random() * 3) },
                { day: 'Wed', sessions: Math.floor(Math.random() * 3) },
                { day: 'Thu', sessions: Math.floor(Math.random() * 3) },
                { day: 'Fri', sessions: Math.floor(Math.random() * 3) },
                { day: 'Sat', sessions: Math.floor(Math.random() * 2) },
                { day: 'Sun', sessions: Math.floor(Math.random() * 2) }
            ],
            recentSessions
        }

        return NextResponse.json({ analytics })

    } catch (error) {
        console.error("Get student analytics error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}