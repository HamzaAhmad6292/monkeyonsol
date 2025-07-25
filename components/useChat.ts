// hooks/useChat.ts
import { useState } from "react"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface UseChatOptions {
  systemPrompt?: string
  provider?: "openrouter" | "groq"
}

export function useChat({ systemPrompt = "You are a helpful assistant.", provider = "openrouter" }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async (input: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    const chatHistory: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: input },
    ]

    try {
      const assistantResponse = await fetchChatResponse(chatHistory, provider)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error("Chat error:", err)
    } finally {
      setIsTyping(false)
    }
  }

  return { messages, isTyping, sendMessage }
}

// Modular backend handler
async function fetchChatResponse(history: ChatMessage[], provider: "openrouter" | "groq" ="groq"): Promise<string> {
  const body = {
    model: "llama-3.3-70b-versatile", // you can make this configurable
    messages: history,
  }

  let url = ""
  let headers: Record<string, string> = {}

  if (provider === "openrouter") {
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://your-app.com", // Optional for attribution
    }
  } else if (provider === "groq") {
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
      "Content-Type": "application/json",
    }
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || "No response."
}
