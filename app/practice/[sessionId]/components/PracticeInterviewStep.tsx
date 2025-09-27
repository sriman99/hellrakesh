import { Button } from "@/components/ui/button"
import { Mic, Camera, MicOff, CameraOff, PhoneOff, Settings, GraduationCap } from "lucide-react"
import VoiceReactiveVisual from "@/components/VoiceReactiveVisual"

interface PracticeInterviewStepProps {
    mediaStream: MediaStream | null
    practiceStarted: boolean
    isCameraOn: boolean
    isMicOn: boolean
    candidateName: string
    sessionId: string
    elevenLabsAudioUrl: string | null
    isAgentSpeaking: boolean
    isRecording: boolean
    onToggleCamera: () => void
    onToggleMic: () => void
    onStartPractice: () => void
    onEndPractice: () => void
    onAgentAudioEnd?: () => void
    onSystemAudioElementReady?: (audioElement: HTMLAudioElement | null) => void
}

export default function PracticeInterviewStep({
    mediaStream,
    practiceStarted,
    isCameraOn,
    isMicOn,
    candidateName,
    sessionId,
    elevenLabsAudioUrl,
    isAgentSpeaking,
    isRecording,
    onToggleCamera,
    onToggleMic,
    onStartPractice,
    onEndPractice,
    onAgentAudioEnd,
    onSystemAudioElementReady
}: PracticeInterviewStepProps) {
    return (
        <div className="fixed inset-0 w-screen h-screen flex overflow-hidden bg-black z-50">
            {/* Full screen VoiceReactiveVisual animation */}
            <div className="w-full h-full flex items-center justify-center bg-black relative">
                <VoiceReactiveVisual
                    elevenLabsAudio={elevenLabsAudioUrl}
                    isAgentSpeaking={isAgentSpeaking}
                    externalMediaStream={mediaStream}
                    isUserMicOn={isMicOn}
                    className="w-full h-full"
                    onAgentAudioEnd={onAgentAudioEnd}
                    onSystemAudioElementReady={onSystemAudioElementReady}
                />
            </div>

            {/* Small movable camera frame - like Zoom/Google Meet */}
            {mediaStream && isCameraOn && (
                <div className="absolute top-4 right-4 z-50">
                    <div className="w-64 h-48 bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500/50 shadow-lg">
                        <video
                            ref={(video) => {
                                if (video && mediaStream) {
                                    video.srcObject = mediaStream
                                }
                            }}
                            autoPlay
                            muted
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm flex items-center">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            Practice Mode - {candidateName}
                        </div>
                    </div>
                </div>
            )}

            {/* Practice status indicator - top left */}
            <div className="absolute top-4 left-4 z-50">
                <div className="bg-blue-500/90 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-400 flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    {practiceStarted ? (
                        <>
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">PRACTICE ACTIVE</span>
                        </>
                    ) : (
                        <span className="text-sm font-medium">PRACTICE READY</span>
                    )}
                </div>

                {/* Recording status indicator */}
                {isRecording && (
                    <div className="mt-2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg border border-red-400 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">RECORDING</span>
                    </div>
                )}
            </div>

            {/* Controls overlay - centered at bottom */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg px-6 py-4">
                    <div className="flex items-center space-x-4">
                        {/* Microphone toggle */}
                        <Button
                            variant={isMicOn ? "ghost" : "destructive"}
                            size="icon"
                            className="w-12 h-12 rounded-full"
                            onClick={onToggleMic}
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

                        {/* Start/End Practice button */}
                        {!practiceStarted ? (
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full"
                                onClick={onStartPractice}
                            >
                                Start Practice
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
                                onClick={onEndPractice}
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
            </div>
        </div>
    )
}