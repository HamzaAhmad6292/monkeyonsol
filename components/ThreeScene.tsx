// components/ThreeScene.tsx
"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import SceneInit from '@/lib/SceneInit'

// Animation Configuration
interface AnimationConfig {
    name: string;
    fileName: string;
    displayName: string;
    icon: string;
    color: string;
}

const ANIMATION_CONFIG: AnimationConfig[] = [
    {
        name: 'casual',
        fileName: 'Animation_Casual_Walk_withSkin.fbx',
        displayName: 'Casual',
        icon: '🚶‍♂️',
        color: 'from-purple-500 to-purple-600'
    },
    {
        name: 'walking',
        fileName: 'Animation_Walking_withSkin.fbx',
        displayName: 'Walk',
        icon: '🚶',
        color: 'from-blue-500 to-blue-600'
    },
    {
        name: 'running',
        fileName: 'Animation_Running_withSkin.fbx',
        displayName: 'Run',
        icon: '🏃',
        color: 'from-green-500 to-green-600'
    },
    {
        name: 'dance',
        fileName: 'Animation_Boom_Dance_withSkin.fbx',
        displayName: 'Dance',
        icon: '💃',
        color: 'from-pink-500 to-pink-600'
    }
];

interface ThreeSceneProps {
    canvasId?: string;
    modelPath?: string;
    className?: string;
}

export default function ThreeScene({
    canvasId = 'myThreeJsCanvas',
    modelPath = '/assets/biped/Character_output.fbx',
    className = ""
}: ThreeSceneProps) {
    const sceneInitRef = useRef<SceneInit | null>(null)
    const mixerRef = useRef<THREE.AnimationMixer | null>(null)
    const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({})
    const [modelLoaded, setModelLoaded] = useState(false)
    const [currentAnimation, setCurrentAnimation] = useState<string>('walking')
    const [loadingAnimations, setLoadingAnimations] = useState<Set<string>>(new Set())

    useEffect(() => {
        // Initialize the scene
        const test = new SceneInit(canvasId);
        test.initialize();
        test.animate();

        // Store reference for cleanup
        sceneInitRef.current = test;

        let loadedModel: THREE.Group | null = null;
        const fbxLoader = new FBXLoader();

        // Load the character model first
        fbxLoader.load(
            modelPath,
            (fbxModel: THREE.Group) => {
                loadedModel = fbxModel;

                // Apply transformations
                fbxModel.rotation.y = Math.PI / 8;
                fbxModel.position.set(-15, -80, -250);
                // fbxModel.scale.set(12, 12, 12);

                // Add to scene
                if (test.scene) {
                    test.scene.add(fbxModel);
                }

                // Create animation mixer
                const mixer = new THREE.AnimationMixer(fbxModel);
                mixerRef.current = mixer;

                // Pass mixer to SceneInit for animation updates
                if (test.setAnimationMixer) {
                    test.setAnimationMixer(mixer);
                }

                // Load all animations
                loadAnimations(mixer, fbxLoader);

                setModelLoaded(true);
            },
            (progress) => {
                console.log('Model loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading FBX model:', error);
            }
        );

        // Cleanup function
        return () => {
            if (sceneInitRef.current) {
                sceneInitRef.current.dispose();
            }

            // Stop and dispose animation mixer
            if (mixerRef.current) {
                mixerRef.current.stopAllAction();
                mixerRef.current = null;
            }

            // Clear actions
            actionsRef.current = {};

            // Clean up loaded model
            if (loadedModel) {
                loadedModel.traverse((child) => {
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

    // Function to load all animations
    const loadAnimations = (mixer: THREE.AnimationMixer, fbxLoader: FBXLoader) => {
        ANIMATION_CONFIG.forEach((config) => {
            setLoadingAnimations(prev => new Set([...prev, config.name]));

            const animationPath = `/assets/biped/${config.fileName}`;
            fbxLoader.load(
                animationPath,
                (animationFBX: THREE.Group) => {
                    // Get the animation clip from the loaded animation file
                    if (animationFBX.animations && animationFBX.animations.length > 0) {
                        const animationClip = animationFBX.animations[0];
                        const action = mixer.clipAction(animationClip);

                        // Configure animation
                        action.setLoop(THREE.LoopRepeat, Infinity);
                        action.clampWhenFinished = true;

                        // Store the action
                        actionsRef.current[config.name] = action;

                        // Start the first animation (walking) by default
                        if (config.name === 'walking') {
                            action.play();
                        }
                    }

                    setLoadingAnimations(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(config.name);
                        return newSet;
                    });
                },
                (progress) => {
                    console.log(`${config.displayName} animation loading progress:`, (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.warn(`Could not load ${config.displayName} animation:`, error);
                    setLoadingAnimations(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(config.name);
                        return newSet;
                    });
                }
            );
        });
    };

    // Function to switch animations
    const switchAnimation = (animationName: string) => {
        const mixer = mixerRef.current;
        const actions = actionsRef.current;

        if (!mixer || !actions[animationName]) return;

        // Fade out current animation
        if (actions[currentAnimation]) {
            actions[currentAnimation].fadeOut(0.3);
        }

        // Fade in new animation
        actions[animationName].reset().fadeIn(0.3).play();

        setCurrentAnimation(animationName);
    };

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

            {/* Desktop Animation Controls */}
            {modelLoaded && (
                <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-3 border border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-body tracking-wider mr-2">ANIMATIONS:</span>
                            {ANIMATION_CONFIG.map((config) => (
                                <button
                                    key={config.name}
                                    onClick={() => switchAnimation(config.name)}
                                    disabled={loadingAnimations.has(config.name)}
                                    className={`
                                        relative flex items-center gap-2 px-3 py-2 rounded-full text-xs font-body tracking-wider
                                        transition-all duration-300 border border-transparent
                                        ${currentAnimation === config.name
                                            ? `bg-gradient-to-r ${config.color} text-white shadow-lg border-white/20 scale-105`
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-105'
                                        }
                                        ${loadingAnimations.has(config.name) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {loadingAnimations.has(config.name) ? (
                                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span className="text-sm">{config.icon}</span>
                                    )}
                                    <span className="hidden lg:inline">{config.displayName}</span>

                                    {/* Active indicator */}
                                    {currentAnimation === config.name && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}