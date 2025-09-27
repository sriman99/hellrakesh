import { useEffect, useCallback } from "react"
import { useInterviewState } from "./useInterviewState"
import { useRecording } from "./useRecording"
import { useElevenLabsAgent } from "./useElevenLabsAgent"
import { useAudioAnalysis } from "./useAudioAnalysis"

export function useInterviewFlow(
  interviewId: string,
  interviewData: any,
  mediaStream: MediaStream | null,
  updateInterviewStatus: (status: string) => Promise<void>
) {
  const interviewState = useInterviewState()
  const recording = useRecording(interviewId)
  const audioAnalysis = useAudioAnalysis()
  const agent = useElevenLabsAgent(audioAnalysis)

  // Timer effect for question time limits
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (interviewState.currentStep === "interview" &&
      interviewState.timeRemaining > 0 &&
      recording.isRecording) {
      interval = setInterval(() => {
        interviewState.decrementTimer()
        if (interviewState.timeRemaining <= 1) {
          handleNextQuestion()
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [interviewState.currentStep, interviewState.timeRemaining, recording.isRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioAnalysis.cleanup()
    }
  }, [])

  const handleRequestPermissions = useCallback(async (deviceId?: string) => {
    try {
      // This should be handled by useMediaStream hook
      interviewState.nextStep()
    } catch (error) {
      console.error("Permission denied:", error)
      alert("Camera and microphone access are required for this interview.")
    }
  }, [interviewState])

  const handleStartInterview = useCallback(() => {
    interviewState.startInterview()
    recording.startRecording(mediaStream!)
    agent.startAgentSession(interviewId)

    // Set initial timer if there are questions
    if (interviewData?.template?.questions?.[0]) {
      interviewState.resetTimer(interviewData.template.questions[0].timeLimit * 60)
    }

    console.log("Interview started")
  }, [interviewState, recording, agent, mediaStream, interviewId, interviewData])

  const handleNextQuestion = useCallback(() => {
    recording.stopRecording()

    if (interviewData &&
      interviewState.currentQuestionIndex < interviewData.template.questions.length - 1) {
      interviewState.nextQuestion()
      const nextQuestion = interviewData.template.questions[interviewState.currentQuestionIndex + 1]
      interviewState.resetTimer(nextQuestion.timeLimit * 60)
    } else {
      handleEndInterview()
    }
  }, [recording, interviewData, interviewState])

  const handleEndInterview = useCallback(async () => {
    recording.stopRecording()
    interviewState.completeInterview()

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
    }

    await agent.endAgentSession(interviewId)
    await updateInterviewStatus("completed")
    await fetchCompletionData()
  }, [recording, interviewState, mediaStream, agent, interviewId, updateInterviewStatus])

  const fetchCompletionData = useCallback(async () => {
    interviewState.setLoadingResults(true)
    try {
      // Wait a bit for backend processing to complete
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Try practice session API first
      let response = await fetch(`/api/practice/sessions/${interviewId}`)

      if (response.status === 401) {
        // If unauthorized for practice, try regular interview API
        response = await fetch(`/api/interviews/${interviewId}`)
      }

      if (response.ok) {
        const data = await response.json()
        interviewState.setCompletionData(data)
        console.log("Completion data fetched:", data)
      } else {
        console.error("Failed to fetch completion data")
      }
    } catch (error) {
      console.error("Error fetching completion data:", error)
    } finally {
      interviewState.setLoadingResults(false)
    }
  }, [interviewId, interviewState])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  return {
    // State from all hooks
    ...interviewState,
    ...recording,
    ...agent,
    audioData: audioAnalysis.audioData,

    // Actions
    handleRequestPermissions,
    handleStartInterview,
    handleNextQuestion,
    handleEndInterview,
    formatTime,
  }
}