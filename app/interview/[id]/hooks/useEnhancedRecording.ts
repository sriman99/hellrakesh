import { useState, useRef, useCallback, useEffect } from "react"

export interface RecordingState {
    isRecording: boolean
    isPaused: boolean
    duration: number
    error: string | null
}

export interface AudioStreams {
    userMediaStream: MediaStream | null
    systemAudioContext: AudioContext | null
    systemAudioElement: HTMLAudioElement | null
}

export function useEnhancedRecording(interviewId: string) {
    const [recordingState, setRecordingState] = useState<RecordingState>({
        isRecording: false,
        isPaused: false,
        duration: 0,
        error: null
    })

    // Recording infrastructure
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedChunksRef = useRef<Blob[]>([])
    const startTimeRef = useRef<number>(0)
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Audio management with gain controls
    const audioContextRef = useRef<AudioContext | null>(null)
    const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null)
    const mixedStreamRef = useRef<MediaStream | null>(null)

    // Audio sources with gain controls
    const userSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const systemSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const userGainRef = useRef<GainNode | null>(null)
    const systemGainRef = useRef<GainNode | null>(null)
    const masterGainRef = useRef<GainNode | null>(null)

    // Initialize audio context for mixing with proper gain staging
    const initializeAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination()

            // Create gain nodes for proper audio mixing
            userGainRef.current = audioContextRef.current.createGain()
            systemGainRef.current = audioContextRef.current.createGain()
            masterGainRef.current = audioContextRef.current.createGain()

            // Set initial gain levels
            userGainRef.current.gain.value = 1.0   // User mic at normal level
            systemGainRef.current.gain.value = 2.5 // System audio boosted significantly
            masterGainRef.current.gain.value = 1.0 // Master level

            // Connect gain nodes to destination
            userGainRef.current.connect(masterGainRef.current)
            systemGainRef.current.connect(masterGainRef.current)
            masterGainRef.current.connect(audioDestinationRef.current)

            console.log("🎵 Audio context initialized with gain staging for mixed recording")
            console.log(`🎚️ User gain: ${userGainRef.current.gain.value}`)
            console.log(`🎚️ System gain: ${systemGainRef.current.gain.value}`)
            console.log(`🎚️ Master gain: ${masterGainRef.current.gain.value}`)
        }
        return { audioContext: audioContextRef.current, destination: audioDestinationRef.current }
    }, [])

    // Connect user media stream (microphone + camera) with gain control
    const connectUserMedia = useCallback((userMediaStream: MediaStream) => {
        const { audioContext } = initializeAudioContext()
        if (!audioContext || !userGainRef.current) return

        try {
            // Get audio tracks from user media
            const audioTracks = userMediaStream.getAudioTracks()
            if (audioTracks.length > 0) {
                // Create audio source from user media
                userSourceRef.current = audioContext.createMediaStreamSource(userMediaStream)
                userSourceRef.current.connect(userGainRef.current)
                console.log("🎙️ User media connected to mixer with gain control")
            }

            // For video recording, we need to add video tracks to the mixed stream
            const videoTracks = userMediaStream.getVideoTracks()
            if (videoTracks.length > 0) {
                videoTracks.forEach(track => {
                    if (mixedStreamRef.current) {
                        mixedStreamRef.current.addTrack(track)
                    }
                })
                console.log("📹 Video tracks added to mixed stream")
            }

        } catch (error) {
            console.error("❌ Error connecting user media:", error)
            setRecordingState(prev => ({ ...prev, error: "Failed to connect user media" }))
        }
    }, [initializeAudioContext])

    // Connect system audio (AI interviewer's voice) with enhanced gain and processing
    const connectSystemAudio = useCallback((audioElement: HTMLAudioElement) => {
        const { audioContext } = initializeAudioContext()
        if (!audioContext || !systemGainRef.current) return

        try {
            // Set audio element properties for better quality
            audioElement.volume = 1.0 // Maximum volume on the element
            audioElement.preload = "auto"
            audioElement.crossOrigin = "anonymous" // Allow cross-origin audio processing

            // Create source from audio element
            systemSourceRef.current = audioContext.createMediaElementSource(audioElement)

            // Create additional processing nodes for better system audio quality
            const compressor = audioContext.createDynamicsCompressor()
            const highpassFilter = audioContext.createBiquadFilter()

            // Configure compressor to even out volume levels
            compressor.threshold.value = -20    // Start compression at -20dB
            compressor.knee.value = 10          // Gentle compression curve
            compressor.ratio.value = 4          // 4:1 compression ratio
            compressor.attack.value = 0.003     // Fast attack (3ms)
            compressor.release.value = 0.1      // Medium release (100ms)

            // Configure high-pass filter to remove low-frequency noise
            highpassFilter.type = "highpass"
            highpassFilter.frequency.value = 80 // Remove frequencies below 80Hz
            highpassFilter.Q.value = 1

            // Audio chain: source -> filter -> compressor -> gain -> destination
            systemSourceRef.current.connect(highpassFilter)
            highpassFilter.connect(compressor)
            compressor.connect(systemGainRef.current)

            // Also connect to speakers for playback (separate path to avoid feedback)
            systemSourceRef.current.connect(audioContext.destination)

            console.log("🔊 System audio connected with enhanced processing:")
            console.log(`  - Volume: ${audioElement.volume}`)
            console.log(`  - Gain: ${systemGainRef.current.gain.value}`)
            console.log(`  - Compressor threshold: ${compressor.threshold.value}dB`)
            console.log(`  - High-pass filter: ${highpassFilter.frequency.value}Hz`)

        } catch (error) {
            console.error("❌ Error connecting system audio:", error)
            setRecordingState(prev => ({ ...prev, error: "Failed to connect system audio" }))
        }
    }, [initializeAudioContext])

    // Start recording with mixed audio streams
    const startRecording = useCallback((
        userMediaStream: MediaStream,
        systemAudioElement?: HTMLAudioElement
    ) => {
        try {
            const { audioContext, destination } = initializeAudioContext()
            if (!audioContext || !destination) {
                throw new Error("Failed to initialize audio context")
            }

            // Reset recording chunks
            recordedChunksRef.current = []

            // Connect user media (always required)
            connectUserMedia(userMediaStream)

            // Connect system audio if available
            if (systemAudioElement) {
                connectSystemAudio(systemAudioElement)
            }

            // Create mixed stream with audio from destination + video from user stream
            const mixedAudioStream = destination.stream
            const videoTracks = userMediaStream.getVideoTracks()

            // Create combined stream
            mixedStreamRef.current = new MediaStream([
                ...mixedAudioStream.getAudioTracks(),
                ...videoTracks
            ])

            // Create MediaRecorder for the mixed stream with high-quality settings
            const options = {
                mimeType: 'video/webm;codecs=vp9,opus',
                audioBitsPerSecond: 128000,  // High-quality audio bitrate
                videoBitsPerSecond: 2500000, // High-quality video bitrate
            }

            // Check if the browser supports the preferred codec, fallback gracefully
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.warn("⚠️ Preferred codec not supported, trying fallback options...")

                // Try alternative high-quality options
                const fallbackOptions = [
                    { mimeType: 'video/webm;codecs=vp8,opus', audioBitsPerSecond: 128000, videoBitsPerSecond: 2000000 },
                    { mimeType: 'video/webm', audioBitsPerSecond: 128000 },
                    { mimeType: 'video/mp4', audioBitsPerSecond: 128000 }
                ]

                let selectedOption = { mimeType: 'video/webm' } // Final fallback

                for (const option of fallbackOptions) {
                    if (MediaRecorder.isTypeSupported(option.mimeType)) {
                        selectedOption = option
                        break
                    }
                }

                console.log(`📹 Using codec: ${selectedOption.mimeType}`)
                Object.assign(options, selectedOption)
            } else {
                console.log(`📹 Using preferred codec: ${options.mimeType}`)
            }

            mediaRecorderRef.current = new MediaRecorder(mixedStreamRef.current, options)

            // Setup event handlers
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data)
                }
            }

            mediaRecorderRef.current.onstop = async () => {
                console.log("🎬 Recording stopped, processing...")
                await processRecording()
            }

            mediaRecorderRef.current.onerror = (event) => {
                console.error("❌ MediaRecorder error:", event)
                setRecordingState(prev => ({ ...prev, error: "Recording error occurred" }))
            }

            // Start recording with smaller chunks for better real-time processing
            mediaRecorderRef.current.start(500) // Record in 500ms chunks for better quality
            startTimeRef.current = Date.now()

            // Start duration tracking
            durationIntervalRef.current = setInterval(() => {
                setRecordingState(prev => ({
                    ...prev,
                    duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
                }))
            }, 1000)

            setRecordingState(prev => ({
                ...prev,
                isRecording: true,
                isPaused: false,
                error: null
            }))

            console.log("🎬 Enhanced recording started with high-quality mixed audio")
            console.log(`📊 Audio settings:`)
            console.log(`  - User gain: ${userGainRef.current?.gain.value}`)
            console.log(`  - System gain: ${systemGainRef.current?.gain.value}`)
            console.log(`  - Audio bitrate: ${options.audioBitsPerSecond || 'default'}`)
            console.log(`  - Video bitrate: ${options.videoBitsPerSecond || 'default'}`)
            console.log(`  - Codec: ${options.mimeType}`)

        } catch (error) {
            console.error("❌ Error starting enhanced recording:", error)
            setRecordingState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : "Failed to start recording"
            }))
        }
    }, [initializeAudioContext, connectUserMedia, connectSystemAudio])

    // Dynamic gain adjustment for system audio
    const adjustSystemAudioGain = useCallback((targetGain: number) => {
        if (systemGainRef.current && audioContextRef.current) {
            const currentTime = audioContextRef.current.currentTime
            // Smooth gain transition to avoid audio pops
            systemGainRef.current.gain.setTargetAtTime(targetGain, currentTime, 0.1)
            console.log(`🎚️ System audio gain adjusted to: ${targetGain}`)
        }
    }, [])

    // Auto-adjust system audio gain based on detection
    const monitorAndAdjustAudio = useCallback(() => {
        // This function can be called to boost system audio if it's detected as too quiet
        if (systemGainRef.current) {
            const currentGain = systemGainRef.current.gain.value
            if (currentGain < 3.0) {
                adjustSystemAudioGain(Math.min(currentGain * 1.5, 4.0)) // Gradually increase, max 4.0
            }
        }
    }, [adjustSystemAudioGain])

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }

        // Clear duration interval
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current)
            durationIntervalRef.current = null
        }

        setRecordingState(prev => ({
            ...prev,
            isRecording: false,
            isPaused: false
        }))

        console.log("🎬 Enhanced recording stopped")
    }, [])

    // Pause recording
    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause()

            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current)
                durationIntervalRef.current = null
            }

            setRecordingState(prev => ({
                ...prev,
                isPaused: true
            }))

            console.log("⏸️ Recording paused")
        }
    }, [])

    // Resume recording
    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume()

            // Resume duration tracking
            durationIntervalRef.current = setInterval(() => {
                setRecordingState(prev => ({
                    ...prev,
                    duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
                }))
            }, 1000)

            setRecordingState(prev => ({
                ...prev,
                isPaused: false
            }))

            console.log("▶️ Recording resumed")
        }
    }, [])

    // Process and upload recording
    const processRecording = useCallback(async () => {
        try {
            if (recordedChunksRef.current.length === 0) {
                throw new Error("No recorded data available")
            }

            const recordedBlob = new Blob(recordedChunksRef.current, {
                type: 'video/webm'
            })

            console.log(`📊 Recording processed: ${recordedBlob.size} bytes`)

            // Upload to S3
            await uploadRecordingToS3(recordedBlob)

        } catch (error) {
            console.error("❌ Error processing recording:", error)
            setRecordingState(prev => ({
                ...prev,
                error: "Failed to process recording"
            }))
        }
    }, [])

    // Upload recording to S3
    const uploadRecordingToS3 = useCallback(async (recordingBlob: Blob) => {
        try {
            const formData = new FormData()
            const filename = `interview_${interviewId}_complete_${Date.now()}.webm`
            formData.append("video", recordingBlob, filename)
            formData.append("type", "complete") // Indicates this is a complete recording with both audio streams

            const response = await fetch(`/api/interviews/${interviewId}/video`, {
                method: "POST",
                body: formData,
            })

            if (response.ok) {
                const result = await response.json()
                console.log("✅ Complete recording uploaded successfully:", result)
            } else {
                const errorText = await response.text()
                throw new Error(`Upload failed: ${errorText}`)
            }
        } catch (error) {
            console.error("❌ Error uploading recording:", error)
            setRecordingState(prev => ({
                ...prev,
                error: "Failed to upload recording"
            }))
        }
    }, [interviewId])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current)
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    // Get current recording blob (for preview or manual save)
    const getCurrentRecordingBlob = useCallback(() => {
        if (recordedChunksRef.current.length > 0) {
            return new Blob(recordedChunksRef.current, { type: 'video/webm' })
        }
        return null
    }, [])

    return {
        // State
        recordingState,

        // Controls
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,

        // Utilities
        getCurrentRecordingBlob,

        // Audio stream management
        connectUserMedia,
        connectSystemAudio,

        // Audio gain controls
        adjustSystemAudioGain,
        monitorAndAdjustAudio,

        // Manual upload (if needed)
        uploadRecordingToS3: (blob: Blob) => uploadRecordingToS3(blob)
    }
}