
// monkeycompanion/page.tsx (Main Page Component)
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pacifico, Rajdhani } from 'next/font/google'
import ThreeScene from '@/components/ThreeScene'
import MonkeyChatBot from '@/components/MonkeyChatBot'

// Define creative Google Fonts
const headingFont = Pacifico({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-heading'
})

const bodyFont = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body'
})

export default function MonkeyCompanionPage() {
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

      {/* Main Content Container */}
      <div className="flex h-[calc(100vh-68px)] md:h-[calc(100vh-84px)] w-screen overflow-hidden md:flex-row flex-col">
        {/* Left side - 3D Scene */}
        <ThreeScene
          canvasId="myThreeJsCanvas"
          modelPath="/assets/shiba/scene.gltf"
        />

        {/* Right side - Chatbot */}
        <MonkeyChatBot
          systemPrompt="You are Monkey, a friendly and playful AI art companion dog..."
          model="llama3-8b-8192"
          temperature={0.8}
          maxTokens={1024}
          maxHistoryTokens={4000}
        />
      </div>
    </div>
  )
}
