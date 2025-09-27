"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Mic, MicOff, Video, VideoOff, CheckCircle, Phone } from "lucide-react"
import Link from "next/link"

const demoQuestions = [
  {
    id: 1,
    question: "Tell me about yourself and your professional background.",
    timeLimit: 120,
  },
  {
    id: 2,
    question: "What interests you most about this role and our company?",
    timeLimit: 90,
  },
  {
    id: 3,
    question: "Describe a challenging project you worked on and how you overcame obstacles.",
    timeLimit: 180,
  },
  {
    id: 4,
    question: "Where do you see yourself in 5 years?",
    timeLimit: 90,
  },
]

export default function DemoInterviewPage() {
  const [currentStep, setCurrentStep] = useState<"setup" | "interview" | "complete">("setup")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0) // Declare setTimeLeft variable
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [stream])

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setStream(mediaStream)
      setCameraEnabled(true)
      setMicEnabled(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
      alert("Please allow camera and microphone access to continue with the demo interview.")
    }
  }

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCameraEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setMicEnabled(audioTrack.enabled)
      }
    }
  }

  const startInterview = () => {
    setCurrentStep("interview")
    setInterviewStarted(true)
    setTimeLeft(demoQuestions[0].timeLimit) // Initialize timeLeft with the first question's time limit
    startTimer()
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          nextQuestion()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startRecording = () => {
    setIsRecording(true)
    console.log("[v0] Started recording for question:", currentQuestion + 1)
  }

  const stopRecording = () => {
    setIsRecording(false)
    console.log("[v0] Stopped recording for question:", currentQuestion + 1)
  }

  const nextQuestion = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (currentQuestion < demoQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setTimeLeft(demoQuestions[currentQuestion + 1].timeLimit)
      setIsRecording(false)
      startTimer()
    } else {
      completeInterview()
    }
  }

  const completeInterview = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
    setCurrentStep("complete")

    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const endInterview = () => {
    setCurrentStep("complete")
    setInterviewStarted(false)

    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (currentStep === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">Demo Interview Setup</CardTitle>
            <p className="text-slate-600 mt-2">
              This is a demonstration of our AI interview platform. We'll need access to your camera and microphone.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
              {stream ? (
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={requestPermissions}
                disabled={cameraEnabled && micEnabled}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                {cameraEnabled && micEnabled ? "Permissions Granted" : "Enable Camera & Microphone"}
              </Button>
            </div>

            {cameraEnabled && micEnabled && (
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Button
                    variant={cameraEnabled ? "default" : "secondary"}
                    onClick={toggleCamera}
                    className="flex items-center gap-2"
                  >
                    {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    Camera {cameraEnabled ? "On" : "Off"}
                  </Button>
                  <Button
                    variant={micEnabled ? "default" : "secondary"}
                    onClick={toggleMic}
                    className="flex items-center gap-2"
                  >
                    {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    Microphone {micEnabled ? "On" : "Off"}
                  </Button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Interview Instructions:</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• You'll be asked {demoQuestions.length} questions</li>
                    <li>• Each question has a time limit</li>
                    <li>• Click "Start Recording" to begin your response</li>
                    <li>• You can re-record your answer if needed</li>
                  </ul>
                </div>

                <Button onClick={startInterview} className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-3">
                  Start Interview
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "interview") {
    const progress = ((currentQuestion + 1) / demoQuestions.length) * 100

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white">Humaneq HR Interview Demo</h1>
              {interviewStarted && (
                <Badge className="bg-red-600 text-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                  Recording
                </Badge>
              )}
            </div>
            <div className="text-slate-400 text-sm">Demo Session</div>
          </div>
        </div>

        {/* Main Video Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl aspect-video bg-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
            {stream ? (
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Camera className="h-24 w-24 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">Camera not available</p>
                </div>
              </div>
            )}

            {/* Video overlay with participant info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg">
              <span className="text-sm font-medium">You</span>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bg-slate-800 border-t border-slate-700 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            {/* Camera Control */}
            <Button
              onClick={toggleCamera}
              variant={cameraEnabled ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 ${
                cameraEnabled ? "bg-slate-600 hover:bg-slate-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {cameraEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            {/* Microphone Control */}
            <Button
              onClick={toggleMic}
              variant={micEnabled ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 ${
                micEnabled ? "bg-slate-600 hover:bg-slate-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            {/* Start/End Interview Button */}
            <Button onClick={endInterview} size="lg" className="bg-red-600 hover:bg-red-700 rounded-full w-14 h-14">
              <Phone className="h-6 w-6" />
            </Button>
          </div>

          {/* Status Text */}
          <div className="text-center mt-4">
            <p className="text-slate-400 text-sm">
              {interviewStarted
                ? "Interview in progress - Click the red button to end"
                : "Click Start to begin recording"}
            </p>
            {timeLeft > 0 && <p className="text-slate-400 text-sm mt-2">Time left: {formatTime(timeLeft)}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Interview Complete!</CardTitle>
          <p className="text-slate-600 mt-2">
            Thank you for completing the demo interview. Your responses have been recorded.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-slate-600 space-y-1 text-left">
              <li>• Your responses will be analyzed by our AI system</li>
              <li>• The hiring team will review your interview</li>
              <li>• You'll receive feedback within 2-3 business days</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/demo">Try Another Demo</Link>
            </Button>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
