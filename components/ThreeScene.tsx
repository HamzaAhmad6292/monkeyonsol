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

  useEffect(() => {
    const scene = new SceneInit(canvasId);
    scene.initialize();
    scene.animate();
    sceneInitRef.current = scene;

    const gltfLoader = new GLTFLoader();
    let baseModel: THREE.Group | null = null;

    gltfLoader.load(
      modelPath,
      (gltf) => {
        const group = gltf.scene as THREE.Group;
        baseModel = group;
        modelRef.current = group;

        group.rotation.y = 0;
        group.position.set(0, -400, -350);
        group.scale.set(400, 400, 4);

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
          actionsRef.current[label] = action;
          names.push(label);
        });

        setAvailable(names);
        setLoading(false);
        setLoadingProgress(100);

        // Autoplay the first selected animation
        if (names.length) play(names[0]);
      },
      (progress) => {
        const total = (progress as ProgressEvent).total || 0;
        const loaded = (progress as ProgressEvent).loaded || 0;
        setLoadingProgress(total > 0 ? (loaded / total * 100) : 0);
      },
      (err) => {
        console.error('Error loading idle1a GLTF:', err);
        setLoading(false);
      }
    );

    return () => {
      sceneInitRef.current?.dispose();
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      actionsRef.current = {};
      currentActionRef.current = null;

      if (baseModel) {
        baseModel.traverse((child) => {
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
    <div className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative bg-black model-container ${className}`}>
      <canvas id={canvasId} />

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
      )}
    </div>
  )
}