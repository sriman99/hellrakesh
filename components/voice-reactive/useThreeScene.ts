import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { fs as backdropFS, vs as backdropVS } from '@/lib/design/backdrop-shader';
import { vs as sphereVS } from '@/lib/design/sphere-shader';

export interface ThreeSceneState {
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  composer?: EffectComposer;
  sphere?: THREE.Mesh;
  backdrop?: THREE.Mesh;
  rotation?: THREE.Vector3;
  prevTime?: number;
  animationId?: number;
}

export function useThreeScene(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const sceneRef = useRef<ThreeSceneState>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      sphere.visible = true;

      // Load EXR environment map (async, doesn't block)
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
      };

      setIsInitialized(true);
      console.log("✅ Three.js scene initialized successfully");
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };

    } catch (err) {
      console.error('❌ Scene initialization error:', err);
      setError('Failed to initialize 3D scene');
    }
  };

  useEffect(() => {
    const cleanup = initScene();
    
    return () => {
      if (cleanup) cleanup();
      
      // Cleanup Three.js objects
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
      if (sceneRef.current.composer) {
        sceneRef.current.composer.dispose();
      }
    };
  }, []);

  return {
    sceneRef: sceneRef.current,
    isInitialized,
    error
  };
}