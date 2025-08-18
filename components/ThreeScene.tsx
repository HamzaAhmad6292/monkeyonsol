"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import SceneInit from '@/lib/SceneInit'

interface ThreeSceneProps {
  canvasId?: string;
  modelPath?: string;
  className?: string;
}

const WALKING_PATH = '/assets/skib/final.glb';

// Animation mapping for buttons and triggering
const animationButtonMap: { key: string; label: string }[] = [
  { key: "Idle_1", label: "Idle 1" },
  { key: "Idle_2", label: "Idle 2" },
  { key: "Talking", label: "Talking" },
];

// Helper: map animation names to display labels
const animationDisplayLabels: Record<string, string> = {
  Idle_1: "Idle 1",
  Idle_2: "Idle 2",
  Talking: "Talking",
};

export default function ThreeScene({
  canvasId = 'myThreeJsCanvas',
  modelPath = WALKING_PATH,
  className = ""
}: ThreeSceneProps) {
  const sceneInitRef = useRef<SceneInit | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({})
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)
  const windowEventHandlerRef = useRef<((e: Event) => void) | null>(null)

  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentName, setCurrentName] = useState<string | null>(null)
  const [available, setAvailable] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const play = (name: string) => {
    const next = actionsRef.current[name];
    if (!next) return;

    const prev = currentActionRef.current;
    if (prev === next) return;

    if (prev) prev.fadeOut(0.2);
    next.reset().fadeIn(0.2).play();
    currentActionRef.current = next;
    setCurrentName(name);

    // Log animation trigger
    console.log(
      `[ThreeScene] Animation triggered:`,
      `name="${name}", display="${animationButtonMap.find(anim => anim.key === name)?.label || name}"`
    );
  };

  useEffect(() => {
    try {
      const scene = new SceneInit(canvasId);
      scene.initialize();
      scene.animate();
      sceneInitRef.current = scene;
    } catch (err) {
      console.error('Scene initialization failed:', err);
      setError('Failed to initialize 3D scene');
      setLoading(false);
      return;
    }

    const gltfLoader = new GLTFLoader();
    let baseModel: THREE.Group | null = null;

    gltfLoader.load(
      modelPath,
      (gltf: GLTF) => {
        try {
          const group = gltf.scene as THREE.Group;
          baseModel = group;
          modelRef.current = group;

          // Transform (your values kept)
          group.rotation.y = 0;
          group.position.set(0, -950, -350);
          group.scale.set(250, 250, 4.6);
          group.visible = true;

          // Materials
          group.traverse((child: THREE.Object3D) => {
            const maybeMesh = child as THREE.Mesh;
            if ((maybeMesh as any).isMesh) {
              maybeMesh.castShadow = true;
              maybeMesh.receiveShadow = true;
              const materialOrArray = maybeMesh.material as THREE.Material | THREE.Material[] | undefined;
              const materials = Array.isArray(materialOrArray) ? materialOrArray : materialOrArray ? [materialOrArray] : [];
              materials.forEach((mat) => {
                const std = mat as unknown as THREE.MeshStandardMaterial;
                if (std && (std as any).isMeshStandardMaterial) {
                  std.envMapIntensity = Math.min(1.25, (std.envMapIntensity ?? 1.0) * 1.0);
                  if (typeof std.roughness === 'number') std.roughness = Math.max(0.2, Math.min(0.95, std.roughness));
                  if (typeof std.metalness === 'number') std.metalness = Math.min(0.6, (std.metalness ?? 0.0) + 0.05);
                }
              });
            }
          });

          // Add to scene
          if (!sceneInitRef.current?.scene) throw new Error('Scene not available');
          sceneInitRef.current.scene.add(group);

          // Mixer
          const mixer = new THREE.AnimationMixer(group);
          mixerRef.current = mixer;
          sceneInitRef.current?.setAnimationMixer(mixer);

          // --- Animations: use ALL clips, with TS-safe types ---
          const clips: THREE.AnimationClip[] = gltf.animations ?? [];
          const names: string[] = [];

          // (Optional) ensure unique button labels if clips share names
          const used = new Set<string>();
          const uniqueName = (base: string) => {
            let name = base || 'Animation';
            let k = 1;
            while (used.has(name)) name = `${base}_${k++}`;
            used.add(name);
            return name;
          };

          clips.forEach((clip: THREE.AnimationClip, i: number) => {
            const action = mixer.clipAction(clip);
            action.enabled = true;
            action.setLoop(THREE.LoopRepeat, Infinity);

            const base = clip.name?.trim() || `Animation_${i + 1}`;
            const name = uniqueName(base);

            actionsRef.current[name] = action;
            names.push(name);
          });

          setAvailable(names);
          setLoading(false);
          setLoadingProgress(100);

          // Log available animation names for debugging
          console.log('[ThreeScene] Available animation names:', names);

          // Autoplay first
          if (names.length > 0) {
            setTimeout(() => play(names[0]), 300);
          }

        } catch (err) {
          console.error('Error setting up model:', err);
          setError('Failed to setup 3D model');
          setLoading(false);
        }
      },
      (progress: ProgressEvent<EventTarget>) => {
        const total = progress.total || 0;
        const loaded = progress.loaded || 0;
        const percentage = total > 0 ? (loaded / total) * 100 : 0;
        setLoadingProgress(percentage);
      },
      (err: unknown) => {
        console.error('Error loading GLTF:', err);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    );

    // Listen for avatar:state events
    const handleAvatarState = (e: Event) => {
      // @ts-ignore
      const state = e.detail?.state;
      if (!state) return;

      // Get available animation names
      const availableNames = Object.keys(actionsRef.current);
      console.log('[ThreeScene] Available animations:', availableNames);
      console.log('[ThreeScene] Requested state:', state);

      // Map avatar states to animation names - try multiple possible names
      let anim: string | null = null;

      if (state === 'talking') {
        // Try to find talking animation
        anim = availableNames.find(name =>
          name.toLowerCase().includes('talk') ||
          name.toLowerCase().includes('speak') ||
          name === 'Talking'
        ) || null;
      } else if (state === 'idle2') {
        // Try to find second idle animation
        anim = availableNames.find(name =>
          name.toLowerCase().includes('idle') && (name.includes('2') || name.includes('_2')) ||
          name === 'Idle_2'
        ) || availableNames.find(name => name.toLowerCase().includes('idle')) || null;
      } else if (state === 'idle1') {
        // Try to find first idle animation
        anim = availableNames.find(name =>
          name.toLowerCase().includes('idle') && (name.includes('1') || name.includes('_1')) ||
          name === 'Idle_1'
        ) || availableNames.find(name => name.toLowerCase().includes('idle')) || availableNames[0] || null;
      }

      console.log('[ThreeScene] Mapped animation:', anim);

      // Only play if available
      if (anim && actionsRef.current[anim]) {
        play(anim);
      } else {
        console.warn('[ThreeScene] Animation for state', state, 'not found! Available:', availableNames);
      }
    };

    window.addEventListener('avatar:state', handleAvatarState);
    windowEventHandlerRef.current = handleAvatarState;

    return () => {
      // Cleanup
      sceneInitRef.current?.dispose();

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }

      actionsRef.current = {};
      currentActionRef.current = null;

      if (windowEventHandlerRef.current) {
        try {
          window.removeEventListener('avatar:state', windowEventHandlerRef.current as EventListener);
        } catch { }
      }

      if (baseModel) {
        baseModel.traverse((child: THREE.Object3D) => {
          const mesh = child as THREE.Mesh;
          if ((mesh as any).isMesh) {
            mesh.geometry?.dispose();
            const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (mat) {
              Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat.dispose();
            }
          }
        });
      }
    };
  }, [canvasId, modelPath]);

  if (error) {
    return (
      <div className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative model-container ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
          <div className="text-center text-red-400">
            <p className="text-lg font-semibold">Error loading 3D model</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative model-container ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/3d_bg.avif')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.2)'
        }}
      />

      <canvas id={canvasId} className="relative z-10" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/30 border-t-orange-500 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-orange-500 text-xs font-bold">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>
            <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
              <div
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(loadingProgress)}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm font-body pt-2 tracking-wide">
              Loading model…
            </p>
          </div>
        </div>
      )}

      {!loading && !error && available.length > 0 && (
        <div className="absolute bottom-0 inset-x-0 p-3 bg-black/40 backdrop-blur-sm z-20">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {available.map((key) => (
              <button
                key={key}
                onClick={() => play(key)}
                className={[
                  "px-3 py-1 rounded-md text-xs font-semibold transition-colors",
                  currentName === key
                    ? "bg-orange-500 text-black"
                    : "bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700"
                ].join(' ')}
                aria-pressed={currentName === key}
                aria-label={`Play ${animationDisplayLabels[key] || key}`}
                title={animationDisplayLabels[key] || key}
              >
                {animationDisplayLabels[key] || key}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && available.length === 0 && (
        <div className="absolute bottom-0 inset-x-0 p-3 bg-black/40 backdrop-blur-sm z-20">
          <div className="text-center text-gray-400 text-sm">
            No animations found in model
          </div>
        </div>
      )}
    </div>
  )
}