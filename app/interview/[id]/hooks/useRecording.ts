import { useState, useRef, useCallback } from "react"

export function useRecording(interviewId: string) {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false)
  
  const audioChunksRef = useRef<Blob[]>([])
  const videoChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback((mediaStream: MediaStream) => {
    if (!mediaStream) {
      console.error("Media stream not available")
      return
    }

    const recorder = new MediaRecorder(mediaStream)
    setMediaRecorder(recorder)

    audioChunksRef.current = []
    videoChunksRef.current = []

    recorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data)
      videoChunksRef.current.push(event.data)
    }

    recorder.onstop = () => {
      // Create blobs from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
      const videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" })
      
      console.log("🎥 Recording completed, saving files...")
      
      // Save video and audio to S3 (NOT to agent - one-way communication only)
      saveVideoLocally(videoBlob, interviewId)
    }

    recorder.start()
    setIsRecording(true)
    console.log("Recording started")
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
      console.log("Recording stopped")
    }
  }, [mediaRecorder])

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
      setIsRecording(false)
      console.log("Recording paused")
    }
  }, [mediaRecorder])

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
      setIsRecording(true)
      console.log("Recording resumed")
    }
  }, [mediaRecorder])

  // Removed sendAudioToAgent - candidate audio should NOT be sent to agent
  // Only save to S3 for post-interview analysis

  const saveVideoLocally = useCallback(async (videoBlob: Blob, interviewId: string) => {
    try {
      const formData = new FormData()
      formData.append("video", videoBlob, `interview_${interviewId}_${Date.now()}.webm`)

      const response = await fetch(`/api/interviews/${interviewId}/video`, {
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
  }, [])

  const getAudioBlob = useCallback(() => {
    return new Blob(audioChunksRef.current, { type: "audio/webm" })
  }, [])

  const getVideoBlob = useCallback(() => {
    return new Blob(videoChunksRef.current, { type: "video/webm" })
  }, [])

  return {
    isRecording,
    isCandidateSpeaking,
    mediaRecorder,
    setIsCandidateSpeaking,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    // Removed sendAudioToAgent - recording only saves to S3
    saveVideoLocally,
    getAudioBlob,
    getVideoBlob,
  }
}