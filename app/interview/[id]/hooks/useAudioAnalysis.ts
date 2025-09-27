import { useState, useRef, useCallback } from "react"

export interface AudioData {
  volume: number
  frequency: number
  pitch: number
  waveform: Uint8Array
}

export function useAudioAnalysis() {
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    frequency: 0,
    pitch: 0,
    waveform: new Uint8Array(0),
  })

  const agentAudioContextRef = useRef<AudioContext | null>(null)
  const agentAnalyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const setupAudioAnalysis = useCallback((audio: HTMLAudioElement) => {
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
      
      return analyser
    } catch (audioContextError) {
      console.warn("Audio context setup failed:", audioContextError)
      return null
    }
  }, [])

  const startAnalysis = useCallback(() => {
    const updateAudioData = () => {
      if (agentAnalyserRef.current) {
        const dataArray = new Uint8Array(agentAnalyserRef.current.frequencyBinCount)
        agentAnalyserRef.current.getByteFrequencyData(dataArray)
        
        // Calculate audio metrics
        const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const frequency = dataArray.findIndex(value => value > 100) * 
          (agentAudioContextRef.current?.sampleRate || 44100) / 2 / dataArray.length
        
        setAudioData({
          volume,
          frequency,
          pitch: frequency,
          waveform: dataArray,
        })
        
        animationFrameRef.current = requestAnimationFrame(updateAudioData)
      }
    }
    
    updateAudioData()
  }, [])

  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    setAudioData({
      volume: 0,
      frequency: 0,
      pitch: 0,
      waveform: new Uint8Array(0),
    })
  }, [])

  const cleanup = useCallback(() => {
    stopAnalysis()
    if (agentAudioContextRef.current) {
      agentAudioContextRef.current.close()
      agentAudioContextRef.current = null
    }
    agentAnalyserRef.current = null
  }, [stopAnalysis])

  return {
    audioData,
    setupAudioAnalysis,
    startAnalysis,
    stopAnalysis,
    cleanup,
  }
}