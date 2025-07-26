"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGroqChat } from "@/components/groqChat"
import { Send } from "lucide-react"
import Link from "next/link"
import { Orbitron, Rajdhani } from 'next/font/google'
import ThreeScene from '@/components/ThreeScene'

// Define creative Google Fonts
const headingFont = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
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

export default function MonkeyCompanionPage() {
  const { messages, isTyping, sendMessage } = useGroqChat({
    // systemPrompt: "You are Monkey, a friendly and playful AI art companion dog...",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.8,
    maxTokens: 1024,
    maxHistoryTokens: 4000,
  });

  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

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


      {/* Responsive container: row on large screens, overlay on mobile */}
      <div className="relative h-screen flex flex-col lg:flex-row">
        {/* Coming Soon Section */}
        <div className="absolute inset-0 flex items-center justify-center lg:static lg:flex-1 lg:flex lg:items-center lg:justify-center bg-gradient-to-b from-gray-900/80 via-black/60 to-gray-800/80">
          {/* <div className="text-center relative z-0 w-full">
            <div className="space-y-8 md:space-y-12">
              <div className="relative">
                <h2 className="text-5xl sm:text-7xl lg:text-9xl font-extrabold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse tracking-tighter" style={{ fontFamily: 'var(--font-heading)' }}>
                  {"COMING".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block animate-bounce"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "2s",
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </h2>
                <h2 className="text-5xl sm:text-7xl lg:text-9xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent animate-pulse mt-2 lg:mt-4 tracking-tighter" style={{ fontFamily: 'var(--font-heading)' }}>
                  {"SOON".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block animate-bounce"
                      style={{
                        animationDelay: `${(i + 6) * 0.1}s`,
                        animationDuration: "2s",
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </h2>
              </div>

              <div className="relative w-24 lg:w-32 h-0.5 mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/80 to-transparent animate-pulse" />
              </div>

              <div className="space-y-2 md:space-y-4">
                <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-medium animate-pulse tracking-wider font-body">
                  {"3D INTERACTIVE EXPERIENCE".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block opacity-0 animate-pulse"
                      style={{
                        animationDelay: `${i * 0.05 + 1}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </p>

                <p className="text-sm lg:text-lg text-gray-400 animate-pulse tracking-widest font-body" style={{ animationDelay: "3s" }}>
                  🔥 DEV TEAM IS COOKING...
                </p>
              </div>

              <div className="flex justify-center gap-3 mt-8 lg:mt-16">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-bounce" />
                <div
                  className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div> */}
          <ThreeScene
          canvasId="myThreeJsCanvas"
          modelPath="/assets/shiba/scene.gltf"
        />
        </div>

        {/* Chat Panel */}
        <div className="absolute inset-0 lg:static lg:flex-1 lg:flex lg:flex-col h-full min-h-0">
          {/* Consistent background overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from--900/60 via-black/40 to-gray-800/60 lg:static lg:bg-none" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-gradient-to-b from-black/60 to-black/20 p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:bg-white/10 bg-transparent rounded-full w-8 h-8 md:w-10 md:h-10"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                </Link>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm md:text-xl">🐕</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg md:text-xl tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>MONKEY AI</h3>
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
              className="flex-1 overflow-y-auto p-4 md:p-6 relative bg-gradient-to-b from-black/20 via-black/10 to-black/20 min-h-0"
            >
              {/* Fade overlay at top */}
              <div className="sticky top-0 left-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none" />
              
              <div className="space-y-4 md:space-y-6 pt-4">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="flex justify-start animate-in slide-in-from-left-4 duration-500 ease-out">
                    <div
                      className="backdrop-blur-sm bg-white/3 text-gray-100 shadow-lg max-w-[85%] px-4 py-3 md:px-6 md:py-4 relative overflow-hidden"
                      style={{ 
                        borderRadius: "24px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-50"></div>
                      <div className="relative z-10">
                        <p className="text-xs md:text-sm leading-relaxed tracking-wide font-body">
                          WOOF! HI THERE! I'M MONKEY, YOUR AI ART COMPANION! 🎨 I LOVE HELPING WITH CREATIVE IDEAS...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-in ${
                      message.isUser 
                        ? "slide-in-from-right-4 fade-in" 
                        : "slide-in-from-left-4 fade-in"
                    } duration-500 ease-out`}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: "both"
                    }}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 md:px-6 md:py-4 shadow-lg backdrop-blur-sm relative overflow-hidden ${
                        message.isUser
                          ? "bg-gradient-to-br from-orange-500/10 to-yellow-500/8 text-white"
                          : "bg-gradient-to-br from-gray-800/10 to-gray-900/8 text-gray-100"
                      }`}
                      style={{ 
                        borderRadius: "24px",
                        border: message.isUser 
                          ? "1px solid rgba(255, 165, 0, 0.2)" 
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: message.isUser
                          ? "0 8px 32px rgba(255, 165, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                          : "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        message.isUser 
                          ? "from-orange-400/10 via-transparent to-yellow-400/10" 
                          : "from-white/5 via-transparent to-white/5"
                      } opacity-50`}></div>
                      <div className="relative z-10">
                        <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap tracking-wide font-body">{message.content}</p>
                        <div className="text-[10px] md:text-xs opacity-60 mt-1 md:mt-2 tracking-wider font-body">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-in slide-in-from-left-4 fade-in duration-300 ease-out">
                    <div
                      className="backdrop-blur-sm bg-gradient-to-br from-gray-800/10 to-gray-900/8 px-4 py-3 md:px-6 md:py-4 max-w-[85%] shadow-lg relative overflow-hidden"
                      style={{ 
                        borderRadius: "24px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-50"></div>
                      <div className="relative z-10 flex gap-2">
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-gradient-to-t from-black/60 to-black/20 p-4">
              <div className="flex gap-3 md:gap-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="MESSAGE MONKEY..."
                  className="flex-1 bg-gray-800/60 border border-gray-700/40 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 text-xs md:text-base tracking-wide font-body"
                  style={{ borderRadius: "20px" }}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white px-4 md:px-6 shadow-lg disabled:opacity-50 tracking-wider uppercase font-body border-0"
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