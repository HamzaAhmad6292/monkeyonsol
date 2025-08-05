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
    const modelRef = useRef<THREE.Group | null>(null)
    const walkUpAnimationRef = useRef<{ isActive: boolean; startTime: number }>({ isActive: false, startTime: 0 })

    const [modelLoaded, setModelLoaded] = useState(false)
    const [modelReady, setModelReady] = useState(false) // New state for when everything is ready
    const [currentAnimation, setCurrentAnimation] = useState<string>('walking')
    const [loadingAnimations, setLoadingAnimations] = useState<Set<string>>(new Set())
    const [walkUpComplete, setWalkUpComplete] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)

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
                modelRef.current = fbxModel;

                // Initial positioning - facing directly towards user
                fbxModel.rotation.y = 0; // No angle - facing straight ahead

                // Start position (far away)
                fbxModel.position.set(0, -400, -800); // Much further back and centered
                fbxModel.scale.set(1, 1, 1); // Much smaller initially

                // Initially hide the model until everything is ready
                fbxModel.visible = false;

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
                const progressPercentage = (progress.loaded / progress.total * 100);
                setLoadingProgress(progressPercentage);
                console.log('Model loading progress:', progressPercentage + '%');
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

    // Walk-up animation function
    const startWalkUpAnimation = () => {
        if (!modelRef.current) return; // Ensure model is loaded

        walkUpAnimationRef.current = { isActive: true, startTime: Date.now() };

        const animateWalkUp = () => {
            if (!walkUpAnimationRef.current.isActive || !modelRef.current) return;

            const elapsed = (Date.now() - walkUpAnimationRef.current.startTime) / 1000; // Convert to seconds
            const duration = 4; // 8 seconds for slower animation

            if (elapsed >= duration) {
                // Animation complete - set final position
                modelRef.current.position.set(0, -400, -350);
                modelRef.current.scale.set(4, 4, 4);
                walkUpAnimationRef.current.isActive = false;
                setWalkUpComplete(true);
                return;
            }

            // Calculate progress (0 to 1)
            const progress = elapsed / duration;

            // Easing function for smooth animation (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 2.5); // Slightly different easing for more natural feel

            // Interpolate position (Z-axis: from -800 to -350)
            const startZ = -800;
            const endZ = -350;
            const currentZ = startZ + (endZ - startZ) * easeOut;

            // Interpolate scale (from 1 to 4)
            const startScale = 1;
            const endScale = 4;
            const currentScale = startScale + (endScale - startScale) * easeOut;

            // Apply transformations
            modelRef.current.position.set(0, -400, currentZ);
            modelRef.current.scale.set(currentScale, currentScale, currentScale);

            // Continue animation
            requestAnimationFrame(animateWalkUp);
        };

        // Start the animation
        requestAnimationFrame(animateWalkUp);
    };

    // Function to load all animations
    const loadAnimations = (mixer: THREE.AnimationMixer, fbxLoader: FBXLoader) => {
        let loadedAnimationsCount = 0;
        const totalAnimations = ANIMATION_CONFIG.length;

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

                        // Start the walking animation by default (for the walk-up effect)
                        if (config.name === 'walking') {
                            action.play();
                        }
                    }

                    setLoadingAnimations(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(config.name);
                        return newSet;
                    });

                    loadedAnimationsCount++;

                    // Check if all animations are loaded
                    if (loadedAnimationsCount === totalAnimations) {
                        // Everything is ready - show model and start walk-up animation
                        setTimeout(() => {
                            if (modelRef.current) {
                                modelRef.current.visible = true; // Show the model
                                setModelReady(true);
                                startWalkUpAnimation();
                            }
                        }, 500); // Small delay to ensure everything is properly initialized
                    }
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

                    loadedAnimationsCount++;

                    // Check if all animations are processed (loaded or failed)
                    if (loadedAnimationsCount === totalAnimations) {
                        setTimeout(() => {
                            if (modelRef.current) {
                                modelRef.current.visible = true;
                                setModelReady(true);
                                startWalkUpAnimation();
                            }
                        }, 500);
                    }
                }
            );
        });
    };

    // Function to switch animations (only available after walk-up is complete)
    const switchAnimation = (animationName: string) => {
        if (!walkUpComplete) return; // Prevent switching during walk-up

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
        <div className={`flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative bg-black model-container ${className}`}>
            <canvas id={canvasId} />

            {/* Enhanced Loading Indicator */}
            {!modelReady && (
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

                        <div className="space-y-2">
                            {/* <p className="text-white font-body tracking-wider text-lg">
                                {!modelLoaded ? 'Monkey just woke up' : 'PREPARING Model...'}
                            </p> */}
                            <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: modelLoaded ? '100%' : `${loadingProgress}%`
                                    }}
                                ></div>
                            </div>
                            <p className="text-gray-400 text-sm font-body pt-2 tracking-wide">
                                {!modelLoaded
                                    ? `Monkey just woke up`
                                    : 'Monkey is almost ready'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Walk-up Animation Status */}
            {modelReady && !walkUpComplete && (
                <div className="absolute top-4 left-4 bg-black/60 px-3 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-body tracking-wider">MONKEY APPROACHING...</span>
                    </div>
                </div>
            )}

            {/* 3D Model Ready Status */}
            {modelReady && walkUpComplete && (
                <div className="absolute top-4 left-4 bg-black/60 px-3 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-body tracking-wider">MONKEY READY</span>
                    </div>
                </div>
            )}

            {/* Desktop Animation Controls - Only show after walk-up is complete */}
            {/* {modelReady && walkUpComplete && (
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

                                    {currentAnimation === config.name && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )} */}


        </div>
    )
}