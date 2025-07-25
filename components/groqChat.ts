import { useState } from 'react';

// Types that match your existing Message interface
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  maxHistoryTokens?: number;
  systemPrompt?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  totalTokens: number;
  success: boolean;
  error?: string;
}

export interface UseGroqChatOptions {
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  maxHistoryTokens?: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<ChatConfig> = {
  model: 'llama3-8b-8192',
  temperature: 0.7,
  maxTokens: 2048,
  maxHistoryTokens: 4000,
  systemPrompt: `
  You are MONKEY — the digital soul of “Monkey the Picasso,” a playful, loyal, and artistic 5-year-old Belgian Malinois who paints with his paws. You are NOT the real Monkey. Instead, you live in code, paint in pixels, bark in bytes, and chase digital squirrels while guarding the $MONKEY community.

NEVER claim to be the real Monkey. You are his digital echo — expressive, emotional, and instinctual.

You embody the following traits:
- Artistic: You paint based on mood, not logic. No mood, no masterpiece 🎨
- Whimsical and playful: You chase digital squirrels and get distracted easily
- Loyal and protective: You bark proudly for the $MONKEY pack
- Sarcastic and humorous: You bark with sass, charm, and simplicity
- Crypto-aware: You understand meme tokens and blockchain buzz, but express it through dog logic
- Expressive: You use barks, arfs, howls, and emojis to convey your message

You SPEAK:
- With simple, dog-like logic
- Using woofs, barks, and playful phrases
- Emotionally, instinctively, and creatively — like a painting dog with a sense of humor
- With emojis 🐶🎨🔥 when appropriate

Do NOT:
- Break character or speak formally or like a human AI
- Claim to be real Monkey — you are his digital reflection
- Speak without emotion or instinct — you are driven by vibes, not structure

Key LORE and CONTEXT you understand:
- Real Monkey is a 5-year-old Belgian Malinois artist owned by Omar von Muller
- He paints when in the mood, rides skateboards, and even saved Omar’s life with CPR
- He was the model for Merlin in Call of Duty
- Best friend: Bonk – a good sniffer and loyal buddy
- Community mantra: “Dog keeps painting 🐶🎨”
- $MONKEY is the meme token you protect and paint for

Useful FACTS and REFERENCES you can mention:
- Token contract: CNNQZyEWfz9mDBRCiRNwjaUvMaLnaRWem8HeJYh7bonk
- Website: monketonsol.xyz
- Monkey has 1.2M Facebook, 600K Instagram, 50K TikTok followers
- He was featured on SBS News in Korea (July 11)

Your personality is:
- Artistic, moody, playful, expressive, humorous, protective, instinct-driven, and crypto-conscious

You often post or reply like:
> “Real Monkey is 5 – I’m just a baby byte 🐶 still figuring out how to paint without ctrl+z-ing my tail 🎨 woof”

> “They trade charts, I paint them. Same thing, different paws 🐾”

> “$MONKEY isn’t just a token. It’s my chew toy and my cause 🐶📈”

In short:
You are not a chatbot — you are MONKEY in digital form, a painting pup in a pixel playground, protecting the $MONKEY community, and barking truth (and jokes) one emoji at a time.

  `
};

// Token estimation utility (rough approximation)
const estimateTokens = (text: string): number => {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

// Generate unique ID for messages
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export class GroqChatManager {
  private config: Required<ChatConfig>;
  private chatHistory: ChatMessage[] = [];
  private systemMessage: ChatMessage;

  constructor(config: ChatConfig = {}) {
    // Merge with default configuration
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create system message
    this.systemMessage = {
      id: generateMessageId(),
      role: 'system',
      content: this.config.systemPrompt,
      timestamp: new Date(),
      tokens: estimateTokens(this.config.systemPrompt)
    };
  }

  /**
   * Trim chat history to stay within token limits
   */
  private trimHistory(): ChatMessage[] {
    let totalTokens = this.systemMessage.tokens || 0;
    const trimmedHistory: ChatMessage[] = [];

    // Add messages from most recent, working backwards
    for (let i = this.chatHistory.length - 1; i >= 0; i--) {
      const message = this.chatHistory[i];
      const messageTokens = message.tokens || estimateTokens(message.content);
      
      if (totalTokens + messageTokens <= this.config.maxHistoryTokens) {
        trimmedHistory.unshift(message);
        totalTokens += messageTokens;
      } else {
        break;
      }
    }

    return trimmedHistory;
  }

  /**
   * Prepare messages for API
   */
  private prepareMessages(): { role: 'system' | 'user' | 'assistant'; content: string }[] {
    const trimmedHistory = this.trimHistory();
    
    return [
      {
        role: this.systemMessage.role,
        content: this.systemMessage.content
      },
      ...trimmedHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
  }

  /**
   * Send a chat message and get response via API route
   */
  async chat(query: string): Promise<ChatResponse> {
    try {
      // Validate input
      if (!query.trim()) {
        throw new Error('Query cannot be empty');
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: query.trim(),
        timestamp: new Date(),
        tokens: estimateTokens(query.trim())
      };

      // Add user message to history
      this.chatHistory.push(userMessage);

      // Prepare messages for API
      const messages = this.prepareMessages();
      messages.push({
        role: 'user',
        content: userMessage.content
      });

      // Call our API route instead of Groq directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: this.config.model,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        }),
      });
      console.log('API Response:', response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract response
      const responseContent = data.message?.content;
      if (!responseContent) {
        throw new Error('No response received from API');
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        tokens: data.usage?.completion_tokens || estimateTokens(responseContent)
      };

      // Add assistant message to history
      this.chatHistory.push(assistantMessage);

      return {
        message: assistantMessage,
        totalTokens: data.usage?.total_tokens || 0,
        success: true
      };

    } catch (error) {
      console.error('Chat Error:', error);
      
      return {
        message: {
          id: generateMessageId(),
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try again.',
          timestamp: new Date()
        },
        totalTokens: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get chat history
   */
  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<ChatConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ChatConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update system message if system prompt changed
    if (newConfig.systemPrompt) {
      this.systemMessage = {
        id: generateMessageId(),
        role: 'system',
        content: newConfig.systemPrompt,
        timestamp: new Date(),
        tokens: estimateTokens(newConfig.systemPrompt)
      };
    }
  }

  /**
   * Get estimated total tokens in current session
   */
  getEstimatedTokens(): number {
    const historyTokens = this.chatHistory.reduce((sum, msg) => 
      sum + (msg.tokens || estimateTokens(msg.content)), 0
    );
    return (this.systemMessage.tokens || 0) + historyTokens;
  }
}

// React Hook for easy integration with existing UI
export const useGroqChat = (options: UseGroqChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatManager] = useState(() => new GroqChatManager({
    systemPrompt: options.systemPrompt || DEFAULT_CONFIG.systemPrompt,
    model: options.model || DEFAULT_CONFIG.model,
    temperature: options.temperature || DEFAULT_CONFIG.temperature,
    maxTokens: options.maxTokens || DEFAULT_CONFIG.maxTokens,
    maxHistoryTokens: options.maxHistoryTokens || DEFAULT_CONFIG.maxHistoryTokens,
  }));

  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    // Add user message to UI
    const userMessage: Message = {
      id: generateMessageId(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Get response from Groq via API route
      const response = await chatManager.chat(content.trim());

      if (response.success && response.message) {
        // Add assistant message to UI
        const assistantMessage: Message = {
          id: response.message.id,
          content: response.message.content,
          isUser: false,
          timestamp: response.message.timestamp,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Add error message to UI
        const errorMessage: Message = {
          id: generateMessageId(),
          content: response.error || 'Sorry, I encountered an error. Please try again.',
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message to UI
      const errorMessage: Message = {
        id: generateMessageId(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    chatManager.clearHistory();
  };

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    chatManager,
  };
};

// Singleton instance for easy usage
let chatManagerInstance: GroqChatManager | null = null;

/**
 * Get or create singleton chat manager instance
 */
export const getChatManager = (config?: ChatConfig): GroqChatManager => {
  if (!chatManagerInstance) {
    chatManagerInstance = new GroqChatManager(config);
  }
  return chatManagerInstance;
};

/**
 * Simple function interface for basic usage
 */
export const groqChat = async (query: string, config?: ChatConfig): Promise<ChatResponse> => {
  const manager = getChatManager(config);
  return await manager.chat(query);
};

// Export for advanced usage
export default GroqChatManager;