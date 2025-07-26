    // components/ThreeScene.tsx
"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import SceneInit from '@/lib/SceneInit'

interface LoadedModel {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
    scenes: THREE.Group[];
    cameras: THREE.Camera[];
    asset: any;
}

interface ThreeSceneProps {
    canvasId?: string;
    modelPath?: string;
    className?: string;
}

export default function ThreeScene({
    canvasId = 'myThreeJsCanvas',
    modelPath = '/assets/shiba/scene.gltf',
    className = ""
}: ThreeSceneProps) {
    const sceneInitRef = useRef<SceneInit | null>(null)
    const [modelLoaded, setModelLoaded] = useState(false)

    useEffect(() => {
        // Initialize the scene
        const test = new SceneInit(canvasId);
        test.initialize();
        test.animate();

        // Store reference for cleanup
        sceneInitRef.current = test;

        let loadedModel: LoadedModel | null = null;
        const gltfLoader = new GLTFLoader();

        // Load the GLTF model
        gltfLoader.load(
            modelPath,
            (gltfScene: LoadedModel) => {
                loadedModel = gltfScene;

                // Apply transformations
                gltfScene.scene.rotation.y = Math.PI / 8;
                gltfScene.scene.position.set(0, 3, 0);
                gltfScene.scene.scale.set(12, 12, 12);

                // Add to scene
                if (test.scene) {
                    test.scene.add(gltfScene.scene);
                }

                setModelLoaded(true);
            },
            (progress) => {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading GLTF model:', error);
            }
        );

        // Cleanup function
        return () => {
            if (sceneInitRef.current) {
                sceneInitRef.current.dispose();
            }

            // Clean up loaded model
            if (loadedModel) {
                loadedModel.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => material.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                });
            }
        };
    }, [canvasId, modelPath])

    return (
        <div className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 model-container ${className}`}>
            <canvas id={canvasId} />

            {/* 3D Model Loading Indicator */}
            {!modelLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-white font-body tracking-wider">LOADING 3D MONKEY...</p>
                    </div>
                </div>
            )}

            {/* 3D Model Status */}
            {modelLoaded && (
                <div className="absolute top-4 left-4 bg-black/60 px-3 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-body tracking-wider">3D MONKEY READY</span>
                    </div>
                </div>
            )}
        </div>
    )
}