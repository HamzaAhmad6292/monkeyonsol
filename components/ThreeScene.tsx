"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import SceneInit from "@/lib/SceneInit";

interface ThreeSceneProps {
  canvasId?: string;
  modelPath?: string;
  className?: string;
}

const WALKING_PATH = "/assets/final_fat.glb";
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
  canvasId = "myThreeJsCanvas",
  modelPath = WALKING_PATH,
  className = "",
}: ThreeSceneProps) {
  const sceneInitRef = useRef<SceneInit | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const windowEventHandlerRef = useRef<((e: Event) => void) | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [available, setAvailable] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const outlineMeshesRef = useRef<THREE.Object3D[]>([]);
  const toonMaterialsCacheRef = useRef<Map<string, THREE.MeshToonMaterial>>(new Map());
  const gradientTextureRef = useRef<THREE.Texture | null>(null);
  const [screenOutlineEnabled, setScreenOutlineEnabled] = useState(false);
  const [meshOutlineEnabled, setMeshOutlineEnabled] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [fps, setFps] = useState(0);

  // Names of meshes that should keep PBR materials (skip toon replace)
  const PBR_KEEP_NAMES = [
    /brush/i,
    /metal/i,
    /belt/i,
  ];

  // Performance optimization: disable outlines on mobile for better performance
  const shouldDisableOutlines = () => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const touch = (navigator as any).maxTouchPoints || 0;
    return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua) || touch > 1;
  };

  const isMobileLike = () => {
    if (typeof navigator === "undefined") return false;
    // Crude but effective heuristic
    const ua = navigator.userAgent || "";
    const touch = (navigator as any).maxTouchPoints || 0;
    return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua) || touch > 1;
  };

  const createBandedGradientTexture = (levels: number = 9): THREE.DataTexture => {
    const width = Math.max(2, levels);
    const data = new Uint8Array(width * 3);
    for (let i = 0; i < width; i++) {
      // Create very soft contrast for lighter skin tones
      const v = Math.floor((i / (width - 1)) * 255);
      // Minimal contrast for lighter, natural appearance
      const enhancedV = v < 128 ? Math.floor(v * 0.92) : Math.floor(v * 1.08);
      const clampedV = Math.max(0, Math.min(255, enhancedV));
      data[i * 3 + 0] = clampedV;
      data[i * 3 + 1] = clampedV;
      data[i * 3 + 2] = clampedV;
    }
    const tex = new THREE.DataTexture(data, width, 1, THREE.RGBFormat);
    tex.needsUpdate = true;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    return tex;
  };

  const shouldKeepPBR = (objectName: string | undefined) => {
    if (!objectName) return false;
    return PBR_KEEP_NAMES.some((r) => r.test(objectName));
  };

  const getToonMaterialFrom = (
    src: THREE.MeshStandardMaterial
  ): THREE.MeshToonMaterial => {
    const cacheKey = `${src.map?.uuid || "nomap"}|${src.normalMap?.uuid || "nonorm"}|${src.color.getHexString()}|${(src as any).skinning ? "sk" : ""}|${(src as any).morphTargets ? "mt" : ""}`;
    const cached = toonMaterialsCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const grad = gradientTextureRef.current || createBandedGradientTexture(7);
    const toon = new THREE.MeshToonMaterial();

    // Light, natural skin tone properties
    toon.color = src.color.clone();
    toon.color.multiplyScalar(0.95); // Reduced brightness for lighter skin tones

    if (src.map) toon.map = src.map;
    if (src.normalMap) toon.normalMap = src.normalMap;

    // Enhanced toon properties for crisp edges
    toon.gradientMap = grad;
    toon.transparent = src.transparent;
    toon.opacity = src.opacity;
    toon.alphaTest = src.alphaTest;

    // Minimal lighting properties for natural skin tones
    toon.emissive = src.emissive ? src.emissive.clone().multiplyScalar(0.05) : new THREE.Color(0x000000);
    toon.emissiveIntensity = 0.04; // Minimal for natural skin appearance

    // Enhanced edge properties
    toon.wireframe = false; // Ensure wireframe is off

    // Support for skinning and morph targets
    (toon as any).skinning = (src as any).skinning;
    (toon as any).morphTargets = (src as any).morphTargets;
    (toon as any).morphNormals = (src as any).morphNormals;

    toonMaterialsCacheRef.current.set(cacheKey, toon);
    return toon;
  };

  const replaceWithToonMaterials = (root: THREE.Object3D) => {
    root.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (!(mesh as any).isMesh) return;

      // Skip PBR materials that should be kept
      if (shouldKeepPBR(mesh.name)) return;

      const materialOrArray =
        mesh.material as THREE.Material | THREE.Material[];
      const materials = Array.isArray(materialOrArray)
        ? materialOrArray
        : materialOrArray
          ? [materialOrArray]
          : [];

      materials.forEach((mat) => {
        const std = mat as unknown as THREE.MeshStandardMaterial;
        if (std && (std as any).isMeshStandardMaterial) {
          // Enhanced anime-style material adjustments for non-performance mode
          std.envMapIntensity = Math.min(
            1.8, // Increased from 1.5 for better anime visibility
            (std.envMapIntensity ?? 1.0) * 1.4
          );

          // Enhanced color saturation for anime style
          if (std.color) {
            const hsl = { h: 0, s: 0, l: 0 };
            std.color.getHSL(hsl);
            hsl.s = Math.min(1.0, hsl.s * 1.2); // Increase saturation more
            hsl.l = Math.min(0.95, hsl.l * 1.1); // Increase lightness more
            std.color.setHSL(hsl.h, hsl.s, hsl.l);
          }

          if (typeof std.roughness === "number")
            std.roughness = Math.max(
              0.1, // Reduced from 0.15 for shinier anime look
              Math.min(0.8, std.roughness * 0.8)
            );
          if (typeof std.metalness === "number")
            std.metalness = Math.min(
              0.8, // Increased from 0.7 for better anime shine
              (std.metalness ?? 0.0) + 0.2
            );
        }
      });
    });
  };

  // Stable outline settings to prevent flickering during animation
  const outlineWidth = 0.012; // Reduced for stability during movement
  const outlineColor = new THREE.Color(0x000000); // Pure black for anime style
  const secondaryOutlineColor = new THREE.Color(0x1a1a1a); // Darker gray for secondary outline
  const tertiaryOutlineColor = new THREE.Color(0x333333); // Third outline layer for enhanced corners

  const createInvertedHullMaterial = (
    src: THREE.MeshStandardMaterial,
    outlineType: 'primary' | 'secondary' | 'tertiary' = 'primary'
  ): THREE.MeshToonMaterial => {
    const mat = new THREE.MeshToonMaterial();

    // Bright outline material properties for better visibility
    switch (outlineType) {
      case 'primary':
        mat.color = outlineColor;
        mat.opacity = 0.75; // Reduced opacity for better light penetration
        break;
      case 'secondary':
        mat.color = secondaryOutlineColor;
        mat.opacity = 0.5; // Reduced opacity for better light penetration
        break;
      case 'tertiary':
        mat.color = tertiaryOutlineColor;
        mat.opacity = 0.3; // Reduced opacity for better light penetration
        break;
    }

    mat.transparent = true;
    mat.side = THREE.BackSide; // Render on back side for outline effect
    mat.depthWrite = false; // Prevent z-fighting
    mat.blending = THREE.NormalBlending;

    // Stable vertex shader to prevent flickering during animation
    let width: number;
    switch (outlineType) {
      case 'primary':
        width = outlineWidth;
        break;
      case 'secondary':
        width = outlineWidth * 1.4; // Reduced multiplier for stability
        break;
      case 'tertiary':
        width = outlineWidth * 1.8; // Reduced multiplier for stability
        break;
    }

    mat.onBeforeCompile = (shader: any) => {
      shader.vertexShader = shader.vertexShader.replace(
        `#include <project_vertex>`,
        `#include <project_vertex>\nvec3 norm = normalize(normalMatrix * normal);\ntransformed += norm * ${width.toFixed(5)};`
      );
    };

    return mat;
  };

  const addInvertedHullOutlines = (root: THREE.Object3D) => {
    outlineMeshesRef.current = [];
    root.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (!(mesh as any).isMesh) return;

      // Skip if this is already an outline mesh to prevent recursion
      if (mesh.name && mesh.name.includes('__outline')) return;

      // Skip very small meshes that can cause flickering
      if (mesh.geometry.boundingBox) {
        const size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
        if (size.length() < 10) return; // Skip tiny meshes
      }

      // Create primary outline
      const outlineMat = createInvertedHullMaterial(
        mesh.material as THREE.MeshStandardMaterial,
        'primary'
      );

      let outline: THREE.Mesh;
      if ((mesh as any).isSkinnedMesh) {
        outline = new THREE.SkinnedMesh(mesh.geometry, outlineMat);
        (outline as THREE.SkinnedMesh).bind((mesh as any).skeleton, (mesh as any).bindMatrix);
      } else {
        outline = new THREE.Mesh(mesh.geometry, outlineMat);
      }

      outline.name = `${mesh.name || 'mesh'}__outline`;
      outline.renderOrder = (mesh.renderOrder || 0) - 1;
      outline.visible = meshOutlineEnabled;

      // Copy morph target data if available
      if ((mesh as any).morphTargetInfluences) {
        (outline as any).morphTargetInfluences = mesh.morphTargetInfluences;
        (outline as any).morphTargetDictionary = mesh.morphTargetDictionary;
      }

      // Add outline to the same parent as the original mesh, not as a child of the mesh
      if (mesh.parent) {
        mesh.parent.add(outline);
        // Position the outline slightly behind the original mesh
        outline.position.copy(mesh.position);
        outline.rotation.copy(mesh.rotation);
        outline.scale.copy(mesh.scale);
      }

      outlineMeshesRef.current.push(outline);

      // Create secondary outline for better definition
      const secondaryOutlineMat = createInvertedHullMaterial(
        mesh.material as THREE.MeshStandardMaterial,
        'secondary'
      );

      let secondaryOutline: THREE.Mesh;
      if ((mesh as any).isSkinnedMesh) {
        secondaryOutline = new THREE.SkinnedMesh(mesh.geometry, secondaryOutlineMat);
        (secondaryOutline as THREE.SkinnedMesh).bind((mesh as any).skeleton, (mesh as any).bindMatrix);
      } else {
        secondaryOutline = new THREE.Mesh(mesh.geometry, secondaryOutlineMat);
      }

      secondaryOutline.name = `${mesh.name || 'mesh'}__outline_secondary`;
      secondaryOutline.renderOrder = (mesh.renderOrder || 0) - 2; // Behind primary outline
      secondaryOutline.visible = meshOutlineEnabled;

      // Copy morph target data if available
      if ((mesh as any).morphTargetInfluences) {
        (secondaryOutline as any).morphTargetInfluences = (mesh as any).morphTargetInfluences;
        (secondaryOutline as any).morphTargetDictionary = (mesh as any).morphTargetDictionary;
      }

      // Add secondary outline
      if (mesh.parent) {
        mesh.parent.add(secondaryOutline);
        secondaryOutline.position.copy(mesh.position);
        secondaryOutline.rotation.copy(mesh.rotation);
        secondaryOutline.scale.copy(mesh.scale);
      }

      outlineMeshesRef.current.push(secondaryOutline);

      // Create tertiary outline for enhanced corner definition
      const tertiaryOutlineMat = createInvertedHullMaterial(
        mesh.material as THREE.MeshStandardMaterial,
        'tertiary'
      );

      let tertiaryOutline: THREE.Mesh;
      if ((mesh as any).isSkinnedMesh) {
        tertiaryOutline = new THREE.SkinnedMesh(mesh.geometry, tertiaryOutlineMat);
        (tertiaryOutline as THREE.SkinnedMesh).bind((mesh as any).skeleton, (mesh as any).bindMatrix);
      } else {
        tertiaryOutline = new THREE.Mesh(mesh.geometry, tertiaryOutlineMat);
      }

      tertiaryOutline.name = `${mesh.name || 'mesh'}__outline_tertiary`;
      tertiaryOutline.renderOrder = (mesh.renderOrder || 0) - 3; // Behind secondary outline
      tertiaryOutline.visible = meshOutlineEnabled;

      // Copy morph target data if available
      if ((mesh as any).morphTargetInfluences) {
        (tertiaryOutline as any).morphTargetInfluences = (mesh as any).morphTargetInfluences;
        (tertiaryOutline as any).morphTargetDictionary = (mesh as any).morphTargetDictionary;
      }

      // Add tertiary outline
      if (mesh.parent) {
        mesh.parent.add(tertiaryOutline);
        tertiaryOutline.position.copy(mesh.position);
        tertiaryOutline.rotation.copy(mesh.rotation);
        tertiaryOutline.scale.copy(mesh.scale);
      }

      outlineMeshesRef.current.push(tertiaryOutline);
    });
  };

  const toggleMeshOutlines = (enabled: boolean) => {
    outlineMeshesRef.current.forEach((o) => (o.visible = enabled));
    setMeshOutlineEnabled(enabled);
  };

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
      "[ThreeScene] Animation triggered:",
      `name="${name}"`,
      `display="${animationButtonMap.find((anim) => anim.key === name)?.label || name}"`
    );
  };

  // Helper function to find animation by state
  const findAnimationByState = (
    state: "idle1" | "idle2" | "talking"
  ): string | null => {
    const availableNames = Object.keys(actionsRef.current);

    if (state === "talking") {
      return (
        availableNames.find(
          (name) =>
            name.toLowerCase().includes("talk") ||
            name.toLowerCase().includes("speak") ||
            name === "Talking"
        ) || null
      );
    } else if (state === "idle2") {
      return (
        availableNames.find(
          (name) =>
            (name.toLowerCase().includes("idle") &&
              (name.includes("2") || name.includes("_2"))) ||
            name === "Idle_2"
        ) || null
      );
    } else if (state === "idle1") {
      let idle1Anim =
        availableNames.find(
          (name) =>
            (name.toLowerCase().includes("idle") &&
              (name.includes("1") || name.includes("_1"))) ||
            name === "Idle_1"
        ) || null;

      if (!idle1Anim) {
        const idle2Anim = availableNames.find(
          (name) =>
            name.toLowerCase().includes("idle") &&
            (name.includes("2") || name.includes("_2"))
        );
        idle1Anim =
          availableNames.find(
            (name) => name.toLowerCase().includes("idle") && name !== idle2Anim
          ) || null;
      }

      if (!idle1Anim) {
        const talkingAnim = availableNames.find(
          (name) =>
            name.toLowerCase().includes("talk") ||
            name.toLowerCase().includes("speak")
        );
        const idle2Anim = availableNames.find(
          (name) =>
            name.toLowerCase().includes("idle") &&
            (name.includes("2") || name.includes("_2"))
        );
        idle1Anim =
          availableNames.find(
            (name) => name !== idle2Anim && name !== talkingAnim
          ) || null;
      }
      return idle1Anim || null;
    }
    return null;
  };

  // Set avatar state function
  const setAvatarState = (state: "idle1" | "idle2" | "talking") => {
    const anim = findAnimationByState(state);
    if (anim && actionsRef.current[anim]) {
      const action = actionsRef.current[anim];

      if (state === "idle2") {
        action.setLoop(THREE.LoopRepeat, Infinity);
      } else if (state === "idle1") {
        action.setLoop(THREE.LoopRepeat, Infinity);
      } else if (state === "talking") {
        action.setLoop(THREE.LoopRepeat, Infinity);
      }

      play(anim);
    } else {
      console.warn(
        "[ThreeScene] Animation for state",
        state,
        "not found! Available:",
        Object.keys(actionsRef.current)
      );
    }
  };

  useEffect(() => {
    try {
      const scene = new SceneInit(canvasId);
      scene.initialize();
      scene.animate();
      sceneInitRef.current = scene;
    } catch (err) {
      console.error("Scene initialization failed:", err);
      setError("Failed to initialize 3D scene");
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

          // Optimize scale for performance mode
          if (performanceMode) {
            group.scale.set(200, 200, 3.7); // Reduced scale for better performance
          } else {
            // Non-performance mode: restore original height
            group.scale.set(250, 250, 4.6); // Y scale restored to original height
          }

          group.visible = true;

          // Materials adjustments (kept) + replace with toon where applicable
          group.traverse((child: THREE.Object3D) => {
            const maybeMesh = child as THREE.Mesh;
            if ((maybeMesh as any).isMesh) {
              maybeMesh.castShadow = true;
              maybeMesh.receiveShadow = true;

              const materialOrArray =
                maybeMesh.material as THREE.Material | THREE.Material[];
              const materials = Array.isArray(materialOrArray)
                ? materialOrArray
                : materialOrArray
                  ? [materialOrArray]
                  : [];

              materials.forEach((mat) => {
                const std = mat as unknown as THREE.MeshStandardMaterial;
                if (std && (std as any).isMeshStandardMaterial) {
                  // Light, natural skin tone material properties
                  std.envMapIntensity = Math.min(
                    1.2, // Reduced for lighter skin appearance
                    (std.envMapIntensity ?? 1.0) * 0.95
                  );

                  // Enhanced color properties for lighter skin tones
                  if (std.color) {
                    const hsl = { h: 0, s: 0, l: 0 };
                    std.color.getHSL(hsl);
                    hsl.s = Math.min(1.0, hsl.s * 0.9); // Reduced saturation for lighter skin
                    hsl.l = Math.min(0.95, hsl.l * 1.15); // Increased lightness for whiter skin
                    std.color.setHSL(hsl.h, hsl.s, hsl.l);
                  }

                  if (typeof std.roughness === "number")
                    std.roughness = Math.max(
                      0.12, // Reduced from 0.15 for shinier anime look
                      Math.min(0.85, std.roughness * 0.85)
                    );
                  if (typeof std.metalness === "number")
                    std.metalness = Math.min(
                      0.75, // Increased from 0.7 for better anime shine
                      (std.metalness ?? 0.0) + 0.15
                    );
                }
              });
            }
          });

          // Apply toon materials (non-destructive visually, preserving maps)
          replaceWithToonMaterials(group);

          // Add stable outlines - prefer post-processing for better quality during animation
          if (!shouldDisableOutlines() && !performanceMode) {
            // Use post-processing outline for better stability during animation
            sceneInitRef.current?.enableScreenSpaceOutline(true, [group]);
            setScreenOutlineEnabled(true);

            // Also add mesh outlines as backup for better coverage
            addInvertedHullOutlines(group);
          }

          // SceneInit already has comprehensive lighting setup
          // No need to add additional lights here

          if (!sceneInitRef.current?.scene)
            throw new Error("Scene not available");
          sceneInitRef.current.scene.add(group);

          // Mixer
          const mixer = new THREE.AnimationMixer(group);
          mixerRef.current = mixer;
          sceneInitRef.current?.setAnimationMixer(mixer);

          const clips: THREE.AnimationClip[] = gltf.animations ?? [];
          const names: string[] = [];

          const used = new Set<string>();
          const uniqueName = (base: string) => {
            let name = base || "Animation";
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

            console.log(
              `[ThreeScene] Loaded animation: ${name} (from clip: ${clip.name})`
            );
          });

          setAvailable(names);
          setLoading(false);
          setLoadingProgress(100);

          console.log("[ThreeScene] Available animation names:", names);

          if (names.length > 0) {
            setTimeout(() => {
              const defaultAnim = findAnimationByState("idle2") || names[0];
              if (defaultAnim) {
                const action = actionsRef.current[defaultAnim];
                if (action) {
                  action.setLoop(THREE.LoopRepeat, Infinity);
                  play(defaultAnim);
                }
              }
            }, 300);
          }

          // Set up event listener after model is loaded
          window.addEventListener("avatar:state", handleAvatarState);
          window.addEventListener("avatar:outline", handleOutlineToggle as EventListener);
          window.addEventListener("avatar:postprocessing", handlePostprocessingToggle as EventListener);
          window.addEventListener("avatar:performance", handlePerformanceToggle as EventListener);
          windowEventHandlerRef.current = handleAvatarState;

          // Default outline configuration: optimized for stability during animation
          const mobile = isMobileLike();
          const outlinesEnabled = !shouldDisableOutlines();
          setMeshOutlineEnabled(outlinesEnabled);
          toggleMeshOutlines(outlinesEnabled);

          // Enable screen space outline by default for better stability
          setScreenOutlineEnabled(true);
          sceneInitRef.current?.enableScreenSpaceOutline(true, [group]);

          if (outlinesEnabled) {
            sceneInitRef.current?.setOutlineSelectedObjects([group]);
          }
          // Expose minimal API on window for programmatic toggles
          (window as any).__threeAvatarControls = {
            enableScreenOutline: (enabled: boolean) => {
              setScreenOutlineEnabled(enabled);
              sceneInitRef.current?.enableScreenSpaceOutline(enabled, [group]);
            },
            enableMeshOutline: (enabled: boolean) => {
              toggleMeshOutlines(enabled);
            },
          };

          // Start FPS monitoring
          let frameCount = 0;
          let lastTime = performance.now();
          const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            if (currentTime - lastTime >= 1000) {
              setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
              frameCount = 0;
              lastTime = currentTime;
            }
            requestAnimationFrame(updateFPS);
          };
          updateFPS();
        } catch (err) {
          console.error("Error setting up model:", err);
          setError("Failed to setup 3D model");
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
        console.error("Error loading GLTF:", err);
        setError("Failed to load 3D model");
        setLoading(false);
      }
    );

    const handleAvatarState = (e: Event) => {
      // @ts-ignore
      const state = e.detail?.state;
      if (!state) return;
      setAvatarState(state);
    };

    const handleOutlineToggle = (e: CustomEvent) => {
      const detail = (e as any).detail || {};
      const mode = detail.mode as 'screen' | 'mesh' | undefined;
      const enabled = !!detail.enabled;
      if (mode === 'screen') {
        setScreenOutlineEnabled(enabled);
        sceneInitRef.current?.enableScreenSpaceOutline(enabled, modelRef.current ? [modelRef.current] : undefined);
      } else if (mode === 'mesh') {
        toggleMeshOutlines(enabled);
      } else {
        // Default: enable both for best quality
        setScreenOutlineEnabled(enabled);
        toggleMeshOutlines(enabled);
        if (enabled && modelRef.current) {
          sceneInitRef.current?.enableScreenSpaceOutline(true, [modelRef.current]);
        }
      }
    };

    const handlePostprocessingToggle = (e: CustomEvent) => {
      const detail = (e as any).detail || {};
      const enabled = !!detail.enabled;
      setScreenOutlineEnabled(enabled);
      sceneInitRef.current?.enableScreenSpaceOutline(enabled, modelRef.current ? [modelRef.current] : undefined);
    };

    const handlePerformanceToggle = (e: CustomEvent) => {
      const detail = (e as any).detail || {};
      const enabled = detail.enabled;
      setPerformanceMode(enabled);

      // Update model scale for performance
      if (modelRef.current) {
        if (enabled) {
          modelRef.current.scale.set(200, 200, 3.7); // Reduced scale for better performance
        } else {
          // Non-performance mode: restore original height
          modelRef.current.scale.set(250, 250, 4.6); // Y scale restored to original height
        }
      }

      // Toggle outlines based on performance mode
      if (enabled) {
        // Performance mode: disable outlines
        setMeshOutlineEnabled(false);
        toggleMeshOutlines(false);
      } else {
        // Normal mode: restore outlines if not on mobile
        const outlinesEnabled = !shouldDisableOutlines();
        setMeshOutlineEnabled(outlinesEnabled);
        toggleMeshOutlines(outlinesEnabled);
      }
    };

    return () => {
      sceneInitRef.current?.dispose();

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }

      actionsRef.current = {};
      currentActionRef.current = null;

      if (windowEventHandlerRef.current) {
        try {
          window.removeEventListener(
            "avatar:state",
            windowEventHandlerRef.current as EventListener
          );
        } catch { }
      }
      try {
        window.removeEventListener("avatar:outline", handleOutlineToggle as EventListener);
        window.removeEventListener("avatar:postprocessing", handlePostprocessingToggle as EventListener);
        window.removeEventListener("avatar:performance", handlePerformanceToggle as EventListener);
      } catch { }

      // Dispose gradient texture
      if (gradientTextureRef.current) {
        gradientTextureRef.current.dispose();
        gradientTextureRef.current = null;
      }

      // Dispose outline meshes and their materials
      outlineMeshesRef.current.forEach((outline) => {
        const outlineMesh = outline as THREE.Mesh;
        if (outlineMesh.geometry) outlineMesh.geometry.dispose();
        const mat = outlineMesh.material as THREE.Material | THREE.Material[];
        if (mat) {
          Array.isArray(mat)
            ? mat.forEach((m) => m.dispose())
            : mat.dispose();
        }
        if (outline.parent) outline.parent.remove(outline);
      });
      outlineMeshesRef.current = [];

      // Dispose toon materials cache
      toonMaterialsCacheRef.current.forEach((mat) => mat.dispose());
      toonMaterialsCacheRef.current.clear();

      if (baseModel) {
        baseModel.traverse((child: THREE.Object3D) => {
          const mesh = child as THREE.Mesh;
          if ((mesh as any).isMesh) {
            mesh.geometry?.dispose();
            const mat = mesh.material as THREE.Material | THREE.Material[];
            if (mat) {
              Array.isArray(mat)
                ? mat.forEach((m) => m.dispose())
                : mat.dispose();
            }
          }
        });
      }
    };
  }, [canvasId, modelPath]);

  if (error) {
    return (
      <div
        className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative model-container ${className}`}
      >
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
    <div
      className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative model-container ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/3d_bg.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.2)",
        }}
      />
      <canvas id={canvasId} className="relative z-10" />

      {/* FPS Display */}
      {!loading && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded z-20">
          {fps} FPS
        </div>
      )}

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
    </div>
  );
}