"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import VoiceReactiveVisual from "@/components/VoiceReactiveVisual"
import {
  UserCheck,
  Camera,
  Mic,
  Clock,
  CheckCircle,
  AlertCircle,
  MicOff,
  CameraOff,
  PhoneOff,
  Settings,
} from "lucide-react"
import { useParams } from "next/navigation"
import { Conversation } from "@elevenlabs/client" // Assuming ElevenLabs SDK is installed

type InterviewStep = "welcome" | "permissions" | "interview" | "complete"

export default function InterviewPage() {
  const params = useParams()
  const [currentStep, setCurrentStep] = useState<InterviewStep>("welcome")
  
  // Add overflow-hidden to body when in interview mode
  useEffect(() => {
    if (currentStep === "interview") {
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
  }, [currentStep])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [hasPermissions, setHasPermissions] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [responses, setResponses] = useState<string[]>([])
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]) // State for available cameras
  const videoRef = useRef<HTMLVideoElement>(null)

  const [interviewData, setInterviewData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completionData, setCompletionData] = useState<any>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false) // Track if the candidate is speaking
  const [elevenLabsAudioUrl, setElevenLabsAudioUrl] = useState<string | null>(null) // Track ElevenLabs audio URL
  const [audioData, setAudioData] = useState({
    volume: 0,
    frequency: 0,
    pitch: 0,
    waveform: new Uint8Array(0),
  })
  const [warnings, setWarnings] = useState(0)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const agentAudioRef = useRef<HTMLAudioElement | null>(null)
  const agentAudioContextRef = useRef<AudioContext | null>(null)
  const agentAnalyserRef = useRef<AnalyserNode | null>(null)
  const pointCloudRef = useRef<HTMLCanvasElement | null>(null)
  const restrictedAreaRef = useRef<HTMLDivElement | null>(null)

  const animatePointCloud = (
    context: CanvasRenderingContext2D,
    volume: number,
    frequency: number,
    pitch: number,
    color: string,
    waveform: Uint8Array,
  ) => {
    const width = pointCloudRef.current?.width || 0
    const height = pointCloudRef.current?.height || 0

    // Dynamic point count based on volume
    const basePoints = 50
    const volumeMultiplier = Math.max(0.1, volume / 100)
    const points = Math.floor(basePoints + volumeMultiplier * 100)

    context.clearRect(0, 0, width, height)

    // Create gradient based on frequency
    const gradient = context.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    )

    // Color intensity based on pitch
    const pitchIntensity = Math.min(1, pitch / 1000)
    gradient.addColorStop(0, `rgba(${color === "blue" ? "0, 100, 255" : "0, 255, 100"}, ${pitchIntensity})`)
    gradient.addColorStop(1, `rgba(${color === "blue" ? "0, 50, 150" : "0, 150, 50"}, 0.1)`)

    context.fillStyle = gradient

    // Create points with waveform-influenced positioning
    for (let i = 0; i < points; i++) {
      // Base position
      let x = Math.random() * width
      let y = Math.random() * height

      // Influence position based on waveform data
      if (waveform.length > 0) {
        const waveIndex = Math.floor((i / points) * waveform.length)
        const waveValue = waveform[waveIndex] / 255

        // Create circular pattern influenced by waveform
        const angle = (i / points) * Math.PI * 2
        const radius = (width / 4) * waveValue * volumeMultiplier

        x = width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 50
        y = height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 50
      }

      // Size based on volume and frequency
      const baseSize = 1
      const volumeSize = volumeMultiplier * 8
      const frequencySize = (frequency / 1000) * 3
      const size = baseSize + volumeSize + frequencySize + Math.random() * 2

      // Pulsing effect based on pitch
      const pulseEffect = Math.sin(Date.now() * 0.01 + i * 0.1) * (pitch / 2000)
      const finalSize = Math.max(0.5, size + pulseEffect)

      context.beginPath()
      context.arc(x, y, finalSize, 0, Math.PI * 2)
      context.fill()

      // Add connecting lines for high-energy moments
      if (volumeMultiplier > 0.7 && i > 0 && Math.random() > 0.8) {
        context.strokeStyle = `rgba(${color === "blue" ? "0, 100, 255" : "0, 255, 100"}, 0.3)`
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(x, y)

        // Connect to nearby point
        const nearbyIndex = Math.floor(Math.random() * Math.min(5, i))
        const nearbyAngle = ((i - nearbyIndex) / points) * Math.PI * 2
        const nearbyRadius =
          (width / 4) * (waveform[Math.floor(((i - nearbyIndex) / points) * waveform.length)] / 255) * volumeMultiplier
        const nearbyX = width / 2 + Math.cos(nearbyAngle) * nearbyRadius
        const nearbyY = height / 2 + Math.sin(nearbyAngle) * nearbyRadius

        context.lineTo(nearbyX, nearbyY)
        context.stroke()
      }
    }
  }

  // Enhanced audio analysis for agent speech
  const analyzeAgentAudio = (audioElement: HTMLAudioElement) => {
    if (!agentAudioContextRef.current) {
      agentAudioContextRef.current = new AudioContext()
    }

    const audioContext = agentAudioContextRef.current
    const source = audioContext.createMediaElementSource(audioElement)
    const analyser = audioContext.createAnalyser()

    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.8

    source.connect(analyser)
    analyser.connect(audioContext.destination)

    agentAnalyserRef.current = analyser

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const waveformArray = new Uint8Array(analyser.fftSize)

    const updateAudioData = () => {
      if (!analyser) return

      analyser.getByteFrequencyData(dataArray)
      analyser.getByteTimeDomainData(waveformArray)

      // Calculate volume (RMS)
      const volume = dataArray.reduce((sum, value) => sum + value * value, 0) / dataArray.length
      const normalizedVolume = Math.sqrt(volume)

      // Calculate dominant frequency
      let maxIndex = 0
      let maxValue = 0
      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i]
          maxIndex = i
        }
      }
      const frequency = (maxIndex * audioContext.sampleRate) / (2 * dataArray.length)

      // Calculate pitch (fundamental frequency estimation)
      const pitch = estimatePitch(waveformArray, audioContext.sampleRate)

      setAudioData({
        volume: normalizedVolume,
        frequency,
        pitch,
        waveform: new Uint8Array(waveformArray),
      })

      if (isAgentSpeaking) {
        requestAnimationFrame(updateAudioData)
      }
    }

    updateAudioData()
  }

  // Simple pitch estimation using autocorrelation
  const estimatePitch = (buffer: Uint8Array, sampleRate: number): number => {
    const SIZE = buffer.length
    const MAX_SAMPLES = Math.floor(SIZE / 2)
    let bestOffset = -1
    let bestCorrelation = 0
    let rms = 0

    // Calculate RMS
    for (let i = 0; i < SIZE; i++) {
      const val = (buffer[i] - 128) / 128
      rms += val * val
    }
    rms = Math.sqrt(rms / SIZE)

    if (rms < 0.01) return 0 // Not enough signal

    let lastCorrelation = 1
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
      let correlation = 0

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs((buffer[i] - 128) / 128 - (buffer[i + offset] - 128) / 128)
      }
      correlation = 1 - correlation / MAX_SAMPLES

      if (correlation > 0.9 && correlation > lastCorrelation) {
        bestCorrelation = correlation
        bestOffset = offset
      }

      lastCorrelation = correlation
    }

    if (bestOffset === -1) return 0
    return sampleRate / bestOffset
  }

  // Enhanced handleAgentResponse with audio analysis
  const handleAgentResponse = async (responseAudioUrl: string) => {
    try {
      console.log("🔊 Playing agent response audio:", responseAudioUrl.substring(0, 50) + "...")
      
      // Set the audio URL for VoiceReactiveVisual component
      setElevenLabsAudioUrl(responseAudioUrl)
      setIsAgentSpeaking(true)

      // Create audio element and play it
      const audio = new Audio(responseAudioUrl)
      agentAudioRef.current = audio
      
      // Set up audio context for visualization
      try {
        if (!agentAudioContextRef.current) {
          agentAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        
        const audioContext = agentAudioContextRef.current
        const source = audioContext.createMediaElementSource(audio)
        const analyser = audioContext.createAnalyser()
        
        analyser.fftSize = 256
        source.connect(analyser)
        analyser.connect(audioContext.destination)
        
        agentAnalyserRef.current = analyser
        
        // Start audio analysis for visualization
        const updateAudioData = () => {
          if (agentAnalyserRef.current && isAgentSpeaking) {
            const dataArray = new Uint8Array(agentAnalyserRef.current.frequencyBinCount)
            agentAnalyserRef.current.getByteFrequencyData(dataArray)
            
            // Calculate audio metrics
            const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
            const frequency = dataArray.findIndex(value => value > 100) * (audioContext.sampleRate / 2) / dataArray.length
            
            setAudioData({
              volume,
              frequency,
              pitch: frequency,
              waveform: dataArray,
            })
            
            requestAnimationFrame(updateAudioData)
          }
        }
        
        updateAudioData()
      } catch (audioContextError) {
        console.warn("Audio context setup failed:", audioContextError)
      }

      // Handle audio end
      audio.onended = () => {
        console.log("🔊 Agent audio finished playing")
        setIsAgentSpeaking(false)
        setElevenLabsAudioUrl(null)
        setAudioData({ volume: 0, frequency: 0, pitch: 0, waveform: new Uint8Array(0) })
      }
      
      audio.onerror = (error) => {
        console.error("🔊 Audio playback error:", error)
        setIsAgentSpeaking(false)
      }
      
      // Start playing the audio
      await audio.play()
      console.log("🔊 Agent audio started playing")
      
    } catch (error) {
      console.error("Error playing agent response:", error)
      setIsAgentSpeaking(false)
    }
  }

  // Enhanced point cloud animation effect
  useEffect(() => {
    if (!pointCloudRef.current) return // Ensure the canvas element exists
    const canvas = pointCloudRef.current
    const context = canvas.getContext("2d")
    if (!context) return // Ensure the 2D context is available

    let animationFrame: number
    const render = () => {
      if (isAgentSpeaking) {
        animatePointCloud(context, audioData.volume, audioData.frequency, audioData.pitch, "blue", audioData.waveform)
      } else if (isCandidateSpeaking) {
        animatePointCloud(context, 5, 0, 0, "green", new Uint8Array(0))
      } else {
        // Default animation when no one is speaking
        animatePointCloud(context, 2, 0, 0, "gray", new Uint8Array(0))
      }
      animationFrame = requestAnimationFrame(render)
    }
    
    render()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isAgentSpeaking, isCandidateSpeaking, audioData])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (agentAudioContextRef.current) {
        agentAudioContextRef.current.close()
      }
    }
  }, [])
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setInterviewData(data)
          setLoading(false)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to fetch interview data")
          setLoading(false)
        }
      } catch (err) {
        setError("Network error. Please try again.")
        setLoading(false)
      }
    }

    fetchInterview()
  }, [params.id])

  // Timer effect for question time limits
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === "interview" && timeRemaining > 0 && isRecording) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleNextQuestion()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentStep, timeRemaining, isRecording])

  // Fetch available video input devices (cameras)
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((allDevices) => {
      setDevices(allDevices.filter((d) => d.kind === "videoinput"))
    })
  }, [])

  // Attach media stream to the video element
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
      console.log("MediaStream tracks:", mediaStream.getTracks())
      console.log("Video tracks:", mediaStream.getVideoTracks())
    }
  }, [mediaStream])

  const requestPermissions = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setMediaStream(stream)
      setHasPermissions(true)
      setCurrentStep("interview") // Move to the interview step without starting the session
    } catch (error) {
      console.error("Permission denied:", error)
      alert("Camera and microphone access are required for this interview.")
    }
  }

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn
        setIsCameraOn(!isCameraOn)
      }
    }
  }

  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isMicOn
        setIsMicOn(!isMicOn)
      }
    }
  }

  const startInterview = () => {
    setInterviewStarted(true)
    setIsRecording(true)
    startAgentSession() // Start the session when the green button is clicked
    startRecording() // Automatically start recording when interview begins
    
    console.log("Interview started")
  }

  const updateInterviewStatus = async (status: "completed") => {
    try {
      const response = await fetch(`/api/interviews/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        console.error("Failed to update interview status")
      }
    } catch (error) {
      console.error("Error updating interview status:", error)
    }
  }

  const endAgentSession = async () => {
    if (conversation) {
      try {
        console.log("Ending agent session...")
        
        // Get conversation ID before closing
        const conversationId = (conversation as any).conversationId?.()
        console.log("Attempting to extract conversationId:", conversationId)
        
        // Close WebSocket connection
        if ((conversation as any).endSession) {
          (conversation as any).endSession()
        }

        console.log("Agent session ended")
        
        if (conversationId) {
          const response = await fetch(`/api/interviews/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId }),
          })
          console.log("Conversation ID saved response:", response.status)
          if (response.ok) {
            const result = await response.json()
            console.log("Conversation save result:", result)
          }
        } else {
          console.warn("No conversationId found to save")
        }
      } catch (error) {
        console.error("Error ending agent session:", error)
      } finally {
        setConversation(null)
      }
    }
  }

  const endInterview = async () => {
    stopRecording() // Stop the continuous recording
    setIsRecording(false)
    setCurrentStep("complete")
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
    }
    await endAgentSession()
    await updateInterviewStatus("completed")

    // Fetch updated interview data with scores
    await fetchCompletionData()
  }

  const fetchCompletionData = async () => {
    setLoadingResults(true)
    try {
      // Wait a bit for backend processing to complete
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const response = await fetch(`/api/interviews/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCompletionData(data)
        console.log("Completion data fetched:", data)
      } else {
        console.error("Failed to fetch completion data")
      }
    } catch (error) {
      console.error("Error fetching completion data:", error)
    } finally {
      setLoadingResults(false)
    }
  }

  const handleNextQuestion = () => {
    stopRecording()
    if (currentQuestionIndex < interviewData.template.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setTimeRemaining(interviewData.template.questions[currentQuestionIndex + 1].timeLimit * 60)
    } else {
      setCurrentStep("complete")
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // const startAgentSession = async () => {
  //   try {
  //     console.log("🚀 Starting ElevenLabs agent session...")
      
  //     const response = await fetch(`/api/interviews/${params.id}/signed-url`)
  //     console.log("📡 Signed URL API response status:", response.status)
      
  //     if (!response.ok) {
  //       const errorText = await response.text()
  //       console.error("❌ Failed to fetch signed URL:", errorText)
  //       throw new Error(`Failed to fetch signed URL: ${response.status} - ${errorText}`)
  //     }

  //     const { signedUrl } = await response.json()
  //     console.log("✅ Signed URL received:", signedUrl?.substring(0, 50) + "...")
      
  //     // Connect to ElevenLabs WebSocket directly
  //     console.log("🔌 Connecting to ElevenLabs WebSocket...")
  //     const websocket = new WebSocket(signedUrl)
  //     let conversationId: string | null = null
  //     let connectionTimeout: NodeJS.Timeout
      
  //     // Set connection timeout
  //     connectionTimeout = setTimeout(() => {
  //       console.error("⏰ WebSocket connection timeout")
  //       websocket.close()
  //     }, 10000)
      
  //     websocket.onopen = () => {
  //       clearTimeout(connectionTimeout)
  //       console.log("✅ Connected to ElevenLabs agent WebSocket")
        
  //       // Send initial message to start conversation
  //       const initialMessage = {
  //         type: "conversation_initiation_client_data",
  //         conversation_config_override: {
  //           agent: {
  //             prompt: {
  //               prompt: "You are a professional AI interviewer. Start the conversation by greeting the candidate and asking the first interview question."
  //             }
  //           }
  //         }
  //       }
        
  //       websocket.send(JSON.stringify(initialMessage))
  //       console.log("📤 Sent initial message to agent")
  //     }
      
  //     websocket.onmessage = (event) => {
  //       try {
  //         const data = JSON.parse(event.data)
  //         console.log("📥 Received message from agent:", {
  //           type: data.type,
  //           hasAudio: !!data.audio_event?.audio_base_64,
  //           messageLength: data.message?.length || 0,
  //           conversationId: data.conversation_id
  //         })
          
  //         // Extract conversation ID from WebSocket messages
  //         if (data.conversation_id) {
  //           conversationId = data.conversation_id
  //           console.log("🆔 Extracted conversation ID:", conversationId)
  //         }
          
  //         if (data.type === 'audio' && data.audio_event?.audio_base_64) {
  //           console.log("🔊 Received audio from agent, length:", data.audio_event.audio_base_64.length)
  //           // Convert base64 audio to playable format
  //           const audioUrl = `data:audio/mpeg;base64,${data.audio_event.audio_base_64}`
  //           handleAgentResponse(audioUrl)
  //         } else if (data.type === 'message') {
  //           console.log("💬 Agent text message:", data.message)
  //         } else if (data.type === 'interruption') {
  //           console.log("⏸️ Agent interruption detected")
  //         } else if (data.type === 'ping') {
  //           console.log("📡 Received ping from agent")
  //         } else {
  //           console.log("❓ Unknown message type:", data.type)
  //         }
  //       } catch (error) {
  //         console.error("❌ Error parsing agent message:", error)
  //         console.log("Raw message:", event.data)
  //       }
  //     }
      
  //     websocket.onerror = (error) => {
  //       clearTimeout(connectionTimeout)
  //       console.error("❌ WebSocket error:", error)
  //     }
      
  //     websocket.onclose = (event) => {
  //       clearTimeout(connectionTimeout)
  //       console.log("❌ Disconnected from ElevenLabs agent", {
  //         code: event.code,
  //         reason: event.reason,
  //         wasClean: event.wasClean
  //       })
  //     }
      
  //     // Store websocket reference in conversation for sending audio
  //     const conversationWrapper = {
  //       websocket,
  //       conversationId: () => conversationId,
  //       sendAudio: async (audioBlob: Blob) => {
  //         if (websocket.readyState === WebSocket.OPEN) {
  //           // Convert audio blob to base64
  //           const arrayBuffer = await audioBlob.arrayBuffer()
  //           const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
            
  //           const message = {
  //             type: 'audio',
  //             audio_data: base64Audio
  //           }
            
  //           websocket.send(JSON.stringify(message))
  //           console.log("Audio sent to agent")
  //         } else {
  //           console.error("WebSocket not connected")
  //         }
  //       },
  //       endSession: () => {
  //         websocket.close()
  //       }
  //     }
      
  //     setConversation(conversationWrapper as any)
  //     console.log("✅ Agent session started successfully")
  //   } catch (error) {
  //     console.error("❌ Error starting agent session:", error)
  //     alert(`Failed to start agent session: ${error instanceof Error ? error.message : String(error)}`)
  //   }
  // }


  const startAgentSession = async () => {
    try {
      console.log("🚀 Starting ElevenLabs agent session...");

      const response = await fetch(`/api/interviews/${params.id}/signed-url`);
      if (!response.ok) {
        throw new Error("Failed to fetch signed URL");
      }

      const { signedUrl } = await response.json();
      console.log("✅ Signed URL received:", signedUrl?.substring(0, 50) + "...");

      // Start a new conversation session using ElevenLabs SDK
      const newConversation = await Conversation.startSession({ signedUrl });
      setConversation(newConversation);
      console.log("✅ Agent session started successfully");
    } catch (error) {
      console.error("❌ Error starting agent session:", error);
      alert(`Failed to start agent session: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  // const sendAudioToAgent = async (audioBlob: Blob) => {
  //   if (!conversation) {
  //     console.error("Conversation not started")
  //     return
  //   }

  //   try {
  //     // Use the sendAudio method we created in the conversation wrapper
  //     await (conversation as any).sendAudio(audioBlob)
  //     console.log("Audio sent to agent successfully")
  //   } catch (error) {
  //     console.error("Error communicating with agent:", error)
  //   }
  // }

  const sendAudioToAgent = async (audioBlob: Blob) => {
    if (!conversation) {
      console.error("❌ Conversation not started");
      return;
    }

    try {
      console.log("📤 Sending audio to agent...");
      const response = await conversation.sendAudio(audioBlob);
      console.log("📥 Agent response:", response);

      if (response.audioUrl) {
        handleAgentResponse(response.audioUrl);
      }
    } catch (error) {
      console.error("❌ Error communicating with agent:", error);
    }
  };

  const saveVideoLocally = async (videoBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("video", videoBlob, `interview_${params.id}_${Date.now()}.webm`)

      const response = await fetch(`/api/interviews/${params.id}/video`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Video saved successfully:", result)
      } else {
        console.error("Failed to save video:", await response.text())
      }
    } catch (error) {
      console.error("Error saving video locally:", error)
    }
  }

  const startRecording = () => {
    if (!mediaStream) {
      console.error("Media stream not available")
      return
    }

    const recorder = new MediaRecorder(mediaStream)
    setMediaRecorder(recorder)

    const audioChunks: Blob[] = []
    const videoChunks: Blob[] = []

    recorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
      videoChunks.push(event.data) // Same data contains both audio and video
    }

    recorder.onstop = () => {
      // Create audio blob for agent communication
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
      sendAudioToAgent(audioBlob)

      // Create video blob for local saving
      const videoBlob = new Blob(videoChunks, { type: "video/webm" })
      saveVideoLocally(videoBlob)
    }

    recorder.start()
    setIsRecording(true)
  }

  const pauseRecording = () => {
    setIsRecording(false)
    console.log("Paused recording")
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (interviewStarted && restrictedAreaRef.current) {
      const { left, top, right, bottom } = restrictedAreaRef.current.getBoundingClientRect()
      const isInside = e.clientX >= left && e.clientX <= right && e.clientY >= top && e.clientY <= bottom

      if (!isInside && warnings < 3) {
        setWarnings((prev) => prev + 1)
        setWarningMessage(`Warning ${warnings + 1}: Please keep your mouse within the designated area.`)

        // Remove the warning message after 5 seconds
        setTimeout(() => setWarningMessage(null), 5000)
      }
    }
  }

  useEffect(() => {
    if (interviewStarted) {
      window.addEventListener("mousemove", handleMouseMove)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
    }

    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [interviewStarted, warnings])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-border max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = interviewData.template.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / interviewData.template.questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-border/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">HumaneQ HR</span>
                <p className="text-xs text-muted-foreground">AI Interview Platform</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {interviewData.interview.candidateName}
            </Badge>
          </div>
        </div>
      </header>

      {/* Interview Step - Full Screen (outside container) */}
      {currentStep === "interview" && (
        <div className="fixed inset-0 w-screen h-screen flex overflow-hidden bg-black z-50">
          {/* Full screen VoiceReactiveVisual animation */}
          <div className="w-full h-full flex items-center justify-center bg-black relative">
            <VoiceReactiveVisual 
              elevenLabsAudio={elevenLabsAudioUrl}
              isAgentSpeaking={isAgentSpeaking}
              externalMediaStream={mediaStream}
              className="w-full h-full"
            />
            

          </div>

          {/* Small movable camera frame - like Zoom/Google Meet */}
          <div 
            className="absolute top-4 right-4 w-64 h-48 rounded-lg overflow-hidden shadow-lg border-2 border-white/20 bg-gray-800 z-20 cursor-move hover:border-white/40 transition-all"
            style={{ userSelect: 'none' }}
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const startX = e.clientX - rect.left;
              const startY = e.clientY - rect.top;
              
              const handleMouseMove = (moveE: MouseEvent) => {
                const newX = moveE.clientX - startX;
                const newY = moveE.clientY - startY;
                e.currentTarget.style.left = `${Math.max(0, Math.min(window.innerWidth - 256, newX))}px`;
                e.currentTarget.style.top = `${Math.max(0, Math.min(window.innerHeight - 192, newY))}px`;
                e.currentTarget.style.right = 'auto';
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            {hasPermissions && mediaStream && isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6 text-gray-300" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-medium">{interviewData.interview.candidateName}</p>
                    <p className="text-xs text-gray-300">Camera is {isCameraOn ? "loading..." : "off"}</p>
                  </div>
                </div>
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
                  onClick={toggleMic}
                  disabled={isAgentSpeaking}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>

                {/* Camera toggle */}
                <Button
                  variant={isCameraOn ? "ghost" : "destructive"}
                  size="icon"
                  className="w-12 h-12 rounded-full"
                  onClick={toggleCamera}
                >
                  {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </Button>

                {/* Start/End Interview button */}
                {!interviewStarted ? (
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-full"
                    onClick={startInterview}
                  >
                    Start Interview
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
                    onClick={endInterview}
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
      )}

      {/* Non-interview content container */}
      {currentStep !== "interview" && (
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Step */}
          {currentStep === "welcome" && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold gradient-text text-balance mb-4">
                  Welcome to Your Interview, {interviewData.interview.candidateName}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  You've been invited to complete a {interviewData.template.title} with{" "}
                  {interviewData.interview.candidateEmail}.
                </p>
              </div>

              <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
                  <CardTitle className="text-2xl text-foreground">{interviewData.template.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {interviewData.template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-chart-3/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                        <Clock className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {interviewData.template.questions.reduce((total: number, q: any) => total + q.timeLimit, 0)}{" "}
                          min
                        </p>
                        <p className="text-sm text-muted-foreground">Total duration</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                        <UserCheck className="w-8 h-8 text-secondary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{interviewData.template.questions.length}</p>
                        <p className="text-sm text-muted-foreground">Questions to complete</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-chart-3/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                        <Camera className="w-8 h-8 text-chart-3" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">Video</p>
                        <p className="text-sm text-muted-foreground">Recorded responses</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/30 rounded-xl p-6 border border-border/30">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      What to expect:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        You'll be asked to enable your camera and microphone
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Questions will be presented one at a time
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Each question has a time limit for your response
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        You can pause and resume recording as needed
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Your responses will be recorded for review
                      </li>
                    </ul>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                    onClick={() => setCurrentStep("permissions")}
                  >
                    Start Interview
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Permissions Step */}
          {currentStep === "permissions" && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold gradient-text">Camera & Microphone Setup</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  We need access to your camera and microphone to record your interview responses.
                </p>
              </div>

              <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <label htmlFor="camera-select" className="block text-sm font-medium text-foreground">
                      Select Camera
                    </label>
                    <select
                      id="camera-select"
                      className="w-full bg-input border border-border/50 rounded-lg p-3 text-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => requestPermissions(e.target.value)}
                    >
                      {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                    onClick={() => requestPermissions()}
                  >
                    Enable Camera & Microphone
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-chart-3/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-10 h-10 text-chart-3" />
                </div>
                <h1 className="text-5xl font-bold gradient-text">Interview Complete!</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  Thank you for completing your interview with {interviewData.companyName}. Your responses have been
                  successfully recorded and analyzed.
                </p>
              </div>

              {loadingResults ? (
                <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-lg text-muted-foreground">Analyzing your responses...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : completionData?.finalScore ? (
                <div className="space-y-6">
                  {/* Score display with gradient styling */}
                  <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                    <CardHeader className="text-center bg-gradient-to-r from-card to-card/50 rounded-t-lg">
                      <CardTitle className="text-3xl text-foreground">Your Interview Score</CardTitle>
                      <div className="text-7xl font-bold gradient-text my-6">{completionData.finalScore.score}%</div>
                      <CardDescription className="text-lg text-muted-foreground">
                        {completionData.finalScore.interpretation}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Local Metrics */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                            Performance Metrics
                          </h4>
                          <div className="space-y-3 bg-card/30 p-4 rounded-lg border border-border/30">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Average Words</span>
                              <span className="font-semibold text-foreground">
                                {completionData.analysis?.localMetrics?.avgWords || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Vocabulary Richness</span>
                              <span className="font-semibold text-foreground">
                                {completionData.analysis?.localMetrics?.vocabRichness || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Clarity</span>
                              <span className="font-semibold text-foreground">
                                {completionData.analysis?.localMetrics?.clarity || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Response Time</span>
                              <span className="font-semibold text-foreground">
                                {completionData.analysis?.localMetrics?.avgLatency || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AI Metrics */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                            <div className="w-2 h-2 bg-accent rounded-full mr-2" />
                            Content Quality
                          </h4>
                          <div className="space-y-3 bg-card/30 p-4 rounded-lg border border-border/30">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Correctness</span>
                              <span className="font-semibold text-accent">
                                {completionData.analysis?.aiMetrics?.correctness || "N/A"}/10
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Relevance</span>
                              <span className="font-semibold text-accent">
                                {completionData.analysis?.aiMetrics?.relevance || "N/A"}/10
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Completeness</span>
                              <span className="font-semibold text-accent">
                                {completionData.analysis?.aiMetrics?.completeness || "N/A"}/10
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Confidence</span>
                              <span className="font-semibold text-accent">
                                {completionData.analysis?.aiMetrics?.confidence || "N/A"}/10
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Professionalism</span>
                              <span className="font-semibold text-accent">
                                {completionData.analysis?.aiMetrics?.professionalism || "N/A"}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interview summary with modern card styling */}
                  <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl">
                    <CardContent className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-chart-3/20 to-secondary/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                            <CheckCircle className="w-8 h-8 text-chart-3" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {interviewData.template.questions.length}
                            </p>
                            <p className="text-sm text-muted-foreground">Questions completed</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                            <Clock className="w-8 h-8 text-accent" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {interviewData.template.questions.reduce(
                                (total: number, q: any) => total + q.timeLimit,
                                0,
                              )}{" "}
                              min
                            </p>
                            <p className="text-sm text-muted-foreground">Total duration</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-chart-3/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                            <UserCheck className="w-8 h-8 text-secondary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">Recorded</p>
                            <p className="text-sm text-muted-foreground">All responses</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-card/30 rounded-xl p-6 border border-border/30">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <div className="w-5 h-5 bg-chart-3/20 rounded-full flex items-center justify-center mr-2">
                            <div className="w-2 h-2 bg-chart-3 rounded-full" />
                          </div>
                          What happens next?
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex items-start">
                            <span className="text-chart-3 mr-2">•</span>
                            Your responses will be reviewed by the {interviewData.companyName} team
                          </li>
                          <li className="flex items-start">
                            <span className="text-chart-3 mr-2">•</span>
                            You'll be contacted directly regarding next steps
                          </li>
                          <li className="flex items-start">
                            <span className="text-chart-3 mr-2">•</span>
                            This interview link is now inactive
                          </li>
                        </ul>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          You can now safely close this window. Thank you for your time!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-border max-w-2xl mx-auto">
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mx-auto">
                          <CheckCircle className="w-6 h-6 text-chart-3" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{interviewData.template.questions.length}</p>
                          <p className="text-sm text-muted-foreground">Questions completed</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {interviewData.template.questions.reduce((total: number, q: any) => total + q.timeLimit, 0)}{" "}
                            min
                          </p>
                          <p className="text-sm text-muted-foreground">Total duration</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
                          <UserCheck className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Recorded</p>
                          <p className="text-sm text-muted-foreground">All responses</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Your responses will be reviewed by the {interviewData.companyName} team</li>
                        <li>• You'll be contacted directly regarding next steps</li>
                        <li>• This interview link is now inactive</li>
                      </ul>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        You can now safely close this window. Thank you for your time!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
