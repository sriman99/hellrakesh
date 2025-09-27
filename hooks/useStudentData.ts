import { useState, useEffect } from "react"

interface StudentData {
    id: string
    email: string
    firstName: string
    lastName: string
    major: string
    university: string
    graduationYear: number
}

interface Analytics {
    totalSessions: number
    completedSessions: number
    averageScore: number
    timeSpent: number
    streakDays: number
    improvementData: Array<{
        session: number
        score: number
        date: string
    }>
    skillsData: Array<{
        skill: string
        score: number
        fullMark: number
    }>
    sessionTypeData: Array<{
        name: string
        value: number
        percentage: number
    }>
    weeklyData: Array<{
        day: string
        sessions: number
    }>
    recentSessions: Array<{
        id: string
        title: string
        type: string
        difficulty: string
        duration: number
        score?: number
        completedAt?: Date
        createdAt: Date
    }>
}

export function useStudentData() {
    const [student, setStudent] = useState<StudentData | null>(null)
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStudentData() {
            try {
                setIsLoading(true)

                // Fetch student profile
                const profileResponse = await fetch('/api/student/profile')
                if (!profileResponse.ok) {
                    if (profileResponse.status === 401) {
                        setError('unauthorized')
                        return
                    }
                    throw new Error('Failed to fetch profile')
                }

                const profileData = await profileResponse.json()
                setStudent(profileData.student)

                // Fetch analytics
                const analyticsResponse = await fetch('/api/student/analytics')
                if (analyticsResponse.ok) {
                    const analyticsData = await analyticsResponse.json()
                    setAnalytics(analyticsData.analytics)
                } else {
                    // Set default analytics if fetch fails
                    setAnalytics({
                        totalSessions: 0,
                        completedSessions: 0,
                        averageScore: 0,
                        timeSpent: 0,
                        streakDays: 0,
                        improvementData: [],
                        skillsData: [],
                        sessionTypeData: [],
                        weeklyData: [],
                        recentSessions: []
                    })
                }
            } catch (err) {
                console.error('Error fetching student data:', err)
                setError('Failed to load data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchStudentData()
    }, [])

    return { student, analytics, isLoading, error }
}