"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function MonkeyCompanionPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Woof! Hi there! I'm Monkey, your AI art companion! 🎨 I'm here to chat about art, creativity, and help you with your artistic journey. What would you like to create today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate AI response
  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "That's a fantastic idea! 🎨 As an artistic dog, I love when humans get creative. What colors are you thinking of using?",
      "Woof woof! That reminds me of when I painted my famous Ferrari piece! 🚗 Art is all about expressing yourself freely.",
      "Oh, I'm wagging my tail with excitement! 🐕 That sounds like it could be a masterpiece. Have you tried using different brush techniques?",
      "Pawsome question! 🐾 In my experience painting (yes, I actually paint!), the best art comes from the heart. What's inspiring you today?",
      "Arf arf! That's exactly the kind of creative thinking I love to see! 🌟 You know, when I'm painting, I always follow my instincts.",
      "Tail-wagging good idea! 🎭 Art should be fun and expressive. Don't worry about making it perfect - just let your creativity flow!",
      "Woof! That's giving me some serious artistic inspiration! 🎨 Have you seen my latest paintings? I love experimenting with bold colors!",
      "Bark bark! You're speaking my language now! 🎪 Art is like play for me - the more fun you have, the better it turns out!",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(
      () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(inputMessage),
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    )
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
        {/* Building/Construction Animation */}
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
      <header className="relative z-10 backdrop-blur-sm bg-black/20 border-b border-white/10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/">
            <Button
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm"
            >
              ← Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Monkey Companion
            </h1>
          </div>
          <div className="w-32" />
        </div>
      </header>

      <div className="flex h-[calc(100vh-120px)] relative z-10">
        {/* Left Side - Coming Soon with Animated Text */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Fade overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/40" />

          <div className="text-center relative z-10">
            <div className="space-y-12">
              {/* Animated Coming Soon Text */}
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

              {/* Animated gradient line */}
              <div className="relative w-32 h-1 mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-ping" />
              </div>

              {/* Animated subtitle */}
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

              {/* Loading animation */}
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
        <div className="w-2/5 relative">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-white/5 to-white/2 border-l border-white/10" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Chat Header */}
            <div className="border-b border-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl">🐕</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Monkey AI</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-gray-300 text-sm">Online & Ready</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-6 py-4 backdrop-blur-sm ${
                      message.isUser
                        ? "bg-gradient-to-r from-orange-500/80 to-yellow-500/80 text-white shadow-lg"
                        : "bg-white/10 text-gray-100 border border-white/20 shadow-lg"
                    }`}
                    style={{ borderRadius: "24px" }}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div
                    className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 max-w-[85%] shadow-lg"
                    style={{ borderRadius: "24px" }}
                  >
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-6 backdrop-blur-sm">
              <div className="flex gap-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Monkey..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-orange-500/50 focus:ring-orange-500/20 backdrop-blur-sm"
                  style={{ borderRadius: "20px" }}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white px-6 shadow-lg backdrop-blur-sm"
                  style={{ borderRadius: "20px" }}
                >
                  <Send className="w-4 h-4" />
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
