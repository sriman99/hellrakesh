import { useEffect, useRef, useState } from 'react';
import { Analyser } from '@/lib/design/analyser';

export interface AudioManagerState {
  userAnalyser?: Analyser;
  agentAnalyser?: Analyser;
  isListening: boolean;
  isPlayingAgent: boolean;
  audioContext?: AudioContext;
  audioElement?: HTMLAudioElement;
  bufferSource?: AudioBufferSourceNode;
  mediaStream?: MediaStream;
  error: string | null;
  // New: Expose audio element for recording
  systemAudioElement?: HTMLAudioElement;
}

interface AudioManagerProps {
  externalMediaStream?: MediaStream | null;
  isUserMicOn?: boolean;
  elevenLabsAudio?: string | null;
  isAgentSpeaking?: boolean;
  onAgentAudioEnd?: () => void;
}

export function useAudioManager({
  externalMediaStream,
  isUserMicOn,
  elevenLabsAudio,
  isAgentSpeaking,
  onAgentAudioEnd
}: AudioManagerProps) {
  const audioRef = useRef<AudioManagerState>({
    isListening: false,
    isPlayingAgent: false,
    error: null,
    systemAudioElement: undefined
  });

  const [state, setState] = useState<AudioManagerState>({
    isListening: false,
    isPlayingAgent: false,
    error: null,
    systemAudioElement: undefined
  });

  // Handle user microphone setup from external stream
  useEffect(() => {
    if (externalMediaStream && isUserMicOn) {
      console.log("🎙️ Setting up user analyser from external media stream...");
      try {
        // Create audio context if not exists
        if (!audioRef.current.audioContext) {
          audioRef.current.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const audioContext = audioRef.current.audioContext;
        const source = audioContext.createMediaStreamSource(externalMediaStream);

        // Create analyser for user voice
        const analyser = new Analyser(source);

        // Store references
        audioRef.current.mediaStream = externalMediaStream;
        audioRef.current.userAnalyser = analyser;
        audioRef.current.isListening = true;

        setState(prev => ({
          ...prev,
          userAnalyser: analyser,
          isListening: true,
          error: null
        }));

        console.log("✅ User microphone analyser set up from external stream");

      } catch (err) {
        const error = 'Failed to set up microphone analyser from external stream.';
        audioRef.current.error = error;
        setState(prev => ({ ...prev, error }));
        console.error('❌ External stream analyser setup error:', err);
      }
    } else {
      // Clear user analyser when external stream is removed or mic is turned off
      if (audioRef.current.userAnalyser) {
        console.log("🎙️ Clearing user analyser (external stream removed or mic off)...");
        audioRef.current.userAnalyser = undefined;
        audioRef.current.mediaStream = undefined;
        audioRef.current.isListening = false;

        setState(prev => ({
          ...prev,
          userAnalyser: undefined,
          isListening: false
        }));
      }
    }
  }, [externalMediaStream, isUserMicOn]);

  // Handle ElevenLabs audio playback
  useEffect(() => {
    const playElevenLabsAudio = async (audioData: string) => {
      try {
        console.log("🎯 ANIMATION PRIORITY: Starting ElevenLabs audio playback...", {
          hasAudioData: !!audioData,
          isAgentSpeaking: isAgentSpeaking,
          dataType: audioData?.substring(0, 20),
          dataLength: audioData?.length
        });

        // Create audio context if not exists
        if (!audioRef.current.audioContext) {
          audioRef.current.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log("📐 Created new AudioContext", {
            sampleRate: audioRef.current.audioContext.sampleRate,
            state: audioRef.current.audioContext.state
          });
        }

        const audioContext = audioRef.current.audioContext;

        // Ensure audio context is in running state
        if (audioContext.state === 'suspended') {
          console.log("🔄 Resuming suspended audio context...");
          await audioContext.resume();
        }
        console.log("✅ AudioContext ready, state:", audioContext.state);

        // Determine and process audio URL - ALWAYS use proxy for external URLs
        let audioUrl = audioData;
        let useProxy = false;

        // Check if we need to process the URL
        if (!audioData.startsWith('data:') && !audioData.startsWith('blob:')) {
          if (audioData.startsWith('http')) {
            // ALWAYS use proxy for external URLs to avoid CORS
            console.log("🔄 FORCING PROXY: External URL detected, routing through proxy for animation support...");
            audioUrl = `/api/proxy-audio?url=${encodeURIComponent(audioData)}`;
            useProxy = true;
          } else {
            // Assume base64 data
            audioUrl = `data:audio/mpeg;base64,${audioData}`;
            console.log("📦 CONVERTED: Base64 data to data URL");
          }
        }

        console.log("🔗 AUDIO PROCESSING:", {
          original: audioData.substring(0, 80) + "...",
          processed: audioUrl.substring(0, 80) + "...",
          usingProxy: useProxy,
          isDataUrl: audioUrl.startsWith('data:'),
          isBlobUrl: audioUrl.startsWith('blob:'),
          isProxied: audioUrl.includes('/api/proxy-audio')
        });

        let audioBuffer: AudioBuffer | null = null;
        let animationEnabled = false;

        try {
          // PRIORITY 1: Try to fetch and decode for FULL animation support
          console.log("🚀 ATTEMPTING ANIMATION + AUDIO (BufferSource approach)...");

          const fetchOptions: RequestInit = {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            cache: 'default'
          };

          console.log("📡 Fetching audio...", { url: audioUrl.substring(0, 100), options: fetchOptions });
          const response = await fetch(audioUrl, fetchOptions);

          console.log("📊 Fetch response:", {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            corsHeaders: response.headers.get('access-control-allow-origin')
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          console.log("💾 Audio data fetched successfully:", {
            size: arrayBuffer.byteLength + " bytes",
            sizeMB: (arrayBuffer.byteLength / 1024 / 1024).toFixed(2) + " MB"
          });

          // Decode audio data
          console.log("🎵 Decoding audio buffer...");
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          animationEnabled = true;

          console.log("🎉 ANIMATION ENABLED! Audio decoded successfully:", {
            duration: audioBuffer.duration.toFixed(2) + "s",
            channels: audioBuffer.numberOfChannels,
            sampleRate: audioBuffer.sampleRate + " Hz",
            length: audioBuffer.length + " samples"
          });

        } catch (fetchError) {
          const error = fetchError as Error;
          console.error("⚠️ FETCH/DECODE FAILED:", {
            name: error.name,
            message: error.message,
            usingProxy: useProxy,
            url: audioUrl.substring(0, 100),
            stack: error.stack?.substring(0, 200)
          });

          // If proxy failed, this is a serious issue
          if (useProxy) {
            console.error("❌ PROXY FAILURE: Animation will not work without proxy");
          }

          animationEnabled = false;
        }

        if (animationEnabled && audioBuffer) {
          // SUCCESS: Full animation + audio with BufferSource
          console.log("🎨 ANIMATION MODE: Setting up audio pipeline...");

          const bufferSource = audioContext.createBufferSource();
          bufferSource.buffer = audioBuffer;

          const gainNode = audioContext.createGain();
          gainNode.gain.value = 1.0;

          // Connect: BufferSource -> GainNode -> [Analyser + Destination]
          bufferSource.connect(gainNode);

          // Create analyser for animation (connected to gain node)
          const analyser = new Analyser(gainNode);

          // Connect to destination for audio output
          gainNode.connect(audioContext.destination);

          // Verify analyser will get data with multiple checks
          const verifyAnimation = () => {
            let checkCount = 0;
            const maxChecks = 20; // Check for 4 seconds

            const animationCheck = setInterval(() => {
              checkCount++;

              if (analyser) {
                analyser.update();
                const dataArray = Array.from(analyser.data);
                const hasData = dataArray.some(v => v > 0);
                const maxValue = Math.max(...dataArray);
                const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

                console.log(`🎭 ANIMATION CHECK ${checkCount}/${maxChecks}:`, {
                  hasNonZeroData: hasData,
                  maxFrequencyValue: maxValue,
                  avgFrequencyValue: avgValue.toFixed(2),
                  firstTenBins: dataArray.slice(0, 10),
                  dataArrayLength: dataArray.length,
                  animationWorking: hasData ? "✅ YES!" : "❌ NO DATA",
                  bufferSourcePlaying: !!audioRef.current.bufferSource
                });

                // If we get data, animation is working
                if (hasData) {
                  console.log("🎉 ANIMATION CONFIRMED WORKING! Stopping checks.");
                  clearInterval(animationCheck);
                  return;
                }
              }

              // Stop checking after max attempts
              if (checkCount >= maxChecks) {
                console.error("❌ ANIMATION FAILED: No frequency data detected after", maxChecks, "checks");
                clearInterval(animationCheck);
              }
            }, 200);
          };

          // Start verification after a brief delay
          setTimeout(verifyAnimation, 300);

          console.log("🔗 Audio pipeline connected successfully:");
          console.log("   BufferSource → GainNode → [Analyser + AudioDestination]");

          // Store references
          audioRef.current.bufferSource = bufferSource;
          audioRef.current.agentAnalyser = analyser;
          audioRef.current.isPlayingAgent = true;

          setState(prev => ({
            ...prev,
            agentAnalyser: analyser,
            isPlayingAgent: true,
            error: null
          }));

          // Setup completion handler
          bufferSource.addEventListener('ended', () => {
            console.log("🏁 Audio playback completed, cleaning up...");
            audioRef.current.agentAnalyser = undefined;
            audioRef.current.bufferSource = undefined;
            audioRef.current.isPlayingAgent = false;

            setState(prev => ({
              ...prev,
              agentAnalyser: undefined,
              isPlayingAgent: false
            }));

            if (onAgentAudioEnd) {
              onAgentAudioEnd();
            }
          });

          // Start playback
          bufferSource.start(0);
          console.log("🎉 SUCCESS: Audio playing with FULL ANIMATION support!");

        } else {
          // FALLBACK: Try Audio element (audio only, limited/no animation)
          console.log("⚠️ FALLBACK: Using Audio element (limited animation capabilities)...");

          const audioElement = new Audio(audioData); // Use original URL for audio element
          audioElement.crossOrigin = "anonymous";
          audioElement.volume = 1.0;
          audioElement.preload = "auto";

          // Try to connect analyser (might work for some URLs)
          let fallbackAnalyser: Analyser | undefined;
          try {
            const source = audioContext.createMediaElementSource(audioElement);
            fallbackAnalyser = new Analyser(source);
            source.connect(audioContext.destination);

            console.log("🎯 Analyser connected to Audio element - checking for animation data...");

            // Enhanced check for animation data in fallback mode
            const checkFallbackAnimation = () => {
              let checkCount = 0;
              const maxChecks = 10;

              const fallbackCheck = setInterval(() => {
                checkCount++;

                if (fallbackAnalyser) {
                  fallbackAnalyser.update();
                  const dataArray = Array.from(fallbackAnalyser.data);
                  const hasData = dataArray.some(v => v > 0);
                  const maxValue = Math.max(...dataArray);

                  console.log(`🔊 FALLBACK CHECK ${checkCount}/${maxChecks}:`, {
                    hasData,
                    maxValue,
                    firstFiveBins: dataArray.slice(0, 5),
                    status: hasData ? "✅ WORKING" : "❌ NO DATA",
                    element: !!audioRef.current.audioElement
                  });

                  if (hasData) {
                    console.log("✅ FALLBACK ANIMATION WORKING!");
                    clearInterval(fallbackCheck);
                    return;
                  }
                }

                if (checkCount >= maxChecks) {
                  console.error("❌ FALLBACK FAILED: CORS is blocking frequency analysis");
                  clearInterval(fallbackCheck);
                }
              }, 500);
            };

            setTimeout(checkFallbackAnimation, 500);

          } catch (e) {
            const error = e as Error;
            console.warn("❌ Cannot analyze Audio element (CORS restriction):", error.message);
          }

          // Store references
          audioRef.current.audioElement = audioElement;
          audioRef.current.agentAnalyser = fallbackAnalyser;
          audioRef.current.isPlayingAgent = true;

          setState(prev => ({
            ...prev,
            agentAnalyser: fallbackAnalyser,
            isPlayingAgent: true,
            error: null
          }));

          // Setup event handlers
          audioElement.addEventListener('ended', () => {
            console.log("🏁 Audio ended (fallback mode)");
            audioRef.current.audioElement = undefined;
            audioRef.current.agentAnalyser = undefined;
            audioRef.current.isPlayingAgent = false;

            setState(prev => ({
              ...prev,
              agentAnalyser: undefined,
              isPlayingAgent: false
            }));

            if (onAgentAudioEnd) {
              onAgentAudioEnd();
            }
          });

          audioElement.addEventListener('error', (e) => {
            console.error("❌ Audio element error:", e);
            if (onAgentAudioEnd) {
              onAgentAudioEnd();
            }
          });

          // Play audio
          await audioElement.play();
          console.log("🔊 Audio playing (FALLBACK - animation may be limited)");
        }

      } catch (err) {
        const errorObj = err as Error;
        console.error('❌ CRITICAL ERROR in ElevenLabs audio playback:', {
          name: errorObj.name,
          message: errorObj.message,
          stack: errorObj.stack
        });

        const error = `Audio playback failed: ${errorObj.message}`;
        audioRef.current.error = error;
        setState(prev => ({ ...prev, error }));

        if (onAgentAudioEnd) {
          onAgentAudioEnd();
        }
      }
    };

    const stopAudio = () => {
      // Stop and clean up buffer source
      if (audioRef.current.bufferSource) {
        try {
          audioRef.current.bufferSource.stop();
        } catch (e) {
          // Already stopped
        }
        audioRef.current.bufferSource = undefined;
      }

      // Stop and clean up audio element
      if (audioRef.current.audioElement) {
        try {
          audioRef.current.audioElement.pause();
          audioRef.current.audioElement.currentTime = 0;
        } catch (e) {
          // Already stopped
        }
        audioRef.current.audioElement = undefined;
      }

      // Clean up shared state
      audioRef.current.agentAnalyser = undefined;
      audioRef.current.isPlayingAgent = false;

      setState(prev => ({
        ...prev,
        agentAnalyser: undefined,
        isPlayingAgent: false
      }));
    };

    if (elevenLabsAudio && isAgentSpeaking) {
      console.log("🔊 Starting audio playback and animation");
      playElevenLabsAudio(elevenLabsAudio);
    } else {
      console.log("🔊 Stopping audio playback and animation");
      stopAudio();
    }
  }, [elevenLabsAudio, isAgentSpeaking, onAgentAudioEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current.bufferSource) {
        try {
          audioRef.current.bufferSource.stop();
        } catch (e) {
          // Already stopped
        }
      }
      if (audioRef.current.audioElement) {
        audioRef.current.audioElement.pause();
      }
      if (audioRef.current.audioContext && audioRef.current.audioContext.state !== 'closed') {
        audioRef.current.audioContext.close().catch(() => {
          // Context already closed
        });
      }
    };
  }, []);

  return {
    ...state,
    audioRef: audioRef.current
  };
}
