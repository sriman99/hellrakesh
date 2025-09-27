"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePracticeData } from "./hooks/usePracticeData"
import { usePracticeMediaStream } from "./hooks/usePracticeMediaStream"
import { usePracticeFlow } from "./hooks/usePracticeFlow"
import PracticeWelcomeStep from "./components/PracticeWelcomeStep"
import PracticePermissionsStep from "./components/PracticePermissionsStep"
import PracticeInterviewStep from "./components/PracticeInterviewStep"
import PracticeCompletionStep from "./components/PracticeCompletionStep"

export default function PracticePage() {
    const params = useParams()
    const router = useRouter()
    const sessionId = params.sessionId as string

    // Custom hooks for data - practice-specific
    const { practiceData, loading, error, updatePracticeStatus } = usePracticeData(sessionId)

    // Media stream management
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
    } = usePracticeMediaStream()

    // Practice flow management
    const practice = usePracticeFlow(sessionId, practiceData, mediaStream, updatePracticeStatus)

    // Handle body overflow for fullscreen practice
    useEffect(() => {
        if (practice.currentStep === "interview") {
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
    }, [practice.currentStep])

    // Enhanced permission handler that connects media stream
    const handleRequestPermissions = async (deviceId?: string) => {
        try {
            await requestPermissions(deviceId)
            practice.setCurrentStep("interview")
        } catch (error) {
            console.error("Permission denied:", error)
            alert("Camera and microphone access are required for practice sessions.")
        }
    }

    // Handle back to dashboard
    const handleBackToDashboard = () => {
        cleanup()
        router.push('/student/dashboard')
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading practice session...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !practiceData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-destructive">Error</h1>
                    <p className="text-muted-foreground">{error || "Practice session not found"}</p>
                    <button
                        onClick={handleBackToDashboard}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    // Calculate total duration
    const totalDuration = practiceData.template.questions.reduce(
        (total: number, q: any) => total + q.timeLimit,
        0
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Practice Interview Step - Full Screen */}
            {practice.currentStep === "interview" && (
                <PracticeInterviewStep
                    mediaStream={mediaStream}
                    practiceStarted={practice.practiceStarted}
                    isCameraOn={isCameraOn}
                    isMicOn={isMicOn}
                    candidateName="Student"
                    sessionId={sessionId}
                    elevenLabsAudioUrl={practice.agent.elevenLabsAudioUrl}
                    isAgentSpeaking={practice.agent.isAgentSpeaking}
                    isRecording={practice.recording.isRecording}
                    onToggleCamera={toggleCamera}
                    onToggleMic={toggleMic}
                    onStartPractice={practice.handleStartPractice}
                    onEndPractice={practice.handleEndPractice}
                    onAgentAudioEnd={practice.agent.handleAgentAudioEnd}
                    onSystemAudioElementReady={practice.handleSystemAudioElementReady}
                />
            )}

            {/* Non-interview content container */}
            {practice.currentStep !== "interview" && (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Welcome Step */}
                        {practice.currentStep === "welcome" && (
                            <PracticeWelcomeStep
                                candidateName="Student"
                                templateTitle={practiceData.template.title}
                                templateDescription={practiceData.template.description}
                                questionsCount={practiceData.template.questions.length}
                                totalDuration={totalDuration}
                                onStartPractice={() => practice.setCurrentStep("permissions")}
                            />
                        )}

                        {/* Permissions Step */}
                        {practice.currentStep === "permissions" && (
                            <PracticePermissionsStep
                                devices={devices}
                                onRequestPermissions={handleRequestPermissions}
                            />
                        )}

                        {/* Completion Step */}
                        {practice.currentStep === "complete" && (
                            <PracticeCompletionStep
                                templateTitle={practiceData.template.title}
                                questionsCount={practiceData.template.questions.length}
                                totalDuration={totalDuration}
                                onBackToDashboard={handleBackToDashboard}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}