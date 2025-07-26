// monkeycompanion/page.tsx




"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGroqChat } from "@/components/groqChat"
import { Send } from "lucide-react"
import Link from "next/link"
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import SceneInit from '@/lib/SceneInit'
import { Pacifico, Rajdhani } from 'next/font/google'

// Define creative Google Fonts
const headingFont = Pacifico(
  {
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-heading'
  })

const bodyFont = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body'
})

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface LoadedModel {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  scenes: THREE.Group[];
  cameras: THREE.Camera[];
  asset: any;
}

export default function MonkeyCompanionPage() {
  const { messages, isTyping, sendMessage } = useGroqChat({
    systemPrompt: "You are Monkey, a friendly and playful AI art companion dog...",
    model: "llama3-8b-8192",
    temperature: 0.8,
    maxTokens: 1024,
    maxHistoryTokens: 4000,
  });

  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sceneInitRef = useRef<SceneInit | null>(null)
  const [modelLoaded, setModelLoaded] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // 3D Scene Setup
  useEffect(() => {
    // Initialize the scene
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();

    // Store reference for cleanup
    sceneInitRef.current = test;

    let loadedModel: LoadedModel | null = null;
    const gltfLoader = new GLTFLoader();

    // Load the GLTF model
    gltfLoader.load(
      '/assets/shiba/scene.gltf',
      (gltfScene: LoadedModel) => {
        loadedModel = gltfScene;

        // Apply transformations - exact same as your working code
        gltfScene.scene.rotation.y = Math.PI / 8;
        gltfScene.scene.position.set(0, 3, 0);
        gltfScene.scene.scale.set(12, 12, 12);

        // Add to scene - now we can safely access test.scene
        if (test.scene) {
          test.scene.add(gltfScene.scene);
        }

        setModelLoaded(true);
      },
      (progress) => {
        // Optional: Handle loading progress
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        // Handle loading errors
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
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    await sendMessage(inputMessage)
    setInputMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden ${headingFont.variable} ${bodyFont.variable}`}>
      {/* Header */}
      <header className="relative z-30 bg-gradient-to-b from-black/40 to-transparent p-4 md:p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-300 hover:bg-white/10 bg-transparent text-xs md:text-base px-3 py-1 font-sans"
            >
              ← Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent tracking-wider font-heading">
              MONKEY COMPANION
            </h1>
          </div>
          <div className="w-8 md:w-32" />
        </div>
      </header>

      {/* Main Content Container - Fixed height calculation */}
      <div className="flex h-[calc(100vh-68px)] md:h-[calc(100vh-84px)] w-screen overflow-hidden md:flex-row flex-col">
        {/* Left side - 3D Model Container */}
        <div className="flex-1 md:min-w-[50%] h-full md:h-full overflow-hidden relative bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 model-container">
          <canvas id="myThreeJsCanvas" />

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

        {/* Right side - Chatbot - Fixed to use h-full instead of h-screen */}
        <div className="flex-1 h-full bg-black flex items-center justify-center p-5">
          <div className="w-full h-full flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-b from-black/40 to-transparent p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm md:text-xl">🐕</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg md:text-xl tracking-wider font-heading">MONKEY AI</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isTyping ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <p className="text-gray-300 text-xs md:text-sm tracking-wider font-body">
                      {isTyping ? 'THINKING...' : 'ONLINE & READY'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesEndRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 relative"
            >
              <div className="space-y-4 md:space-y-6">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="flex justify-start">
                    <div
                      className="bg-gradient-to-br from-white/10 to-white/5 text-gray-100 shadow-lg max-w-[85%] px-4 py-3 md:px-6 md:py-4"
                      style={{ borderRadius: "24px" }}
                    >
                      <p className="text-xs md:text-sm leading-relaxed tracking-wide font-body">
                        WOOF! HI THERE! I'M MONKEY, YOUR AI ART COMPANION! 🎨 I LOVE HELPING WITH CREATIVE IDEAS AND NOW I'M IN 3D! PRETTY COOL, RIGHT?
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 md:px-6 md:py-4 ${message.isUser
                        ? "bg-gradient-to-br from-orange-500/80 to-yellow-500/80 text-white shadow-lg"
                        : "bg-gradient-to-br from-white/10 to-white/5 text-gray-100 shadow-lg"
                        }`}
                      style={{ borderRadius: "24px" }}
                    >
                      <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap tracking-wide font-body">{message.content}</p>
                      <div className="text-[10px] md:text-xs opacity-60 mt-1 md:mt-2 tracking-wider font-body">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className="bg-gradient-to-br from-white/10 to-white/5 px-4 py-3 md:px-6 md:py-4 max-w-[85%] shadow-lg"
                      style={{ borderRadius: "24px" }}
                    >
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-gradient-to-t from-black/40 to-transparent p-4">
              <div className="flex gap-3 md:gap-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="MESSAGE MONKEY..."
                  className="flex-1 bg-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/30 text-xs md:text-base tracking-wide uppercase font-body"
                  style={{ borderRadius: "20px" }}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white px-4 md:px-6 shadow-lg disabled:opacity-50 tracking-wider uppercase font-body"
                  style={{ borderRadius: "20px" }}
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}