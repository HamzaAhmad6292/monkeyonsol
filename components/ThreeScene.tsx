"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import SceneInit from '@/lib/SceneInit'

interface ThreeSceneProps {
  canvasId?: string;
  modelPath?: string;
  className?: string;
}

const WALKING_PATH = '/assets/skib/walking2.glb';

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

  const roleLabelsRef = useRef<{ walk?: string; idle?: string; think?: string; speak?: string }>({})
  const mixerFinishedHandlerRef = useRef<((e: any) => void) | null>(null)
  const windowEventHandlerRef = useRef<((e: Event) => void) | null>(null)

  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentName, setCurrentName] = useState<string | null>(null)
  const [available, setAvailable] = useState<string[]>([])

  const play = (name: string) => {
    const next = actionsRef.current[name]; if (!next) return;
    const prev = currentActionRef.current;
    if (prev === next) return;
    next.reset().fadeIn(0.2).play();
    if (prev) prev.fadeOut(0.2);
    currentActionRef.current = next;
    setCurrentName(name);
  };

  const playRole = (role: 'walk' | 'idle' | 'think' | 'speak') => {
    const label = roleLabelsRef.current[role];
    if (!label) return;
    play(label);
  };

  useEffect(() => {
    const scene = new SceneInit(canvasId);
    scene.initialize();
    scene.animate();
    sceneInitRef.current = scene;

    const gltfLoader = new GLTFLoader();
    let baseModel: THREE.Group | null = null;

    gltfLoader.load(
      modelPath,
      (gltf: any) => {
        const group = gltf.scene as THREE.Group;
        baseModel = group;
        modelRef.current = group;

        group.rotation.y = 0;
        // Move slightly down and scale up a bit
        group.position.set(0, -650, -350);
        group.scale.set(460, 460, 4.6);

        // Improve perceived realism: enable shadows and tune material reflection
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
                // Keep reflections subtle to avoid washing out skin
                std.envMapIntensity = Math.min(1.25, (std.envMapIntensity ?? 1.0) * 1.0);
                if (typeof std.roughness === 'number') std.roughness = Math.max(0.2, Math.min(0.95, std.roughness));
                if (typeof std.metalness === 'number') std.metalness = Math.min(0.6, (std.metalness ?? 0.0) + 0.05);
              }
            });
          }
        });

        scene.scene?.add(group);

        const mixer = new THREE.AnimationMixer(group);
        mixerRef.current = mixer;
        scene.setAnimationMixer(mixer);

        // Only keep animations 1,4,6,7 (1-based) => 0,3,5,6 (0-based)
        const clips = gltf.animations ?? [];
        const selectedIndices = [0, 3, 5, 6];
        const picks = selectedIndices
          .filter(i => clips[i])
          .map(i => ({ label: String(i + 1), clip: clips[i] }));

        const names: string[] = [];
        picks.forEach(({ label, clip }) => {
          const action = mixer.clipAction(clip);
          action.enabled = true;
          actionsRef.current[label] = action;
          names.push(label);
        });

        setAvailable(names);
        setLoading(false);
        setLoadingProgress(100);

        // Map roles in the order required: 1st=walk, 2nd=idle, 3rd=think, 4th=speak
        roleLabelsRef.current = {
          walk: names[0],
          idle: names[1],
          think: names[2],
          speak: names[3],
        };

        // Configure looping behavior
        const walk = roleLabelsRef.current.walk ? actionsRef.current[roleLabelsRef.current.walk] : null;
        const idle = roleLabelsRef.current.idle ? actionsRef.current[roleLabelsRef.current.idle] : null;
        const think = roleLabelsRef.current.think ? actionsRef.current[roleLabelsRef.current.think] : null;
        const speak = roleLabelsRef.current.speak ? actionsRef.current[roleLabelsRef.current.speak] : null;

        if (walk) {
          walk.setLoop(THREE.LoopOnce, 1);
          walk.clampWhenFinished = true;
        }
        if (idle) {
          idle.setLoop(THREE.LoopRepeat, Infinity);
        }
        if (think) {
          think.setLoop(THREE.LoopRepeat, Infinity);
        }
        if (speak) {
          speak.setLoop(THREE.LoopRepeat, Infinity);
        }

        // When any action finishes, if it was walk, go to idle
        const onFinished = (e: any) => {
          if (!e?.action) return;
          if (walk && e.action === walk && roleLabelsRef.current.idle) {
            playRole('idle');
          }
        };
        mixer.addEventListener('finished', onFinished);
        mixerFinishedHandlerRef.current = onFinished;

        // Autoplay walk once, then switch to idle via finished handler
        if (roleLabelsRef.current.walk) {
          playRole('walk');
        } else if (roleLabelsRef.current.idle) {
          playRole('idle');
        }

        // Listen for global avatar state changes
        const onAvatarState = (evt: Event) => {
          try {
            const detail = (evt as CustomEvent).detail as { state?: string } | undefined;
            const state = detail?.state;
            switch (state) {
              case 'walk':
                playRole('walk');
                break;
              case 'idle':
                playRole('idle');
                break;
              case 'thinking':
              case 'think':
                playRole('think');
                break;
              case 'speaking':
              case 'speak':
                playRole('speak');
                break;
            }
          } catch { }
        };
        window.addEventListener('avatar:state', onAvatarState as EventListener);
        windowEventHandlerRef.current = onAvatarState;
      },
      (progress: any) => {
        const total = (progress as ProgressEvent).total || 0;
        const loaded = (progress as ProgressEvent).loaded || 0;
        setLoadingProgress(total > 0 ? (loaded / total * 100) : 0);
      },
      (err: any) => {
        console.error('Error loading idle1a GLTF:', err);
        setLoading(false);
      }
    );

    return () => {
      // Cleanup three scene
      sceneInitRef.current?.dispose();
      if (mixerRef.current) {
        if (mixerFinishedHandlerRef.current) {
          try { mixerRef.current.removeEventListener('finished', mixerFinishedHandlerRef.current); } catch { }
        }
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      actionsRef.current = {};
      currentActionRef.current = null;

      // Remove window listener
      if (windowEventHandlerRef.current) {
        try { window.removeEventListener('avatar:state', windowEventHandlerRef.current as EventListener); } catch { }
      }

      if (baseModel) {
        baseModel.traverse((child: any) => {
          const mesh = child as THREE.Mesh;
          if ((mesh as any).isMesh) {
            mesh.geometry?.dispose();
            const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (mat) Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat.dispose();
          }
        });
      }
    };
  }, [canvasId, modelPath]);

  return (
    <div
      className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative model-container ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/3d_bg.avif')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.2)' // darkens without reducing model opacity

        }}
      />


      <canvas id={canvasId} className="relative z-10" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
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
            <p className="text-gray-400 text-sm font-body pt-2 tracking-wide">Loading model…</p>
          </div>
        </div>
      )}
      {/* 
      {!loading && available.length > 0 && (
        <div className="absolute bottom-0 inset-x-0 p-3 bg-black/40 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {available.map((name) => (
              <button
                key={name}
                onClick={() => play(name)}
                className={[
                  "px-3 py-1 rounded-md text-xs font-semibold transition-colors",
                  currentName === name
                    ? "bg-orange-500 text-black"
                    : "bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700"
                ].join(' ')}
                aria-pressed={currentName === name}
                aria-label={`Play animation ${name}`}
                title={`Animation ${name}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )} */}



    </div>
  )
}