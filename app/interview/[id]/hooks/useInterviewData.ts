import { useState, useEffect } from "react"

interface InterviewData {
  interview: {
    candidateName: string
    candidateEmail: string
  }
  template: {
    title: string
    description: string
    questions: Array<{
      id: string
      question: string
      timeLimit: number
    }>
  }
  companyName: string
}

export function useInterviewData(interviewId: string) {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        console.log(`🔍 Fetching interview data for ID: ${interviewId}`)

        // Use the unified interviews endpoint that handles both uniqueLink and ObjectId
        const response = await fetch(`/api/interviews/${interviewId}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Interview data fetched successfully for: ${data.interview?.candidateName}`)
          setInterviewData(data)
          setLoading(false)
        } else {
          const errorData = await response.json()
          console.error(`❌ Failed to fetch interview data: ${response.status}`, errorData)
          setError(errorData.error || "Failed to fetch interview data")
          setLoading(false)
        }
      } catch (err) {
        console.error(`❌ Network error fetching interview data:`, err)
        setError("Network error. Please try again.")
        setLoading(false)
      }
    }

    if (interviewId) {
      fetchInterview()
    }
  }, [interviewId])

  const updateInterviewStatus = async (status: string) => {
    try {
      console.log(`🔄 Updating interview status to: ${status}`)

      // Use the unified interviews endpoint for updates
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        console.log(`✅ Interview status updated successfully to: ${status}`)
      } else {
        const errorData = await response.json()
        console.error(`❌ Failed to update interview status:`, errorData)
      }
    } catch (error) {
      console.error("❌ Error updating interview status:", error)
    }
  }

  return {
    interviewData,
    loading,
    error,
    updateInterviewStatus
  }
}