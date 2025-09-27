import { Button } from "@/components/ui/button"
import { Mic, Camera, MicOff, CameraOff, PhoneOff, Settings, VideoIcon, StopCircle, Volume2 } from "lucide-react"
import VoiceReactiveVisual from "@/components/VoiceReactiveVisual"
import VideoPreview from "./VideoPreview"
import MouseWarningAlert from "./MouseWarningAlert"
import { useMouseTracking } from "../hooks/useMouseTracking"
import { useEnhancedRecording } from "../hooks/useEnhancedRecording"
import { useEffect, useState, useCallback } from "react"

interface InterviewStepProps {
  mediaStream: MediaStream | null
  elevenLabsAudioUrl: string | null
  isAgentSpeaking: boolean
  interviewStarted: boolean
  isCameraOn: boolean
  isMicOn: boolean
  candidateName: string
  interviewId: string // Add interview ID for recording
  onToggleCamera: () => void
  onToggleMic: () => void
  onStartInterview: () => void
  onEndInterview: () => void
  onAgentAudioEnd?: () => void
}

export default function InterviewStep({
  mediaStream,
  elevenLabsAudioUrl,
  isAgentSpeaking,
  interviewStarted,
  isCameraOn,
  isMicOn,
  candidateName,
  interviewId,
  onToggleCamera,
  onToggleMic,
  onStartInterview,
  onEndInterview,
  onAgentAudioEnd
}: InterviewStepProps) {
  // State for system audio element
  const [systemAudioElement, setSystemAudioElement] = useState<HTMLAudioElement | null>(null)

  // Enhanced recording hook
  const enhancedRecording = useEnhancedRecording(interviewId)

  // Mouse tracking - only active when interview has started
  const mouseTracking = useMouseTracking({
    isActive: interviewStarted,
    toleranceZone: 60, // Extra pixels around control area
    warningDelay: 2500, // 2.5 seconds before warning
    warningDuration: 4000, // 4 seconds warning display
    maxWarningsPerMinute: 3 // Max 3 warnings per minute
  })

  // Handle system audio element updates
  const handleSystemAudioElementReady = useCallback((audioElement: HTMLAudioElement | null) => {
    setSystemAudioElement(audioElement)
    console.log("🎵 System audio element ready for recording:", !!audioElement)
  }, [])

  // Start recording when interview begins
  useEffect(() => {
    if (interviewStarted && mediaStream && !enhancedRecording.recordingState.isRecording) {
      console.log("🎬 Starting enhanced recording with system audio...")
      enhancedRecording.startRecording(mediaStream, systemAudioElement || undefined)
    }
  }, [interviewStarted, mediaStream, systemAudioElement, enhancedRecording])

  // Stop recording when interview ends
  const handleEndInterview = useCallback(() => {
    if (enhancedRecording.recordingState.isRecording) {
      console.log("🎬 Stopping enhanced recording...")
      enhancedRecording.stopRecording()
    }
    onEndInterview()
  }, [enhancedRecording, onEndInterview])

  // Auto-monitor and adjust system audio during interview
  useEffect(() => {
    if (interviewStarted && enhancedRecording.recordingState.isRecording) {
      // Auto-adjust system audio every 5 seconds during interview
      const adjustmentInterval = setInterval(() => {
        enhancedRecording.monitorAndAdjustAudio()
      }, 5000)

      return () => clearInterval(adjustmentInterval)
    }
  }, [interviewStarted, enhancedRecording.recordingState.isRecording, enhancedRecording])

  // Manual system audio boost
  const handleBoostSystemAudio = useCallback(() => {
    enhancedRecording.adjustSystemAudioGain(4.0) // Max boost
    console.log("🔊 System audio manually boosted to maximum")
  }, [enhancedRecording])

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex overflow-hidden bg-black z-50">
      {/* Full screen VoiceReactiveVisual animation */}
      <div className="w-full h-full flex items-center justify-center bg-black relative">
        <VoiceReactiveVisual
          elevenLabsAudio={elevenLabsAudioUrl}
          isAgentSpeaking={isAgentSpeaking}
          externalMediaStream={mediaStream}
          isUserMicOn={isMicOn}
          onAgentAudioEnd={onAgentAudioEnd}
          onSystemAudioElementReady={handleSystemAudioElementReady}
          className="w-full h-full"
        />
      </div>

      {/* Small movable camera frame - like Zoom/Google Meet */}
      <VideoPreview
        mediaStream={mediaStream}
        isCameraOn={isCameraOn}
        candidateName={candidateName}
      />

      {/* Recording status indicator - top left */}
      {enhancedRecording.recordingState.isRecording && (
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg border border-red-400 flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">REC</span>
            <span className="text-sm">{formatDuration(enhancedRecording.recordingState.duration)}</span>
          </div>

          {/* System audio boost button - only show during recording */}
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-blue-500/90 hover:bg-blue-600/90 text-white border-blue-400 text-xs"
              onClick={handleBoostSystemAudio}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              Boost AI Voice
            </Button>
          </div>
        </div>
      )}

      {/* Recording error indicator */}
      {enhancedRecording.recordingState.error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg border border-red-400">
            <span className="text-sm font-medium">Recording Error: {enhancedRecording.recordingState.error}</span>
          </div>
        </div>
      )}

      {/* Top-right indicator - only show when interview started and mouse is outside designated area */}
      {interviewStarted && !mouseTracking.isInDesignatedArea && (
        <div className="absolute top-60 right-4 z-50">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg border border-red-400 animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <span className="text-sm font-medium">Keep mouse in restricted area</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls overlay - centered at bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className={`
          bg-white dark:bg-gray-800 rounded-full shadow-lg px-6 py-4 transition-all duration-300
          ${interviewStarted && !mouseTracking.isInDesignatedArea ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
        `}>
          <div className="flex items-center space-x-4">
            {/* Microphone toggle */}
            <Button
              variant={isMicOn ? "ghost" : "destructive"}
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={onToggleMic}
              disabled={isAgentSpeaking}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            {/* Camera toggle */}
            <Button
              variant={isCameraOn ? "ghost" : "destructive"}
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={onToggleCamera}
            >
              {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </Button>

            {/* Start/End Interview button */}
            {!interviewStarted ? (
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-full"
                onClick={onStartInterview}
              >
                Start Interview
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="icon"
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
                onClick={handleEndInterview}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            )}

            {/* Settings */}
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Designated area indicator (only show when interview started and mouse is outside) */}
        {interviewStarted && !mouseTracking.isInDesignatedArea && (
          <div className="absolute inset-0 -m-4 border-2 border-dashed border-yellow-400 rounded-full opacity-50 animate-pulse" />
        )}
      </div>

      {/* Mouse Warning Alert */}
      <MouseWarningAlert
        show={mouseTracking.showWarning}
        onHide={mouseTracking.hideWarning}
        position="bottom"
        variant="subtle"
      />
    </div>
  )
}