import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface PracticeData {
    interview: {
        candidateName: string
        candidateEmail: string
        status: "in-progress" | "completed" | "abandoned"
        sessionId: string
        isPractice: boolean
    }
    template: {
        title: string
        description: string
        questions: Array<{
            id: string
            type: "text" | "video"
            question: string
            timeLimit: number
            required: boolean
        }>
        agentId?: string
        estimatedDuration: number
    }
    companyName: string
    session: {
        sessionId: string
        templateId: string
        templateName: string
        status: "in-progress" | "completed" | "abandoned"
        startedAt: string
        responses: any[]
        duration: number
    }
}

export function usePracticeData(sessionId: string) {
    const [practiceData, setPracticeData] = useState<PracticeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!sessionId) {
            setError("Session ID is required")
            setLoading(false)
            return
        }

        fetchPracticeData()
    }, [sessionId])

    const fetchPracticeData = async () => {
        try {
            setLoading(true)
            setError(null)

            console.log(`🔍 Fetching practice session data for: ${sessionId}`)

            // Use the practice-specific endpoint
            const response = await fetch(`/api/practice/sessions/${sessionId}`)

            if (response.status === 401) {
                console.log('❌ Authentication required - redirecting to student login')
                router.push('/student/login')
                return
            }

            if (response.status === 404) {
                setError("Practice session not found or has expired")
                setLoading(false)
                return
            }

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log('✅ Practice session data received:', data)

            setPracticeData(data)
        } catch (err) {
            console.error('❌ Error fetching practice data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load practice session')
        } finally {
            setLoading(false)
        }
    }

    const updatePracticeStatus = async (status: "completed" | "abandoned", additionalData?: any) => {
        if (!sessionId) return

        try {
            console.log(`🔄 Updating practice session status to: ${status}`)

            const updateData = {
                status,
                ...additionalData
            }

            const response = await fetch(`/api/practice/sessions/${sessionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                console.log('✅ Practice session status updated successfully')
                // Refresh the data
                await fetchPracticeData()
            } else {
                const errorData = await response.json()
                console.error('❌ Failed to update practice session status:', errorData)
            }
        } catch (error) {
            console.error('❌ Error updating practice session status:', error)
        }
    }

    return {
        practiceData,
        loading,
        error,
        updatePracticeStatus,
        refreshData: fetchPracticeData
    }
}