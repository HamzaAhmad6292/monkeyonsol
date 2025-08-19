"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useGroqChat } from "@/components/groqChat"
import { Send, Mic, AlertCircle, Square } from "lucide-react"
import Link from "next/link"
import { Orbitron, Rajdhani } from 'next/font/google'
import ThreeScene from '@/components/ThreeScene'
import { useToast } from "@/hooks/use-toast"
import { synthesizeSpeech } from "@/components/tts"

// Expose optional STT model from env (build-time)
const STT_MODEL_ID = process.env.NEXT_PUBLIC_STT_MODEL_ID?.trim()

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
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.8,
    maxTokens: 1024,
    maxHistoryTokens: 4000,
  });

  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isChatHidden, setIsChatHidden] = useState(true)
  const [performanceMode, setPerformanceMode] = useState(false)
  const { toast } = useToast()

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [hasTranscriptionError, setHasTranscriptionError] = useState<string | null>(null)
  const [inputPulse, setInputPulse] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const lastAudioBlobRef = useRef<Blob | null>(null)
  const cancelNextStopRef = useRef<boolean>(false)
  const lastSpokenAssistantIdRef = useRef<string | null>(null)

  // Use same-origin proxy to avoid CORS
  const STT_PROXY_ENDPOINT = "/api/speech-to-text"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Set initial avatar state to idle2 when component mounts
  useEffect(() => {
    // Small delay to ensure 3D scene is ready
    const timer = setTimeout(() => {
      setAvatarState('idle2')
    }, 1000)
    
    return () => clearTimeout(timer)
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

  // Helper: dispatch avatar state events for 3D model
  const setAvatarState = (state: 'idle1' | 'idle2' | 'talking') => {
    try {
      window.dispatchEvent(new CustomEvent('avatar:state', { detail: { state } }))
    } catch (error) {
      console.error('[MonkeyCompanion] Error dispatching avatar state:', error);
    }
  }

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop()
      } catch { }
      audioStreamRef.current?.getTracks().forEach((t) => t.stop())
      audioStreamRef.current = null
      mediaRecorderRef.current = null
    }
  }, [])

  const startRecording = async () => {
    try {
      setHasTranscriptionError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream

      const options: MediaRecorderOptions = {}
      // Prefer webm/opus when available
      if (typeof MediaRecorder !== 'undefined') {
        const preferred = 'audio/webm;codecs=opus'
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(preferred)) {
          options.mimeType = preferred
        }
      }

      const recorder = new MediaRecorder(stream, options)
      recordedChunksRef.current = []
      cancelNextStopRef.current = false

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const wasCancelled = cancelNextStopRef.current
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        lastAudioBlobRef.current = blob

        // Release mic
        audioStreamRef.current?.getTracks().forEach((t) => t.stop())
        audioStreamRef.current = null
        mediaRecorderRef.current = null

        setIsRecording(false)

        if (wasCancelled) {
          // If cancelled, go back to idle2 (default state)
          setAvatarState('idle2')
          return
        }

        if (blob.size > 0) {
          // Stay in idle1 while transcribing
          setAvatarState('idle1')
          await transcribeAudio(blob)
        } else {
          // If no audio recorded, go back to idle2
          setAvatarState('idle2')
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)

      // Trigger Idle_1 animation when recording starts
      // Add a small delay to ensure the 3D scene is ready
      setTimeout(() => {
        setAvatarState('idle1');
      }, 100);
    } catch (err) {
      setHasTranscriptionError('Microphone access denied or unavailable')
      // toast({ title: 'Microphone error', description: 'Please allow mic access and try again.' })
      setAvatarState('idle2')
    }
  }

  const stopRecording = (cancel = false) => {
    try {
      cancelNextStopRef.current = cancel

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      } else {
        // If recorder isn't recording, still clean up and set state
        setIsRecording(false)

        // Release mic immediately
        audioStreamRef.current?.getTracks().forEach((t) => t.stop())
        audioStreamRef.current = null
        mediaRecorderRef.current = null
      }
    } catch (error) {
      console.error('Error stopping recording:', error)

      // Ensure we always return to idle1 even on error
      setAvatarState('idle1')
      setIsRecording(false)

      // Cleanup on error
      try {
        audioStreamRef.current?.getTracks().forEach((t) => t.stop())
        audioStreamRef.current = null
        mediaRecorderRef.current = null
      } catch { }
    }
  }

  const retryTranscription = async () => {
    if (lastAudioBlobRef.current) {
      setHasTranscriptionError(null)
      await transcribeAudio(lastAudioBlobRef.current)
    }
  }

  const transcribeAudio = async (blob: Blob) => {
    try {
      setIsTranscribing(true)
      const form = new FormData()
      form.append('file', blob, 'recording.webm')
      // Only send model_id if configured for this deployment
      if (STT_MODEL_ID) {
        form.append('model_id', STT_MODEL_ID)
      }

      const response = await fetch(STT_PROXY_ENDPOINT, {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        throw new Error(errJson?.detail || 'Transcription failed')
      }

      const data = await response.json()
      const transcript: string = data?.text || ''
      if (!transcript) {
        throw new Error('Empty transcript')
      }

      // Add to chat internally and request response
      await sendMessage(transcript)

      // Pulse input to signal new text available
      setInputPulse(true)
      setTimeout(() => setInputPulse(false), 1200)

      // toast({ title: 'Transcribed!', description: 'Your voice message was added to the chat.' })
      // Remain in thinking until TTS begins playing
    } catch (e: any) {
      setHasTranscriptionError(e?.message || 'Transcription failed')
      // toast({ title: 'Transcription error', description: 'Tap retry to try again.' })
      setAvatarState('idle2')
    } finally {
      setIsTranscribing(false)
    }
  }

  // Automatically speak the latest assistant message (production behavior)
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => !m.isUser)
    if (!lastAssistant) return
    if (lastSpokenAssistantIdRef.current === lastAssistant.id) return
    lastSpokenAssistantIdRef.current = lastAssistant.id

      ; (async () => {
        try {
          // Fetch audio first (still in thinking)
          const blob = await synthesizeSpeech({ text: lastAssistant.content, provider: 'openai', voice_name: 'ballad', format: 'mp3', playbackRate: 0.9 })
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)

          // Preserve pitch where supported
          try {
            // @ts-ignore
            if (typeof (audio as any).preservesPitch !== 'undefined') (audio as any).preservesPitch = true
            // @ts-ignore
            if (typeof (audio as any).mozPreservesPitch !== 'undefined') (audio as any).mozPreservesPitch = true
            // @ts-ignore
            if (typeof (audio as any).webkitPreservesPitch !== 'undefined') (audio as any).webkitPreservesPitch = true
          } catch { }
          audio.playbackRate = 0.9

          // Switch to talking now that TTS response is ready
          setAvatarState('talking')

          // When finished, go back to idle2 (default state) and cleanup URL
          audio.addEventListener('ended', () => {
            URL.revokeObjectURL(url)
            setAvatarState('idle2')
          }, { once: true })
          audio.addEventListener('error', () => {
            URL.revokeObjectURL(url)
            setAvatarState('idle2')
          }, { once: true })

          await audio.play()
        } catch (e: any) {
          // If autoplay is blocked or TTS failed, inform user and return to idle2
          toast({ title: 'Tap to enable audio', description: e?.message || 'Autoplay blocked by browser.' })
          setAvatarState('idle2')
        }
      })()
  }, [messages, toast])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden ${headingFont.variable} ${bodyFont.variable}`}>
      {/* Responsive container: row on large screens, overlay on mobile */}
      <div className="relative h-[100svh] min-h-[640px] flex flex-col lg:flex-row">
        {/* 3D Model Section - replaces Coming Soon */}
        <div className="absolute inset-0 lg:static lg:flex-1 lg:flex lg:items-center lg:justify-center">
          <ThreeScene
            canvasId="myThreeJsCanvas"
            // modelPath="/assets/model/files/walk.fbx"
            className="w-full h-full min-h-[640px]"
          />
        </div>

        {/* Chat Panel */}
        <div className="absolute inset-0 lg:static lg:flex-1 lg:flex lg:flex-col h-full min-h-0">
          {/* Removed mobile dark overlay to keep 3D bright */}

          <div className="relative z-10 flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-gradient-to-b from-black/60 to-black/20 p-4 md:p-6">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:bg.white/10 bg-transparent rounded-full w-8 h-8 md:w-10 md:h-10"
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
                  <h3 className="font-bold text.white text-lg md:text-xl tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>MONKEY AI</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isTyping ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <p className="text-gray-300 text-xs md:text-sm tracking-wider font-body">
                      {isTyping ? 'THINKING...' : 'ONLINE & READY'}
                    </p>
                  </div>
                </div>

                {/* Performance Mode and Hide/Show Chat Toggle */}
                <div className="ml-auto flex items-center gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="performance-toggle"
                      className="text-xs md:text-sm tracking-wider font-body text-gray-300"
                    >
                      Performance
                    </label>
                    <Switch
                      id="performance-toggle"
                      checked={performanceMode}
                      onCheckedChange={(enabled) => {
                        setPerformanceMode(enabled);
                        // Dispatch event to ThreeScene to enable/disable performance mode
                        // Performance mode: smaller model, disabled outlines, optimized rendering
                        // Non-performance mode: larger model, enhanced outlines, better materials, antialiasing
                        window.dispatchEvent(new CustomEvent('avatar:performance', { detail: { enabled } }));
                      }}
                      aria-label="Performance mode toggle"
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-yellow-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="hide-chat-toggle"
                      className={`text-xs md:text-sm tracking-wider font-body ${isChatHidden ? 'bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent' : 'text-gray-300'}`}
                    >
                      Hide Chat
                    </label>
                    <Switch
                      id="hide-chat-toggle"
                      checked={isChatHidden}
                      onCheckedChange={setIsChatHidden}
                      aria-label="Hide chat toggle"
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-yellow-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 md:p-6 relative bg-gradient-to-b from-black/20 via-black/10 to-black/20 min-h-0"
            >
              {/* Messages visibility wrapper with smooth transitions */}
              <div
                className={`transition-all duration-200 ease-in-out ${isChatHidden ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}`}
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
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-in ${message.isUser
                        ? "slide-in-from-right-4 fade-in"
                        : "slide-in-from-left-4 fade-in"
                        } duration-500 ease-out`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: "both"
                      }}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 md:px-6 md:py-4 shadow-lg backdrop-blur-sm relative overflow-hidden ${message.isUser
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
                        <div className={`absolute inset-0 bg-gradient-to-br ${message.isUser
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
              </div>
              {/* Former centered mic overlay removed; mic now sits above input bar */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-gradient-to-t from-black/60 to-black/20 p-4">

              {isChatHidden && (
                <div className="flex w-full justify-center mb-2">
                  <button
                    type="button"
                    onClick={() => (isRecording ? stopRecording(false) : startRecording())}
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.preventDefault()
                        isRecording ? stopRecording(false) : startRecording()
                      }
                      if (e.key.toLowerCase() === 'c') {
                        if (isRecording) stopRecording(true)
                      }
                    }}
                    aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                    aria-pressed={isRecording}
                    className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center transition transform duration-150 focus:outline-none focus:ring-2 focus:ring-orange-300/60 ${isRecording
                      ? 'bg-gradient-to-br from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 scale-100'
                      : 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 hover:from-orange-500/30 hover:to-yellow-500/30 border border-orange-400/40 hover:scale-105 hover:shadow-xl'
                      }`}
                  >
                    {isRecording && (
                      <span className="absolute -inset-1 rounded-full border-2 border-orange-300/40 animate-ping" />
                    )}
                    <div className="relative z-10">
                      {hasTranscriptionError ? (
                        <AlertCircle className="w-7 h-7 text-red-300" />
                      ) : isRecording ? (
                        <Square className="w-7 h-7 text-white" />
                      ) : (
                        <Mic className="w-7 h-7 text-white" />
                      )}
                    </div>
                  </button>
                </div>
              )}
              {/* Recording pill removed per request */}
              {/* Retry action if last transcription failed */}
              {isChatHidden && hasTranscriptionError && (
                <div className="-mt-2 mb-2 flex w-full justify-center">
                  <Button
                    onClick={retryTranscription}
                    aria-label="Retry transcription"
                    size="sm"
                    className="h-7 px-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white border-0"
                    style={{ borderRadius: '12px' }}
                  >
                    Retry
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-3 md:gap-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="MESSAGE MONKEY..."
                  className={`flex-1 bg-gray-800/60 border border-gray-700/40 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 text-xs md:text-base tracking-wide font-body ${inputPulse ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                  style={{ borderRadius: "20px" }}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-500 text-white px-4 md:px-6 shadow-lg disabled:opacity-50 tracking-wider uppercase font-body border-0"
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