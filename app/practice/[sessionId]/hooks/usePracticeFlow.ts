import { useState, useEffect, useCallback } from "react"
import { usePracticeAgent } from "./usePracticeAgent"
import { usePracticeRecording } from "./usePracticeRecording"

type PracticeStep = "welcome" | "permissions" | "interview" | "complete"

export function usePracticeFlow(sessionId: string, practiceData: any, mediaStream: MediaStream | null, updatePracticeStatus: any) {
    const [currentStep, setCurrentStep] = useState<PracticeStep>("welcome")
    const [practiceStarted, setPracticeStarted] = useState(false)
    const [systemAudioElement, setSystemAudioElement] = useState<HTMLAudioElement | null>(null)

    // Add agent integration
    const agent = usePracticeAgent()

    // Add recording integration
    const recording = usePracticeRecording(sessionId)

    // Handle system audio element updates
    const handleSystemAudioElementReady = useCallback((audioElement: HTMLAudioElement | null) => {
        setSystemAudioElement(audioElement)
        console.log("🎵 System audio element ready for practice recording:", !!audioElement)
    }, [])

    // Handle starting the practice session
    const handleStartPractice = useCallback(() => {
        console.log("🎓 Starting practice session...")
        setPracticeStarted(true)

        // Start the ElevenLabs agent session
        agent.startAgentSession(sessionId)

        // Start recording both candidate and system audio
        if (mediaStream) {
            recording.startRecording(mediaStream, systemAudioElement || undefined)
        }

        console.log("Practice session started with agent and recording")
    }, [sessionId, agent, recording, mediaStream, systemAudioElement])

    // Handle ending the practice session
    const handleEndPractice = useCallback(async () => {
        console.log("🎓 Ending practice session...")

        // Stop recording first
        recording.stopRecording()

        setPracticeStarted(false)
        setCurrentStep("complete")

        // End the agent session
        await agent.endAgentSession(sessionId)

        // Update practice status
        updatePracticeStatus('completed')

        // Clean up media stream
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop())
        }
    }, [sessionId, agent, recording, mediaStream, updatePracticeStatus])

    // Reset to welcome step
    const handleRetryPractice = useCallback(() => {
        console.log("🔄 Retrying practice session...")
        setCurrentStep("welcome")
        setPracticeStarted(false)
    }, [])

    return {
        currentStep,
        setCurrentStep,
        practiceStarted,
        setPracticeStarted,
        handleStartPractice,
        handleEndPractice,
        handleRetryPractice,
        handleSystemAudioElementReady,
        // Return agent properties for use in components
        agent,
        // Return recording properties
        recording
    }
}