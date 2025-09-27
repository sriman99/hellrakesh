import { useEffect } from 'react';
import * as THREE from 'three';
import { ThreeSceneState } from './useThreeScene';
import { AudioManagerState } from './useAudioManager';
import { Analyser } from '@/lib/design/analyser';

interface AnimationLoopProps {
  sceneState: {
    sceneRef: ThreeSceneState;
    isInitialized: boolean;
  };
  audioState: AudioManagerState & {
    audioRef: AudioManagerState;
  };
  isUserMicOn?: boolean;
  isAgentSpeaking?: boolean;
}

export function useAnimationLoop({
  sceneState,
  audioState,
  isUserMicOn,
  isAgentSpeaking
}: AnimationLoopProps) {

  useEffect(() => {
    if (!sceneState.isInitialized) return;

    const animate = () => {
      const { sceneRef } = sceneState;
      
      if (!sceneRef.sphere || !sceneRef.backdrop || !sceneRef.composer) {
        sceneRef.animationId = requestAnimationFrame(animate);
        return;
      }

      const { sphere, backdrop, camera, composer, rotation } = sceneRef;

      const t = performance.now();
      const dt = (t - (sceneRef.prevTime || 0)) / (1000 / 60);
      sceneRef.prevTime = t;

      // Always update backdrop (for background animation)
      const backdropMaterial = backdrop.material as THREE.RawShaderMaterial;
      backdropMaterial.uniforms.rand.value = Math.random() * 10000;

      // Get current analyser - prioritize agent audio when speaking
      let currentAnalyser: Analyser | undefined;
      
      // Priority 1: Agent audio when agent is speaking (check both states)
      if (audioState.audioRef.agentAnalyser && (audioState.isPlayingAgent || isAgentSpeaking)) {
        currentAnalyser = audioState.audioRef.agentAnalyser;
        // Only log occasionally to avoid spam
        if (Math.random() < 0.01) { // 1% chance
          console.log('🔊 ANIMATION: Using ElevenLabs audio', {
            isPlayingAgent: audioState.isPlayingAgent,
            isAgentSpeaking: isAgentSpeaking,
            hasAnalyser: !!audioState.audioRef.agentAnalyser
          });
        }
      }
      // Priority 2: User microphone when available and agent is not speaking
      else if (audioState.audioRef.userAnalyser && audioState.isListening && isUserMicOn && !isAgentSpeaking && !audioState.isPlayingAgent) {
        currentAnalyser = audioState.audioRef.userAnalyser;
        if (Math.random() < 0.01) { // 1% chance
          console.log('🎙️ ANIMATION: Using user microphone');
        }
      }
      // Fallback: Use any available analyser
      else if (audioState.audioRef.agentAnalyser) {
        currentAnalyser = audioState.audioRef.agentAnalyser;
        if (Math.random() < 0.01) { // 1% chance
          console.log('🔊 ANIMATION: Fallback ElevenLabs audio');
        }
      }
      else if (audioState.audioRef.userAnalyser && audioState.isListening) {
        currentAnalyser = audioState.audioRef.userAnalyser;
        if (Math.random() < 0.01) { // 1% chance
          console.log('🎙️ ANIMATION: Fallback user microphone');
        }
      }

      // Animate sphere if we have audio analyser
      if (currentAnalyser) {
        // Update audio analysis
        currentAnalyser.update();

        // Debug frequency data occasionally
        if (Math.random() < 0.005) { // 0.5% chance to avoid spam
          const hasData = currentAnalyser.data.some(v => v > 0);
          const maxValue = Math.max(...Array.from(currentAnalyser.data));
          console.log('🎭 ANIMATION DATA:', {
            hasData,
            maxValue,
            bins: Array.from(currentAnalyser.data.slice(0, 5)),
            animating: hasData ? '✅' : '❌'
          });
        }

        // Update sphere based on audio
        const sphereMaterial = sphere.material as THREE.MeshStandardMaterial;
        if (sphereMaterial.userData?.shader) {
          // Scale sphere based on audio
          const scaleValue = 1 + (0.2 * currentAnalyser.data[1]) / 255;
          sphere.scale.setScalar(scaleValue);

          // Rotate camera based on audio
          const f = 0.001;
          if (rotation) {
            rotation.x += (dt * f * 0.5 * currentAnalyser.data[1]) / 255;
            rotation.z += (dt * f * 0.5 * currentAnalyser.data[1]) / 255;
            rotation.y += (dt * f * 0.25 * currentAnalyser.data[2]) / 255;

            const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
            const quaternion = new THREE.Quaternion().setFromEuler(euler);
            const vector = new THREE.Vector3(0, 0, 5);
            vector.applyQuaternion(quaternion);
            if (camera) {
              camera.position.copy(vector);
              camera.lookAt(sphere.position);
            }
          }

          // Update shader uniforms
          const shader = sphereMaterial.userData.shader;
          shader.uniforms.time.value += (dt * 0.1 * currentAnalyser.data[0]) / 255;
          shader.uniforms.inputData.value.set(
            (1 * currentAnalyser.data[0]) / 255,
            (0.1 * currentAnalyser.data[1]) / 255,
            (10 * currentAnalyser.data[2]) / 255,
            0,
          );
          shader.uniforms.outputData.value.set(
            (2 * currentAnalyser.data[0]) / 255,
            (0.1 * currentAnalyser.data[1]) / 255,
            (10 * currentAnalyser.data[2]) / 255,
            0,
          );
        }
      } else {
        // Reset sphere to default state when not animating (prevent flickering)
        if (Math.abs(sphere.scale.x - 1) > 0.01) {
          sphere.scale.setScalar(1);
        }
        if (camera) {
          const targetPos = new THREE.Vector3(2, -2, 5);
          if (camera.position.distanceTo(targetPos) > 0.1) {
            camera.position.set(2, -2, 5);
            camera.lookAt(sphere.position);
          }
        }
      }

      composer.render();
      sceneRef.animationId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    const { sceneRef } = sceneState;
    sceneRef.animationId = requestAnimationFrame(animate);

    return () => {
      if (sceneRef.animationId) {
        cancelAnimationFrame(sceneRef.animationId);
      }
    };
  }, [
    sceneState.isInitialized, 
    audioState.isListening, 
    audioState.isPlayingAgent,
    isUserMicOn, 
    isAgentSpeaking
  ]);
}
