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
    if (!sceneState.isInitialized) {
      console.log("🎬 ANIMATION: Waiting for scene initialization...");
      return;
    }

    console.log("🎬 ANIMATION: Starting animation loop");
    let frameCount = 0;
    let lastAnalyserCheck = 0;

    const animate = () => {
      frameCount++;
      const { sceneRef } = sceneState;

      if (!sceneRef.sphere || !sceneRef.backdrop || !sceneRef.composer) {
        if (frameCount % 60 === 0) { // Log every 60 frames
          console.log("🎬 ANIMATION: Waiting for scene objects to be ready...");
        }
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
      let analyserSource = 'none';

      // Log analyser status every 2 seconds
      if (t - lastAnalyserCheck > 2000) {
        lastAnalyserCheck = t;
        console.log('🎬 ANIMATION: Analyser status check:', {
          hasAgentAnalyser: !!audioState.audioRef.agentAnalyser,
          hasUserAnalyser: !!audioState.audioRef.userAnalyser,
          isPlayingAgent: audioState.isPlayingAgent,
          isAgentSpeaking: isAgentSpeaking,
          isListening: audioState.isListening,
          isUserMicOn: isUserMicOn,
          frameCount: frameCount
        });
      }

      // Priority 1: Agent audio when agent is speaking (check both states)
      if (audioState.audioRef.agentAnalyser && (audioState.isPlayingAgent || isAgentSpeaking)) {
        currentAnalyser = audioState.audioRef.agentAnalyser;
        analyserSource = 'agent-primary';
      }
      // Priority 2: User microphone when available and agent is not speaking
      else if (audioState.audioRef.userAnalyser && audioState.isListening && isUserMicOn && !isAgentSpeaking && !audioState.isPlayingAgent) {
        currentAnalyser = audioState.audioRef.userAnalyser;
        analyserSource = 'user-primary';
      }
      // Fallback: Use any available analyser
      else if (audioState.audioRef.agentAnalyser) {
        currentAnalyser = audioState.audioRef.agentAnalyser;
        analyserSource = 'agent-fallback';
      }
      else if (audioState.audioRef.userAnalyser && audioState.isListening) {
        currentAnalyser = audioState.audioRef.userAnalyser;
        analyserSource = 'user-fallback';
      }

      // Animate sphere if we have audio analyser
      if (currentAnalyser) {
        // Update audio analysis
        currentAnalyser.update();

        // Get frequency data
        const dataArray = Array.from(currentAnalyser.data);
        const hasData = dataArray.some(v => v > 0);
        const maxValue = Math.max(...dataArray);
        const bin1 = currentAnalyser.data[1];
        const bin2 = currentAnalyser.data[2];

        // Log animation data every 2 seconds when using analyser
        if (t - lastAnalyserCheck > 1900 && t - lastAnalyserCheck < 2100) { // Within 200ms of analyser check
          console.log('🎭 ANIMATION: Processing frequency data:', {
            source: analyserSource,
            hasData,
            maxValue,
            bin1Value: bin1,
            bin2Value: bin2,
            scaleMultiplier: (0.2 * bin1) / 255,
            firstEightBins: dataArray.slice(0, 8),
            animating: hasData ? '✅ ANIMATING' : '❌ NO DATA'
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
        // No analyser available - log this occasionally
        if (frameCount % 120 === 0) { // Every 2 seconds at 60fps
          console.log('🎭 ANIMATION: No analyser available for animation:', {
            analyserSource,
            hasAgentAnalyser: !!audioState.audioRef.agentAnalyser,
            hasUserAnalyser: !!audioState.audioRef.userAnalyser,
            isPlayingAgent: audioState.isPlayingAgent,
            isAgentSpeaking: isAgentSpeaking,
            frameCount
          });
        }

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
