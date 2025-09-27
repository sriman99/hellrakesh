import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { Analyser } from '../design/analyser';
import { fs as backdropFS, vs as backdropVS } from '../design/backdrop-shader';
import { vs as sphereVS } from '../design/sphere-shader';

interface VoiceReactiveVisualProps {
  className?: string;
}

export default function VoiceReactiveVisual({ className = '' }: VoiceReactiveVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    composer?: EffectComposer;
    sphere?: THREE.Mesh;
    backdrop?: THREE.Mesh;
    analyser?: Analyser;
    animationId?: number;
    audioContext?: AudioContext;
    mediaStream?: MediaStream;
    rotation?: THREE.Vector3;
    prevTime?: number;
  }>({});

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string>('');

  const startListening = async () => {
    try {
      setError('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false 
        } 
      });
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create analyser
      const analyser = new Analyser(source);
      
      // Store references
      sceneRef.current.audioContext = audioContext;
      sceneRef.current.mediaStream = stream;
      sceneRef.current.analyser = analyser;
      
      setIsListening(true);
      
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access.');
      console.error('Microphone access error:', err);
    }
  };

  const stopListening = () => {
    if (sceneRef.current.mediaStream) {
      sceneRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (sceneRef.current.audioContext) {
      sceneRef.current.audioContext.close();
    }
    setIsListening(false);
  };

  const initScene = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);

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

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(2, -2, 5);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create sphere
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

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      composer,
      sphere,
      backdrop,
      rotation: new THREE.Vector3(0, 0, 0),
      prevTime: 0,
    };

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  useEffect(() => {
    const cleanup = initScene();
    
    // Animation function inside useEffect to avoid dependency issues
    const animate = () => {
      if (!sceneRef.current.sphere || !sceneRef.current.backdrop || !sceneRef.current.composer) {
        sceneRef.current.animationId = requestAnimationFrame(animate);
        return;
      }

      const { analyser, sphere, backdrop, camera, composer, rotation } = sceneRef.current;

      const t = performance.now();
      const dt = (t - (sceneRef.current.prevTime || 0)) / (1000 / 60);
      sceneRef.current.prevTime = t;

      // Always update backdrop (for background animation)
      const backdropMaterial = backdrop.material as THREE.RawShaderMaterial;
      backdropMaterial.uniforms.rand.value = Math.random() * 10000;

      // Only animate sphere if we have audio analyser and are listening
      if (analyser && sceneRef.current.analyser) {
        // Update audio analysis
        analyser.update();

        // Update sphere based on audio
        const sphereMaterial = sphere.material as THREE.MeshStandardMaterial;
        if (sphereMaterial.userData?.shader) {
          // Scale sphere based on audio
          sphere.scale.setScalar(1 + (0.2 * analyser.data[1]) / 255);

          // Rotate camera based on audio
          const f = 0.001;
          if (rotation) {
            rotation.x += (dt * f * 0.5 * analyser.data[1]) / 255;
            rotation.z += (dt * f * 0.5 * analyser.data[1]) / 255;
            rotation.y += (dt * f * 0.25 * analyser.data[2]) / 255;

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
          shader.uniforms.time.value += (dt * 0.1 * analyser.data[0]) / 255;
          shader.uniforms.inputData.value.set(
            (1 * analyser.data[0]) / 255,
            (0.1 * analyser.data[1]) / 255,
            (10 * analyser.data[2]) / 255,
            0,
          );
          shader.uniforms.outputData.value.set(
            (2 * analyser.data[0]) / 255,
            (0.1 * analyser.data[1]) / 255,
            (10 * analyser.data[2]) / 255,
            0,
          );
        }
      } else {
        // Reset sphere to default state when not listening
        sphere.scale.setScalar(1);
        if (camera) {
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
      // Cleanup
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      
      stopListening();
      
      if (cleanup) {
        cleanup();
      }
      
      // Dispose Three.js objects
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
      if (sceneRef.current.composer) {
        sceneRef.current.composer.dispose();
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full absolute inset-0"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Error message - top center */}
      {error && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-red-400/30">
          {error}
        </div>
      )}

      {/* Status message - top center */}
      {isListening && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-green-400/30">
          🎵 Listening...
        </div>
      )}
      
      {/* Record Button - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={isListening ? stopListening : startListening}
          className="w-16 h-16 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 flex items-center justify-center hover:scale-105 transition-all duration-300"
        >
          <svg 
            viewBox="0 0 100 100" 
            width="32px" 
            height="32px" 
            fill={isListening ? "#dc2626" : "#c80000"} 
            xmlns="http://www.w3.org/2000/svg"
            className={isListening ? "animate-pulse" : ""}
          >
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
}