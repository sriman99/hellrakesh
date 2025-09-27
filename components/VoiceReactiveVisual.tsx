import { useRef, useEffect } from 'react';
import { useThreeScene } from '@/components/voice-reactive/useThreeScene';
import { useAudioManager } from '@/components/voice-reactive/useAudioManager';
import { useAnimationLoop } from '@/components/voice-reactive/useAnimationLoop';

interface VoiceReactiveVisualProps {
  className?: string;
  // ElevenLabs audio data - can be base64 string or audio URL
  elevenLabsAudio?: string | null;
  // Whether the agent should be speaking (triggers audio playback)
  isAgentSpeaking?: boolean;
  // External media stream (from interview page)
  externalMediaStream?: MediaStream | null;
  // Whether user microphone is enabled (from parent component)
  isUserMicOn?: boolean;
  // Callback when agent audio ends
  onAgentAudioEnd?: () => void;
  // New: Callback to provide system audio element for recording
  onSystemAudioElementReady?: (audioElement: HTMLAudioElement | null) => void;
}

export default function VoiceReactiveVisual({
  className = '',
  elevenLabsAudio = null,
  isAgentSpeaking = false,
  externalMediaStream = null,
  isUserMicOn = false,
  onAgentAudioEnd,
  onSystemAudioElementReady
}: VoiceReactiveVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Three.js scene
  const sceneState = useThreeScene(canvasRef);

  // Handle audio management (user mic + agent audio)
  const audioState = useAudioManager({
    externalMediaStream,
    isUserMicOn,
    elevenLabsAudio,
    isAgentSpeaking,
    onAgentAudioEnd
  });

  // Notify parent component when system audio element is ready
  useEffect(() => {
    if (onSystemAudioElementReady) {
      onSystemAudioElementReady(audioState.systemAudioElement || null);
    }
  }, [audioState.systemAudioElement, onSystemAudioElementReady]);

  // Run animation loop
  useAnimationLoop({
    sceneState,
    audioState,
    isUserMicOn,
    isAgentSpeaking
  });

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Error display */}
      {audioState.error && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-red-400/30">
          {audioState.error}
        </div>
      )}

      {/* Scene initialization error */}
      {sceneState.error && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-red-400/30">
          {sceneState.error}
        </div>
      )}
    </div>
  );
}