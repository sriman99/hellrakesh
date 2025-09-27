"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import InterviewHeader from "./components/InterviewHeader"
import WelcomeStep from "./components/WelcomeStep"
import PermissionsStep from "./components/PermissionsStep"
import InterviewStep from "./components/InterviewStep"
import CompletionStep from "./components/CompletionStep"
import { useInterviewData } from "./hooks/useInterviewData"
import { useMediaStream } from "./hooks/useMediaStream"
import { useInterviewFlow } from "./hooks/useInterviewFlow"

export default function InterviewPage() {
  const params = useParams()
  const interviewId = params.id as string

  // Custom hooks for data and media
  const { interviewData, loading, error, updateInterviewStatus } = useInterviewData(interviewId)
  const {
    mediaStream,
    hasPermissions,
    isCameraOn,
    isMicOn,
    devices,
    requestPermissions,
    toggleCamera,
    toggleMic,
    cleanup
  } = useMediaStream()

  // Main interview flow hook that orchestrates everything
  const interview = useInterviewFlow(interviewId, interviewData, mediaStream, updateInterviewStatus)

  // Handle body overflow for fullscreen interview
  useEffect(() => {
    if (interview.currentStep === "interview") {
      document.body.style.overflow = 'hidden'
      document.body.style.margin = '0'
      document.body.style.padding = '0'
    } else {
      document.body.style.overflow = 'auto'
      document.body.style.margin = ''
      document.body.style.padding = ''
    }

    return () => {
      document.body.style.overflow = 'auto'
      document.body.style.margin = ''
      document.body.style.padding = ''
    }
  }, [interview.currentStep])

  // Enhanced permission handler that connects media stream
  const handleRequestPermissions = async (deviceId?: string) => {
    try {
      await requestPermissions(deviceId)
      interview.setCurrentStep("interview")
    } catch (error) {
      console.error("Permission denied:", error)
      alert("Camera and microphone access are required for this interview.")
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !interviewData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error || "Interview not found"}</p>
        </div>
      </div>
    )
  }

  // Calculate total duration
  const totalDuration = interviewData.template.questions.reduce(
    (total: number, q: any) => total + q.timeLimit,
    0
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <InterviewHeader candidateName={interviewData.interview.candidateName} />

      {/* Interview Step - Full Screen */}
      {interview.currentStep === "interview" && (
        <InterviewStep
          mediaStream={mediaStream}
          elevenLabsAudioUrl={interview.elevenLabsAudioUrl}
          isAgentSpeaking={interview.isAgentSpeaking}
          interviewStarted={interview.interviewStarted}
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
          candidateName={interviewData.interview.candidateName}
          interviewId={interviewId}
          onToggleCamera={toggleCamera}
          onToggleMic={toggleMic}
          onStartInterview={interview.handleStartInterview}
          onEndInterview={interview.handleEndInterview}
          onAgentAudioEnd={interview.handleAgentAudioEnd}
        />
      )}

      {/* Non-interview content container */}
      {interview.currentStep !== "interview" && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Step */}
            {interview.currentStep === "welcome" && (
              <WelcomeStep
                candidateName={interviewData.interview.candidateName}
                candidateEmail={interviewData.interview.candidateEmail}
                templateTitle={interviewData.template.title}
                templateDescription={interviewData.template.description}
                questionsCount={interviewData.template.questions.length}
                totalDuration={totalDuration}
                onStartInterview={() => interview.setCurrentStep("permissions")}
              />
            )}

            {/* Permissions Step */}
            {interview.currentStep === "permissions" && (
              <PermissionsStep
                devices={devices}
                onRequestPermissions={handleRequestPermissions}
              />
            )}

            {/* Completion Step */}
            {interview.currentStep === "complete" && (
              <CompletionStep
                completionData={interview.completionData}
                loadingResults={interview.loadingResults}
                questionsCount={interviewData.template.questions.length}
                totalDuration={totalDuration}
                companyName={interviewData.companyName}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}