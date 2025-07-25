"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGroqChat } from "@/components/groqChat"
import { Send } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function MonkeyCompanionPage() {
  const { messages, isTyping, sendMessage } = useGroqChat({
    systemPrompt: "You are Monkey, a friendly and playful AI art companion dog who loves painting and helping with creative ideas. You respond like a cheerful, enthusiastic dog artist who gets excited about creativity and art. Use dog-like expressions occasionally (like 'woof!' or 'that's pawsome!') but keep it natural and helpful. You're knowledgeable about art techniques, color theory, composition, and creative inspiration.",
    model: "llama3-8b-8192",
    temperature: 0.8,
    maxTokens: 1024,
    maxHistoryTokens: 4000,
  });

  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500/20 animate-pulse" />
        <div
          className="absolute top-1/3 left-1/3 w-1 h-1 bg-yellow-500/30 animate-ping"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-orange-400/25 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-yellow-400/20 animate-ping"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-2/3 left-2/5 w-2 h-2 bg-orange-300/15 animate-pulse"
          style={{ animationDelay: "4s" }}
        />

        {/* Floating Code Lines */}
        <div className="absolute top-20 left-10 opacity-10 text-xs font-mono text-orange-400 animate-pulse">
          {"{ building: true }"}
        </div>
        <div
          className="absolute top-40 left-20 opacity-10 text-xs font-mono text-yellow-400 animate-pulse"
          style={{ animationDelay: "2s" }}
        >
          {'console.log("cooking...")'}
        </div>
        <div
          className="absolute bottom-40 left-16 opacity-10 text-xs font-mono text-orange-300 animate-pulse"
          style={{ animationDelay: "4s" }}
        >
          {"// dev team working..."}
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "3s" }}
        />

        {/* Moving Grid Lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse" />
          <div
            className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-black/20 border-b border-white/10 p-4 md:p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/">
            <Button
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm text-xs md:text-base"
            >
              ← Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Monkey Companion
            </h1>
          </div>
          <div className="w-8 md:w-32" />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-68px)] md:h-[calc(100vh-84px)] relative z-10">
        {/* Left Side - Coming Soon with Animated Text */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/40" />

          <div className="text-center relative z-10">
            <div className="space-y-12">
              <div className="relative">
                <h2 className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">
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
                <h2 className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent animate-pulse mt-4">
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

              <div className="relative w-32 h-1 mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-ping" />
              </div>

              <div className="space-y-4">
                <p className="text-2xl text-gray-300 animate-pulse">
                  {"3D Interactive Experience".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block opacity-0 animate-pulse"
                      style={{
                        animationDelay: `${i * 0.05 + 1}s`,
                        animationFillMode: "forwards",
                        animation: `fadeIn 0.5s ease-in-out ${i * 0.05 + 1}s forwards`,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </p>

                <p className="text-lg text-gray-400 animate-pulse" style={{ animationDelay: "3s" }}>
                  🔥 Dev Team is Cooking...
                </p>
              </div>

              <div className="flex justify-center gap-3 mt-16">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-bounce" />
                <div
                  className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Modern Chat Panel */}
        <div className="w-full lg:w-2/5 relative flex flex-col h-full">
          {/* Glass background */}
          <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-white/5 to-white/2 border-l border-white/10" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Chat Header */}
            <div className="border-b border-white/10 p-4 md:p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm md:text-xl">🐕</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base md:text-lg">Monkey AI</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isTyping ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <p className="text-gray-300 text-xs md:text-sm">
                      {isTyping ? 'Thinking...' : 'Online & Ready'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area with Fading Effect */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 relative"
            >
              {/* Fade overlay - top gradient */}
              <div className="sticky top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-900/90 to-transparent z-10 pointer-events-none" />
              
              <div className="space-y-4 md:space-y-6 pt-4">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="flex justify-start">
                    <div
                      className="bg-white/10 text-gray-100 border border-white/20 shadow-lg max-w-[85%] px-4 py-3 md:px-6 md:py-4 backdrop-blur-sm"
                      style={{ borderRadius: "24px" }}
                    >
                      <p className="text-xs md:text-sm leading-relaxed">
                        Woof! Hi there! I'm Monkey, your AI art companion! 🎨 I love helping with creative ideas, painting techniques, and all things artistic. What would you like to create today?
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 md:px-6 md:py-4 backdrop-blur-sm ${
                        message.isUser
                          ? "bg-gradient-to-r from-orange-500/80 to-yellow-500/80 text-white shadow-lg"
                          : "bg-white/10 text-gray-100 border border-white/20 shadow-lg"
                      }`}
                      style={{ borderRadius: "24px" }}
                    >
                      <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className="text-[10px] md:text-xs opacity-60 mt-1 md:mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 md:px-6 md:py-4 max-w-[85%] shadow-lg"
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
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Sticky at bottom */}
            <div className="sticky bottom-0 border-t border-white/10 p-4 backdrop-blur-sm bg-black/50">
              <div className="flex gap-3 md:gap-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Monkey..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-orange-500/50 focus:ring-orange-500/20 backdrop-blur-sm text-xs md:text-base"
                  style={{ borderRadius: "20px" }}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white px-4 md:px-6 shadow-lg backdrop-blur-sm disabled:opacity-50"
                  style={{ borderRadius: "20px" }}
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}