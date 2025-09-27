import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { Analyser } from '@/lib/design/analyser';
import { fs as backdropFS, vs as backdropVS } from '@/lib/design/backdrop-shader';
import { vs as sphereVS } from '@/lib/design/sphere-shader';

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
}

export default function VoiceReactiveVisual({ 
  className = '', 
  elevenLabsAudio = null,
  isAgentSpeaking = false,
  externalMediaStream = null,
  isUserMicOn = false,
  onAgentAudioEnd
}: VoiceReactiveVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    composer?: EffectComposer;
    sphere?: THREE.Mesh;
    backdrop?: THREE.Mesh;
    userAnalyser?: Analyser;  // For user microphone
    agentAnalyser?: Analyser; // For ElevenLabs audio
    analyser?: Analyser;      // Current analyser (for compatibility)
    animationId?: number;
    audioContext?: AudioContext;
    mediaStream?: MediaStream;
    rotation?: THREE.Vector3;
    prevTime?: number;
    audioElement?: HTMLAudioElement;
  }>({});

  const [isListening, setIsListening] = useState(false);
  const [isPlayingAgent, setIsPlayingAgent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Start listening to user microphone (like the working reference)
  const startListening = async () => {
    try {
      setError(null);
      console.log("🎙️ Starting microphone listening...");
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false 
        } 
      });
      
      // Create audio context if not exists
      if (!sceneRef.current.audioContext) {
        sceneRef.current.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = sceneRef.current.audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create analyser for user voice
      const analyser = new Analyser(source);
      
      // Store references
      sceneRef.current.mediaStream = stream;
      sceneRef.current.userAnalyser = analyser;
      sceneRef.current.analyser = analyser;  // Also store as main analyser like reference
      
      setIsListening(true);
      console.log("✅ Microphone listening started");
      
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access.');
      console.error('❌ Microphone access error:', err);
    }
  };

  // Stop listening to user microphone
  const stopListening = () => {
    console.log("🎙️ Stopping microphone listening...");
    if (sceneRef.current.mediaStream) {
      sceneRef.current.mediaStream.getTracks().forEach(track => track.stop());
      sceneRef.current.mediaStream = undefined;
    }
    sceneRef.current.userAnalyser = undefined;
    sceneRef.current.analyser = undefined;  // Clear main analyser too
    setIsListening(false);
  };

  // Handle ElevenLabs audio playback (similar to current implementation but cleaner)
  const playElevenLabsAudio = async (audioData: string) => {
    try {
      console.log("🎨 Starting ElevenLabs audio playback...");
      setError(null);
      setIsPlayingAgent(true);

      // Create audio element from ElevenLabs data
      const audioSrc = audioData.startsWith('data:') 
        ? audioData 
        : audioData.startsWith('http') || audioData.startsWith('blob:')
          ? audioData 
          : `data:audio/mpeg;base64,${audioData}`;
      
      const audioElement = new Audio(audioSrc);
      
      // Create audio context if not exists
      if (!sceneRef.current.audioContext) {
        sceneRef.current.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = sceneRef.current.audioContext;
      const source = audioContext.createMediaElementSource(audioElement);
      const analyser = new Analyser(source);
      
      // Connect to output so we can hear it
      source.connect(audioContext.destination);
      
      // Store references
      sceneRef.current.audioElement = audioElement;
      sceneRef.current.agentAnalyser = analyser;
      
      // Setup event handlers
      const handleAudioEnd = () => {
        console.log("🎨 ElevenLabs audio ended");
        setIsPlayingAgent(false);
        sceneRef.current.agentAnalyser = undefined;
        sceneRef.current.audioElement = undefined;
        // Notify parent that agent audio ended
        if (onAgentAudioEnd) {
          onAgentAudioEnd();
        }
      };

      const handleAudioError = (error: any) => {
        console.error("🎨 ElevenLabs audio error:", error);
        setError('Failed to play ElevenLabs audio');
        setIsPlayingAgent(false);
        sceneRef.current.agentAnalyser = undefined;
        sceneRef.current.audioElement = undefined;
        // Notify parent that agent audio ended due to error
        if (onAgentAudioEnd) {
          onAgentAudioEnd();
        }
      };
      
      audioElement.addEventListener('ended', handleAudioEnd);
      audioElement.addEventListener('error', handleAudioError);
      
      // Play audio
      await audioElement.play();
      console.log("✅ ElevenLabs audio playback started");
      
    } catch (err) {
      console.error('❌ ElevenLabs audio playback error:', err);
      setError('Failed to play ElevenLabs audio');
      setIsPlayingAgent(false);
    }
  };

  // Stop ElevenLabs audio
  const stopElevenLabsAudio = () => {
    if (sceneRef.current.audioElement) {
      sceneRef.current.audioElement.pause();
      sceneRef.current.audioElement = undefined;
    }
    sceneRef.current.agentAnalyser = undefined;
    setIsPlayingAgent(false);
  };

  // Initialize Three.js scene
  const initScene = () => {
    if (!canvasRef.current) return;

    try {
      console.log("🎨 Initializing Three.js scene...");

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x100c14);
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(2, -2, 5);

      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: false,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Create backdrop
      const backdrop = new THREE.Mesh(
        new THREE.IcosahedronGeometry(10, 5),
        new THREE.RawShaderMaterial({
          uniforms: {
            resolution: { value: new THREE.Vector2(1, 1) },
            rand: { value: 0 },
          },
          vertexShader: backdropVS,
          fragmentShader: backdropFS,
          glslVersion: THREE.GLSL3,
        }),
      );
      backdrop.material.side = THREE.BackSide;
      scene.add(backdrop);

      // Create sphere geometry and material
      const geometry = new THREE.IcosahedronGeometry(1, 10);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x000010,
        metalness: 0.5,
        roughness: 0.1,
        emissive: 0x000010,
        emissiveIntensity: 1.5,
      });

      // Add custom shader to sphere material
      sphereMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 };
        shader.uniforms.inputData = { value: new THREE.Vector4() };
        shader.uniforms.outputData = { value: new THREE.Vector4() };

        // Store shader reference
        sphereMaterial.userData = { ...sphereMaterial.userData, shader };
        shader.vertexShader = sphereVS;
      };

      const sphere = new THREE.Mesh(geometry, sphereMaterial);
      scene.add(sphere);
      sphere.visible = true; // Make sphere visible immediately

      // Load EXR environment map (but don't wait for it)
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      new EXRLoader().load('/piz_compressed.exr', (texture: THREE.Texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        sphereMaterial.envMap = exrCubeRenderTarget.texture;
      });

      // Setup post-processing
      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        5,
        0.5,
        0,
      );
      const fxaaPass = new ShaderPass(FXAAShader);

      const composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        const dPR = renderer.getPixelRatio();
        const w = window.innerWidth;
        const h = window.innerHeight;
        (backdrop.material as THREE.RawShaderMaterial).uniforms.resolution.value.set(w * dPR, h * dPR);
        renderer.setSize(w, h);
        composer.setSize(w, h);
        fxaaPass.material.uniforms['resolution'].value.set(1 / (w * dPR), 1 / (h * dPR));
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      // Store scene objects
      sceneRef.current = {
        scene,
        camera,
        renderer,
        sphere,
        backdrop,
        composer,
        rotation: new THREE.Vector3(0, 0, 0),
        prevTime: 0,
        animationId: 0,
        audioContext: undefined,
        audioElement: undefined,
        userAnalyser: undefined,
        agentAnalyser: undefined,
        analyser: undefined
      };

      console.log("✅ Three.js scene initialized successfully");
      
      return () => {
        // Cleanup function
        window.removeEventListener('resize', handleResize);
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        if (sceneRef.current.renderer) {
          sceneRef.current.renderer.dispose();
        }
        if (sceneRef.current.audioContext) {
          sceneRef.current.audioContext.close();
        }
      };

    } catch (err) {
      console.error('❌ Scene initialization error:', err);
      setError('Failed to initialize 3D scene');
    }
  };

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, []);

  // Use external media stream for user audio analysis
  useEffect(() => {
    if (externalMediaStream) {
      console.log("🎙️ Using external media stream for animation");
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(externalMediaStream);
        const analyser = new Analyser(source);
        
        // Store references
        sceneRef.current.userAnalyser = analyser;
        sceneRef.current.analyser = analyser;  // Also store as main analyser
        sceneRef.current.audioContext = audioContext;
        
        setIsListening(true);
        console.log("✅ External media stream connected to animation");
      } catch (err) {
        console.error('❌ Failed to connect external media stream:', err);
      }
    } else {
      // Auto-start our own microphone if no external stream
      const autoStartListening = async () => {
        try {
          await startListening();
          console.log("✅ Auto-started microphone for user animation");
        } catch (err) {
          console.log("⚠️ Could not auto-start microphone");
        }
      };
      
      setTimeout(autoStartListening, 1000);
    }
  }, [externalMediaStream]);

  // Animation loop effect
  useEffect(() => {
    
    // Animation function inside useEffect to avoid dependency issues
    const animate = () => {
      if (!sceneRef.current.sphere || !sceneRef.current.backdrop || !sceneRef.current.composer) {
        sceneRef.current.animationId = requestAnimationFrame(animate);
        return;
      }

      const { sphere, backdrop, camera, composer, rotation } = sceneRef.current;

      const t = performance.now();
      const dt = (t - (sceneRef.current.prevTime || 0)) / (1000 / 60);
      sceneRef.current.prevTime = t;

      // Always update backdrop (for background animation)
      const backdropMaterial = backdrop.material as THREE.RawShaderMaterial;
      backdropMaterial.uniforms.rand.value = Math.random() * 10000;

      // Get current analyser - prioritize user microphone when listening
      let currentAnalyser: Analyser | undefined;
      
      if (sceneRef.current.userAnalyser && isListening) {
        currentAnalyser = sceneRef.current.userAnalyser;
        console.log('🎙️ Using user microphone for animation');
      } else if (sceneRef.current.agentAnalyser && isAgentSpeaking) {
        currentAnalyser = sceneRef.current.agentAnalyser;
        console.log('🔊 Using ElevenLabs audio for animation');
      } else if (sceneRef.current.analyser) {
        currentAnalyser = sceneRef.current.analyser;
        console.log('🎨 Using legacy analyser for animation');
      }

      // Animate sphere if we have audio analyser (EXACTLY like reference)
      if (currentAnalyser) {
        // Update audio analysis
        currentAnalyser.update();

        // Update sphere based on audio
        const sphereMaterial = sphere.material as THREE.MeshStandardMaterial;
        if (sphereMaterial.userData?.shader) {
          // Scale sphere based on audio
          sphere.scale.setScalar(1 + (0.2 * currentAnalyser.data[1]) / 255);

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
        // Reset sphere to default state when not playing (only if not already reset)
        if (sphere.scale.x !== 1) {
          sphere.scale.setScalar(1);
        }
        if (camera && (camera.position.x !== 2 || camera.position.y !== -2 || camera.position.z !== 5)) {
          camera.position.set(2, -2, 5);
          camera.lookAt(sphere.position);
        }
      }

      composer.render();
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    sceneRef.current.animationId = requestAnimationFrame(animate);

    return () => {
      // Cleanup animation
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      
      // Stop any playing audio
      stopAudio();
      
      // Dispose Three.js objects
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
      if (sceneRef.current.composer) {
        sceneRef.current.composer.dispose();
      }
    };
  }, [isListening, isAgentSpeaking]);

  // Handle ElevenLabs audio playback and animation
  useEffect(() => {
    console.log("🎨 VoiceReactiveVisual props changed:", {
      hasAudio: !!elevenLabsAudio,
      isAgentSpeaking,
      audioType: elevenLabsAudio?.substring(0, 20) + "..."
    });
    
    if (elevenLabsAudio && isAgentSpeaking) {
      console.log("🎨 Starting audio playback and animation");
      playElevenLabsAudio(elevenLabsAudio);
    } else {
      console.log("🎨 Stopping audio playback and animation");
      stopAudio();
    }
  }, [elevenLabsAudio, isAgentSpeaking]);

  // Handle external media stream for user microphone
  useEffect(() => {
    if (externalMediaStream && isUserMicOn) {
      console.log("🎙️ Setting up user analyser from external media stream...");
      try {
        // Create audio context if not exists
        if (!sceneRef.current.audioContext) {
          sceneRef.current.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioContext = sceneRef.current.audioContext;
        const source = audioContext.createMediaStreamSource(externalMediaStream);
        
        // Create analyser for user voice
        const analyser = new Analyser(source);
        
        // Store references
        sceneRef.current.mediaStream = externalMediaStream;
        sceneRef.current.userAnalyser = analyser;
        
        setIsListening(true);
        console.log("✅ User microphone analyser set up from external stream");
        
      } catch (err) {
        setError('Failed to set up microphone analyser from external stream.');
        console.error('❌ External stream analyser setup error:', err);
      }
    } else {
      // Clear user analyser when external stream is removed or mic is turned off
      if (sceneRef.current.userAnalyser) {
        console.log("🎙️ Clearing user analyser (external stream removed or mic off)...");
        sceneRef.current.userAnalyser = undefined;
        sceneRef.current.mediaStream = undefined;
        setIsListening(false);
      }
    }
  }, [externalMediaStream, isUserMicOn]);

  const stopAudio = () => {
    // Stop any playing audio
    if (sceneRef.current.audioElement) {
      sceneRef.current.audioElement.pause();
      sceneRef.current.audioElement = undefined;
    }
    
    // Close audio context
    if (sceneRef.current.audioContext) {
      sceneRef.current.audioContext.close();
      sceneRef.current.audioContext = undefined;
    }
    
    // Clear analyser
    sceneRef.current.analyser = undefined;
    setIsPlaying(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full absolute inset-0"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}