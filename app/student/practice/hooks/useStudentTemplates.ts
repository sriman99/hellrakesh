import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Template {
    _id: string
    title: string
    description: string
    estimatedDuration: number
    difficulty: "beginner" | "intermediate" | "advanced"
    category: string
    questionCount: number
    isPublic: boolean
    practiceAllowed: boolean
}

interface StudentQuota {
    practiceUsed: number
    practiceQuota: number
    remainingSessions: number
}

export function useStudentTemplates() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [studentQuota, setStudentQuota] = useState<StudentQuota | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/practice/templates')
            if (response.ok) {
                const data = await response.json()
                console.log('API Response:', data) // Debug log
                console.log('Practice Stats:', data.practiceStats) // Debug log
                console.log('Templates received:', data.templates) // Debug log
                console.log('First template structure:', data.templates[0]) // Debug log
                setTemplates(data.templates)
                setStudentQuota(data.practiceStats)
            } else if (response.status === 401) {
                router.push('/student/login')
            } else {
                console.error('API Error:', response.status, response.statusText)
            }
        } catch (error) {
            console.error('Error fetching templates:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const startInterview = async (templateId: string) => {
        if (!studentQuota || studentQuota.remainingSessions <= 0) {
            alert("You've reached your practice session limit. Please upgrade your subscription.")
            return
        }

        console.log('=== STUDENT START PRACTICE SESSION DEBUG ===')
        console.log('Template ID received:', templateId)
        console.log('Template ID type:', typeof templateId)
        console.log('Template ID length:', templateId?.length)
        console.log('Student Quota:', studentQuota)

        if (!templateId) {
            console.error('❌ Template ID is missing!')
            alert('Template ID is missing. Please refresh the page and try again.')
            return
        }

        // Create practice session data for student practice endpoint
        const requestData = {
            templateId
        }
        console.log('🎓 Creating STUDENT practice session with data:', requestData)

        try {
            // Use the student practice sessions endpoint instead of unified interviews
            const response = await fetch('/api/practice/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            })

            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Practice session created successfully:', data)

                // Extract session ID from response
                const sessionId = data.session?.sessionId

                if (sessionId) {
                    // Open practice session in NEW TAB
                    console.log(`🎯 Opening practice session in new tab: ${sessionId}`)
                    window.open(`/practice/${sessionId}`, '_blank')

                    // Optionally redirect current tab back to dashboard after a short delay
                    setTimeout(() => {
                        router.push('/student/dashboard')
                    }, 1000)
                } else {
                    console.error('❌ No session ID found in response')
                    alert('Practice session was created but ID is missing. Please try again.')
                }
            } else {
                const error = await response.json()
                console.log('❌ Error response:', error)

                if (response.status === 401) {
                    alert('Authentication expired. Please log out and log back in, then try again.')
                    router.push('/student/login')
                } else if (response.status === 403) {
                    alert(error.error || 'Practice quota exceeded. Please upgrade your subscription.')
                } else if (response.status === 404) {
                    alert('Template not found or not available for practice sessions.')
                } else if (response.status === 400) {
                    alert(error.error || 'Invalid request. Please try again.')
                } else {
                    alert(error.error || 'Failed to start practice session. Please try again.')
                }
            }
        } catch (error) {
            console.error('Error starting practice session:', error)
            alert('Network error. Please try again.')
        }
    }

    return {
        templates,
        studentQuota,
        isLoading,
        startInterview
    }
}
