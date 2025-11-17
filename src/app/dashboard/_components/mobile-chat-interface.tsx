'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Plus,
  X,
  Menu,
  Clock,
  ChevronLeft,
  Send,
  ChevronDown,
  Paperclip,
  ArrowUp,
  Star,
  FileText,
  Image,
  Camera,
  File,
  Link,
  MapPin,
  Search,
  Download
} from 'lucide-react'
import SiriOrb from '@/components/ui/siri-orb'
import SourcesSection from '@/components/ui/sources-section'
import SimpleMarkdownMessage from '@/components/ui/simple-markdown-message'
import { generateHealthcarePolicyPDF } from '@/lib/utils/healthcare-pdf-generator'
import { mockShipments, getShipmentData } from '@/lib/ai/mock-shipment-data'
import { SqlQueryDisplay } from './assistant/SqlQueryDisplay'
import { ChartDisplay } from './assistant/ChartDisplay'
import { DataTableDisplay } from './assistant/DataTableDisplay'
import { ExcelDownloadButton } from './assistant/ExcelDownloadButton'
import { cn } from '@/lib/utils'
import ShipmentSelectorModal from './assistant/ShipmentSelectorModal'
import ChatHistoryPanel from './assistant/ChatHistoryPanel'

// Custom Microphone SVG Component
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M16.7673 6.54284C16.7673 3.91128 14.634 1.77799 12.0024 1.77799C9.37089 1.77799 7.2376 3.91129 7.2376 6.54284L7.2376 13.5647C7.2376 16.1963 9.37089 18.3296 12.0024 18.3296C14.634 18.3296 16.7673 16.1963 16.7673 13.5647L16.7673 6.54284ZM12.0024 3.28268C13.803 3.28268 15.2626 4.7423 15.2626 6.54284L15.2626 13.5647C15.2626 15.3652 13.803 16.8249 12.0024 16.8249C10.2019 16.8249 8.74229 15.3652 8.74229 13.5647L8.74229 6.54284C8.74229 4.7423 10.2019 3.28268 12.0024 3.28268Z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.0274 8.79987C19.6119 8.79987 19.2751 9.1367 19.2751 9.55221V13.5647C19.2751 17.5813 16.019 20.8374 12.0024 20.8374C7.98587 20.8374 4.72979 17.5813 4.72979 13.5647L4.72979 9.55221C4.72979 9.1367 4.39295 8.79987 3.97744 8.79987C3.56193 8.79987 3.2251 9.1367 3.2251 9.55221L3.2251 13.5647C3.2251 18.4123 7.15485 22.3421 12.0024 22.3421C16.85 22.3421 20.7798 18.4123 20.7798 13.5647V9.55221C20.7798 9.1367 20.443 8.79987 20.0274 8.79987Z"/>
  </svg>
)

interface Source {
  id?: string
  name: string
  snippet?: string
  chunkId?: string
  metadata?: {
    page?: number
    section?: string
    confidence?: number
  }
}

interface Metric {
  label: string
  value: string
  color?: string
  trend?: 'up' | 'down'
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  sources?: Source[]
  metrics?: Metric[]
  downloadable?: boolean
  downloadContent?: string | any // Can be string or PatientPolicyData object
  downloadFilename?: string
  isPolicyAnalysis?: boolean
  isStreaming?: boolean
  // SQL Agent fields
  sqlQuery?: string
  queryResults?: { columns: string[]; rows: any[][] }
  chartData?: any
  provider?: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
  titleGenerated?: boolean
  description?: string
  isSaved?: boolean
  savedAt?: Date
}

export default function MobileChatInterface() {
  const [currentChatId, setCurrentChatId] = useState<string>('1')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'recent' | 'saved'>('recent')
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'New Chat',
      timestamp: new Date(),
      messages: [],
      isSaved: false
    }
  ])
  
  const currentChat = chats.find(chat => chat.id === currentChatId) || chats[0]
  const [messages, setMessages] = useState<Message[]>(currentChat.messages)
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [animatedTitle, setAnimatedTitle] = useState(currentChat.title)
  const [titleIsAnimating, setTitleIsAnimating] = useState(false)
  const [selectedModel, setSelectedModel] = useState('quick')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [needsContext, setNeedsContext] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null)
  const [showShipmentSelector, setShowShipmentSelector] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'gapIdentification' | 'relationshipDiscovery' | 'roiBusinessImpact'>('gapIdentification')
  const [userScrolledUp, setUserScrolledUp] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const attachMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const latestAssistantMessageRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  // Handle click outside to close attach menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false)
      }
    }

    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showAttachMenu])

  // Model options with provider indicators
  const modelOptions = [
    { value: 'quick', label: 'Sticks Quick', description: 'Concise answers & quick data summaries' },
    { value: 'arthur-pro', label: 'Sticks Pro', description: 'Comprehensive analysis with detailed insights' }
  ]

  // Complex analytical questions for Sticks Pro (comprehensive SQL analysis)
  const shipSticksProQuestions = {
    gapIdentification: [
      "Which routes have the highest failure rates and what is the cost impact?",
      "Show me the insurance coverage gap by route and estimate potential losses",
      "What percentage of shipments have tracking delays and which carriers are responsible?",
      "Which marketing campaigns had the highest ROI and why?"
    ],
    relationshipDiscovery: [
      "Analyze customer acquisition cost vs lifetime value trends",
      "Show me NPS scores by customer segment and service tier",
      "Compare carrier performance by success rate and profit margin",
      "Analyze our revenue by month and identify seasonal patterns"
    ],
    roiBusinessImpact: [
      "What is our customer lifetime value by acquisition channel?",
      "Compare our profit margins across different service tiers",
      "Show me conversion rates from quote to booking by customer segment",
      "Which routes have the highest failure rates and why? Show me a detailed breakdown by carrier, time of year, and estimated annual cost"
    ]
  }

  // Detect when user manually scrolls up to pause auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      // Check if user is near the bottom (within 100px)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setUserScrolledUp(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll to show assistant's response
  useEffect(() => {
    // Only scroll if user hasn't manually scrolled up
    if (userScrolledUp) return

    const container = messagesContainerRef.current
    if (!container) return

    // Scroll to bottom of container to show new messages
    const lastMessage = messages[messages.length - 1]
    if (lastMessage) {
      // Small delay to ensure message is rendered and DOM is updated
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [messages, userScrolledUp])

  // Auto-resize textarea when input changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [inputValue])

  // Typing animation effect for title
  useEffect(() => {
    if (currentChat.title !== animatedTitle && currentChat.title !== 'New Chat') {
      setTitleIsAnimating(true)
      setAnimatedTitle('')
      
      let currentIndex = 0
      const targetTitle = currentChat.title
      const typingSpeed = 30 // Fast typing speed (30ms per character)
      
      const typeInterval = setInterval(() => {
        if (currentIndex < targetTitle.length) {
          setAnimatedTitle(targetTitle.substring(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          setTitleIsAnimating(false)
        }
      }, typingSpeed)
      
      return () => clearInterval(typeInterval)
    } else if (currentChat.title === 'New Chat') {
      setAnimatedTitle('New Chat')
    }
  }, [currentChat.title])

  // Generate chat title based on conversation context
  const generateChatTitle = async (chatMessages: Message[]) => {
    // Only generate if we have enough messages and haven't generated yet
    const chat = chats.find(c => c.id === currentChatId)
    // Skip if: no chat found, title already generated, not enough messages, or already has a proper title
    if (!chat || chat.titleGenerated || chatMessages.length < 3 || 
        (chat.title !== 'New Chat' && !chat.title.endsWith('...'))) return

    try {
      const response = await fetch('/api/scotty-claims/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'Generate a brief, descriptive title (max 30 characters) for this conversation based on the main topic. Return only the title, no quotes or punctuation.' 
            },
            ...chatMessages.slice(0, 4).map(m => ({
              role: m.role,
              content: m.content.substring(0, 200)
            }))
          ],
          generateTitle: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        const title = data.title || data.response.substring(0, 30)
        
        setChats(prev => prev.map(c => 
          c.id === currentChatId 
            ? { ...c, title: title, titleGenerated: true }
            : c
        ))
      }
    } catch (error) {
      console.error('Error generating title:', error)
    }
  }

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return

    // Clear input if using form input
    if (!text) {
      setInputValue('')
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)

    // Only update chat title if it's the first message AND the chat still has "New Chat" as title
    if (messages.length === 0 && currentChat.title === 'New Chat') {
      const truncatedTitle = messageText.length > 50
        ? messageText.substring(0, 50) + '...'
        : messageText
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, title: truncatedTitle, messages: newMessages }
          : chat
      ))
    } else {
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: newMessages }
          : chat
      ))
    }

    // Set typing indicator
    setIsTyping(true)

    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    const placeholderMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    // Add placeholder to UI immediately
    const messagesWithPlaceholder = [...newMessages, placeholderMessage]
    setMessages(messagesWithPlaceholder)
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: messagesWithPlaceholder }
        : chat
    ))

    // Call the unified API with selected model
    try {
      const response = await fetch('/api/assistant/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: selectedModel, // 'quick' for Sticks Quick, 'arthur-pro' for Sticks Pro
          stream: true, // Enable streaming for progressive rendering
          generateTitle: messages.length === 0, // Generate title for first message
          resetThread: messages.length === 0, // Reset thread for new conversations
          conversationId: currentChatId, // Pass conversation ID for context tracking
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type')
      const isStreamingResponse = contentType?.includes('text/plain') || contentType?.includes('text/event-stream')

      if (isStreamingResponse && response.body) {
        // Handle streaming response
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ''
        let metadata: any = {}

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Text content chunk
              const content = line.substring(2).replace(/^"(.+)"$/, '$1')
              accumulatedContent += content

              // Update message in real-time
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              ))
              setChats(prev => prev.map(chat =>
                chat.id === currentChatId
                  ? {
                      ...chat,
                      messages: chat.messages.map(msg =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                    }
                  : chat
              ))
            } else if (line.startsWith('d:')) {
              // Metadata chunk (suggestions, sources, etc.)
              try {
                const jsonData = JSON.parse(line.substring(2))
                metadata = { ...metadata, ...jsonData }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }

        // Finalize message with metadata
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: accumulatedContent,
                suggestions: metadata.suggestions || [],
                sources: metadata.sources || [],
                metrics: metadata.metrics || [],
                downloadable: metadata.downloadable,
                downloadContent: metadata.downloadContent,
                downloadFilename: metadata.downloadFilename,
                isPolicyAnalysis: metadata.downloadable || false,
                isStreaming: false,
                sqlQuery: metadata.sqlQuery,
                queryResults: metadata.queryResults,
                chartData: metadata.chartData,
                provider: metadata.provider
              }
            : msg
        ))
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: accumulatedContent,
                        suggestions: metadata.suggestions || [],
                        sources: metadata.sources || [],
                        isStreaming: false,
                        sqlQuery: metadata.sqlQuery,
                        queryResults: metadata.queryResults,
                        chartData: metadata.chartData,
                        provider: metadata.provider
                      }
                    : msg
                )
              }
            : chat
        ))

        setIsTyping(false)
        return
      }

      // Fallback to non-streaming response (for SQL agent or error cases)
      const data = await response.json()

      // Check if context is needed (for Qlik)
      if (data.needsContext) {
        setNeedsContext(true)
        if (data.pendingQuestion) {
          setPendingQuestion(data.pendingQuestion)
        }
        setShowShipmentSelector(true)
        // Remove placeholder message
        setMessages(newMessages)
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: newMessages }
            : chat
        ))
        setIsTyping(false)
        return
      }

      // Update chat title if generated
      if (data.title && messages.length === 0) {
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, title: data.title, titleGenerated: true }
            : chat
        ))
      }

      // Update the placeholder message with actual data
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: data.response,
              suggestions: data.suggestions || [],
              sources: data.sources || [],
              metrics: data.metrics || [],
              downloadable: data.downloadable,
              downloadContent: data.downloadContent,
              downloadFilename: data.downloadFilename,
              isPolicyAnalysis: data.downloadable || false,
              isStreaming: false,
              // SQL Agent fields
              sqlQuery: data.sqlQuery,
              queryResults: data.queryResults,
              chartData: data.chartData,
              provider: data.provider
            }
          : msg
      ))
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: data.response,
                      suggestions: data.suggestions || [],
                      sources: data.sources || [],
                      isStreaming: false,
                      sqlQuery: data.sqlQuery,
                      queryResults: data.queryResults,
                      chartData: data.chartData,
                      provider: data.provider
                    }
                  : msg
              )
            }
          : chat
      ))
      setIsTyping(false)
    } catch (error) {
      console.error('Error calling unified API:', error)

      // Update placeholder message with error
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: 'I apologize, but I\'m having trouble connecting to my systems right now. Please try again in a moment, or contact support if the issue persists.',
              suggestions: ['Check system status', 'Try again', 'Contact support'],
              isStreaming: false
            }
          : msg
      ))
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: 'I apologize, but I\'m having trouble connecting to my systems right now. Please try again in a moment, or contact support if the issue persists.',
                      suggestions: ['Check system status', 'Try again', 'Contact support'],
                      isStreaming: false
                    }
                  : msg
              )
            }
          : chat
      ))
      setIsTyping(false)
    }
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: new Date()
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setMessages([])
    setShowHistoryModal(false)
  }
  
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      // Reset animated title when switching chats
      setAnimatedTitle(chat.title)
      setTitleIsAnimating(false)
    }
    setShowHistoryModal(false)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Memoized callback for completing typewriter animation
  // Typewriter callbacks removed - no longer needed with SimpleMarkdownMessage

  const toggleSaveChat = (chatId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            isSaved: !chat.isSaved,
            savedAt: !chat.isSaved ? new Date() : undefined
          }
        : chat
    ))
  }

  const filteredChats = (activeTab === 'saved'
    ? chats.filter(chat => chat.isSaved)
    : chats.filter(chat => !chat.isSaved)
  ).filter(chat =>
    searchQuery === '' ||
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 min-h-[4rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        {/* Chat History Button */}
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group cursor-pointer"
          aria-label="Show chat history"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-scc-red transition-colors" />
        </button>

        {/* Current Chat Title */}
        <div className="flex-1 text-center px-2">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 flex items-center justify-center">
            <span>{animatedTitle}</span>
            {titleIsAnimating && (
              <motion.span
                className="inline-block w-0.5 h-4 bg-gray-900 dark:bg-gray-100 ml-0.5"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            )}
          </h2>
        </div>

        {/* Placeholder for symmetry */}
        <div className="w-9 h-9" />
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4">
          {messages.length === 0 ? (
            /* Welcome Screen with Centered Virtual Assistant */
            <div className="flex flex-col items-center justify-start pt-2 sm:pt-4 text-center space-y-4 sm:space-y-6">
              <div className="w-20 h-20 sm:w-32 sm:h-32 flex items-center justify-center">
                <div className="sm:hidden">
                  <SiriOrb size="80px" animationDuration={6} isActive={true} />
                </div>
                <div className="hidden sm:block">
                  <SiriOrb size="128px" animationDuration={6} isActive={true} />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Hi! I'm Sticks
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-sm px-4 sm:px-0">
                  Your Ship Sticks AI assistant. I optimize golf equipment shipping with intelligent route planning, real-time tracking, and cost savings insights for every shipment to championship courses worldwide.
                </p>
              </div>

              {/* Shipment Context Selector */}
              {selectedShipment ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2 sm:p-3 max-w-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Current Shipment</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedShipment}</p>
                      {(() => {
                        const shipment = getShipmentData(selectedShipment)
                        return shipment ? (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {shipment.carrier} • {shipment.serviceLevel}
                          </p>
                        ) : null
                      })()}
                    </div>
                    <button
                      onClick={() => setShowShipmentSelector(true)}
                      className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowShipmentSelector(true)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Select Shipment Context
                </button>
              )}

              {/* Context-Aware Quick Questions - Different UI for Sticks Pro */}
              {selectedModel === 'arthur-pro' ? (
                /* Sticks Pro: Three-tab interface for complex analytics */
                <div className="max-w-3xl w-full">
                  {/* Category Tabs - Horizontal grid on all screens */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                    <button
                      onClick={() => setSelectedQuestionCategory('gapIdentification')}
                      className={`px-2 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        selectedQuestionCategory === 'gapIdentification'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="block font-bold text-xs sm:text-sm">Gap Analysis</span>
                      <span className="block text-xs opacity-90 mt-0.5">Inefficiency detection</span>
                    </button>
                    <button
                      onClick={() => setSelectedQuestionCategory('relationshipDiscovery')}
                      className={`px-2 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        selectedQuestionCategory === 'relationshipDiscovery'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="block font-bold text-xs sm:text-sm">Correlations</span>
                      <span className="block text-xs opacity-90 mt-0.5">Pattern discovery</span>
                    </button>
                    <button
                      onClick={() => setSelectedQuestionCategory('roiBusinessImpact')}
                      className={`px-2 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        selectedQuestionCategory === 'roiBusinessImpact'
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="block font-bold text-xs sm:text-sm">ROI Impact</span>
                      <span className="block text-xs opacity-90 mt-0.5">Revenue optimization</span>
                    </button>
                  </div>

                  {/* Knowledge Graph Power Indicator */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedQuestionCategory === 'gapIdentification' ? 'Uncover missed opportunities and inefficiencies in your shipping network' : selectedQuestionCategory === 'relationshipDiscovery' ? 'Reveal hidden correlations between routes, carriers & delivery success' : 'Optimize cost savings and maximize shipment performance'}
                    </p>
                  </div>

                  {/* Questions Grid - Readable text size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
                    {shipSticksProQuestions[selectedQuestionCategory].map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(question)}
                        className={`text-left p-3 rounded-lg border transition-all group hover:shadow-md cursor-pointer ${
                          selectedQuestionCategory === 'gapIdentification'
                            ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                            : selectedQuestionCategory === 'relationshipDiscovery'
                            ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                            : 'border-green-200 hover:border-green-400 hover:bg-green-50'
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                          {question}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Sticks Quick: Route optimization and shipment tracking */
                <div className="max-w-md">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {selectedShipment ? `Shipment tracking & logistics for ${selectedShipment}:` : 'Route optimization & shipment tracking:'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(() => {
                      // Shipment-specific questions if shipment is selected
                      if (selectedShipment) {
                        const questions = [
                          "Track current shipment location",
                          "Optimize delivery route for fastest arrival",
                          "Check weather impact on delivery",
                          "Estimate arrival time at destination",
                          "Find alternative carriers if delayed",
                          "Calculate total shipping cost",
                          "View shipment handling instructions",
                          "Contact logistics coordinator",
                          "Upgrade to expedited delivery",
                          "Request signature confirmation"
                        ]

                        return questions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(`For shipment ${selectedShipment}: ${question}`)}
                            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all"
                          >
                            {question}
                          </button>
                        ))
                      }

                      // Default questions when no shipment selected - Executive Analytics
                      const generalQuestions = [
                        "Show me top 10 customers by lifetime value",
                        "What are the top customer service issues and their resolution times?",
                        "Identify our top 10 partner courses by volume and revenue",
                        "Compare carrier on-time delivery performance",
                        "Show monthly shipment trends by carrier"
                      ]

                      const shipmentQuestions = [
                        "Which carriers have lowest damage rates?",
                        "What's the average delivery time by route?",
                        "Show revenue breakdown by service tier",
                        "Analyze seasonal shipping patterns",
                        "Which routes are most profitable?"
                      ]

                      return (
                        <>
                          {/* Quick Quote - Always First */}
                          <button
                            key="quick-quote"
                            onClick={() => handleSend("Get shipping quote for golf equipment")}
                            className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-full text-sm font-medium hover:bg-blue-700 transition-all"
                          >
                            Get shipping quote
                          </button>

                          {/* General Questions - No shipment context needed */}
                          {generalQuestions.map((question, idx) => (
                            <button
                              key={`general-${idx}`}
                              onClick={() => handleSend(question)}
                              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-600 transition-all"
                            >
                              {question}
                            </button>
                          ))}

                          {/* Shipment-Specific Questions - Can work with or without context */}
                          {shipmentQuestions.map((question, idx) => (
                            <button
                              key={`shipment-${idx}`}
                              onClick={() => handleSend(question)}
                              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all"
                            >
                              {question}
                            </button>
                          ))}
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Messages View */
            <div className="space-y-4 max-w-2xl mx-auto pb-8">
              <AnimatePresence>
                {messages.map((message, index) => {
                  // Skip rendering empty assistant messages (they show as typing indicator instead)
                  if (message.role === 'assistant' && !message.content.trim()) {
                    return null;
                  }

                  return (
                    <motion.div
                      key={message.id}
                      ref={message.role === 'assistant' && index === messages.length - 1
                        ? latestAssistantMessageRef
                        : null}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[90%] ${message.role === 'user' ? 'order-last' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-scc-red text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                        }`}>
                          {message.role === 'user' ? (
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          ) : (
                            <SimpleMarkdownMessage
                              content={message.content}
                              isPolicy={true}
                            />
                          )}
                        </div>

                      {/* SQL Query Results */}
                      {message.provider === 'sql-agent' && message.role === 'assistant' && (
                        <div className="mt-3 space-y-3">
                          {message.sqlQuery && (
                            <SqlQueryDisplay query={message.sqlQuery} />
                          )}

                          {message.chartData && (
                            <ChartDisplay data={message.chartData} />
                          )}

                          {message.queryResults && message.queryResults.rows.length > 0 && (
                            <>
                              <DataTableDisplay
                                columns={message.queryResults.columns}
                                rows={message.queryResults.rows}
                              />
                              <ExcelDownloadButton
                                columns={message.queryResults.columns}
                                rows={message.queryResults.rows}
                              />
                            </>
                          )}
                        </div>
                      )}

                      {message.downloadable && (
                        <button
                          onClick={() => {
                            // Check if downloadContent is patient data object (has mrn property)
                            if (message.downloadContent && typeof message.downloadContent === 'object' && 'mrn' in message.downloadContent) {
                              // It's patient data - generate healthcare PDF
                              generateHealthcarePolicyPDF(message.downloadContent)
                            } else {
                              // Try to extract the patient name from the message content
                              const content = message.content.toLowerCase()
                              let patientData = null

                              // Check which patient this is for
                              if (content.includes('margaret thompson')) {
                                patientData = getPatientData('margaret thompson')
                              } else if (content.includes('robert chen')) {
                                patientData = getPatientData('robert chen')
                              } else if (content.includes('emily rodriguez')) {
                                patientData = getPatientData('emily rodriguez')
                              }

                              if (patientData) {
                                generateHealthcarePolicyPDF(patientData)
                              } else {
                                // Fallback to text download if policy data not found
                                const blob = new Blob([typeof message.downloadContent === 'string' ? message.downloadContent : JSON.stringify(message.downloadContent) || ''], { type: 'text/plain' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = message.downloadFilename || 'policy_analysis.txt'
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              }
                            }
                          }}
                          className="mt-3 flex items-center gap-2 px-4 py-2 bg-scc-red text-white rounded-lg hover:bg-scc-red-dark transition-colors text-sm font-medium"
                        >
                          <Download size={16} />
                          <span>Download PDF Report</span>
                        </button>
                      )}

                      {message.suggestions && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(suggestion)}
                              className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-scc-red hover:text-scc-red transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Removed metrics display - KPI cards should not appear in conversation */}

                      {/* Sources section for assistant messages */}
                      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                        <SourcesSection sources={message.sources} />
                      )}

                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-right text-gray-400 dark:text-gray-500' : 'text-left text-gray-400 dark:text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Analysis Indicator */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-scc-red rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-scc-red rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-scc-red rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing shipment...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[90%]">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
            </div>
          )}
      </div>

      {/* Input Area - Microsoft Copilot Style */}
      <div className="flex-shrink-0 p-4 !pb-[16px] sm:pb-4">
        {/* Glassmorphism container with border */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl backdrop-saturate-150 border-2 border-white/30 dark:border-gray-700/30 rounded-2xl p-2 shadow-lg shadow-black/10 ring-2 ring-white dark:ring-gray-700">
            {/* Text Input Area */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask about shipments, routes, or tracking..."
              disabled={isTyping}
              className="w-full px-2 py-1.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none transition-all disabled:opacity-50"
              style={{
                minHeight: '32px',
                maxHeight: '120px',
                overflowY: inputValue.split('\n').length > 3 ? 'auto' : 'hidden'
              }}
            />

            {/* Bottom Controls */}
            <div className="flex items-center justify-between mt-1">
                {/* Model Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <span>{modelOptions.find(m => m.value === selectedModel)?.label}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showModelDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                      {modelOptions.map((model) => (
                        <button
                          key={model.value}
                          onClick={() => {
                            setSelectedModel(model.value)
                            setShowModelDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{model.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{model.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Attachment Button with Floating Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="Attach file"
                    >
                      <Plus className={cn("w-6 h-6 transition-transform", showAttachMenu && "rotate-45")} />
                    </button>

                    {/* Floating Attachment Menu */}
                    <AnimatePresence>
                      {showAttachMenu && (
                        <motion.div
                          ref={attachMenuRef}
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 min-w-[200px] z-50"
                        >
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                fileInputRef.current?.click()
                                setShowAttachMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                              <FileText className="w-5 h-5 text-blue-500" />
                              <span>Upload Shipping Details</span>
                            </button>

                            <button
                              onClick={() => {
                                photoInputRef.current?.click()
                                setShowAttachMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                              <Image className="w-5 h-5 text-green-500" />
                              <span>Upload Equipment Photos</span>
                            </button>

                            <button
                              onClick={() => {
                                // Handle camera capture
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.setAttribute('capture', 'environment')
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    handleSend(`[Captured photo: ${file.name}]`)
                                  }
                                }
                                input.click()
                                setShowAttachMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                              <Camera className="w-5 h-5 text-purple-500" />
                              <span>Take Photo</span>
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                              onClick={() => {
                                const trackingNumber = prompt('Enter Tracking Number to link from database:')
                                if (trackingNumber) {
                                  handleSend(`Link existing shipment: ${trackingNumber}`)
                                }
                                setShowAttachMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                              <Link className="w-5 h-5 text-indigo-500" />
                              <span>Link Tracking Number</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Convert file to base64 for demo purposes
                        // In production, you would upload to a server
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const base64 = event.target?.result
                          // Store the policy document in state
                          // Send a message indicating the file was uploaded
                          handleSend(`I've uploaded a policy document: ${file.name}`)
                        }
                        reader.readAsDataURL(file)
                      }
                      e.target.value = '' // Reset input
                    }}
                  />
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        // Convert files to base64 for demo purposes
                        // In production, you would upload to a server
                        const fileNames = Array.from(files).map(f => f.name).join(', ')
                        handleSend(`I've uploaded ${files.length} photo${files.length > 1 ? 's' : ''} of policy documents: ${fileNames}`)
                      }
                      e.target.value = '' // Reset input
                    }}
                  />

                  {/* Mic/Send Button */}
                  <button
                    onClick={() => {
                      if (inputValue.trim()) {
                        handleSend()
                      } else {
                        setIsRecording(!isRecording)
                      }
                    }}
                    disabled={isTyping}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      inputValue.trim() && !isTyping
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        : isRecording
                        ? "bg-red-500 text-white animate-pulse"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    aria-label={inputValue.trim() ? "Send message" : "Voice input"}
                  >
                    {inputValue.trim() ? (
                      <ArrowUp className="w-5 h-5" />
                    ) : (
                      <MicrophoneIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
            </div>
        </div>
      </div>


      {/* Sliding Chat History Panel */}
      <AnimatePresence>
        <ChatHistoryPanel
          showHistoryModal={showHistoryModal}
          setShowHistoryModal={setShowHistoryModal}
          chats={chats}
          setChats={setChats}
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          setMessages={setMessages}
        />
      </AnimatePresence>

      {/* Context Gathering Modal for Shipment Selection */}
      <AnimatePresence>

        {/* Shipment Selector Modal */}
        <ShipmentSelectorModal
          showShipmentSelector={showShipmentSelector}
          setShowShipmentSelector={setShowShipmentSelector}
          setSelectedShipment={setSelectedShipment}
          handleSend={handleSend}
          pendingQuestion={pendingQuestion}
          setPendingQuestion={setPendingQuestion}
        />
      </AnimatePresence>
    </div>
  )
}