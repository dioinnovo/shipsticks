'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Clock, Star, Search } from 'lucide-react'
import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
  isSaved?: boolean
  savedAt?: Date
}

interface ChatHistoryPanelProps {
  showHistoryModal: boolean
  setShowHistoryModal: (show: boolean) => void
  chats: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  currentChatId: string
  setCurrentChatId: (id: string) => void
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export default function ChatHistoryPanel({
  showHistoryModal,
  setShowHistoryModal,
  chats,
  setChats,
  currentChatId,
  setCurrentChatId,
  setMessages
}: ChatHistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'saved'>('recent')
  const [searchQuery, setSearchQuery] = useState('')

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
    }
    setShowHistoryModal(false)
  }

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

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredChats = (activeTab === 'saved'
    ? chats.filter(chat => chat.isSaved)
    : chats.filter(chat => !chat.isSaved)
  ).filter(chat =>
    searchQuery === '' ||
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!showHistoryModal) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 dark:bg-black/50 z-30 sm:absolute sm:rounded-2xl"
        onClick={() => setShowHistoryModal(false)}
      />

      {/* Sliding Panel from Left */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        className="fixed sm:absolute top-2 left-2 bottom-24 sm:bottom-2 w-72 sm:w-80 bg-slate-50 dark:bg-gray-900 z-40 rounded-2xl flex flex-col overflow-hidden shadow-[8px_8px_24px_rgba(0,0,0,0.15)] ring-2 ring-white dark:ring-gray-800"
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat History</h3>
          <button
            onClick={() => setShowHistoryModal(false)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 px-4 pt-4">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'recent'
                  ? 'bg-white text-scc-red shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'saved'
                  ? 'bg-white text-scc-red shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Saved
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-shrink-0 px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-scc-red/30 focus:border-scc-red/50 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-scc-red text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === 'saved' ? 'No saved chats yet' : 'No recent chats'}
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`relative group ${
                    chat.isSaved ? 'bg-amber-50/30 rounded-2xl' : ''
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 p-3 rounded-xl transition-all ${
                      currentChatId === chat.id
                        ? 'bg-scc-red/10 border border-scc-red/30'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => selectChat(chat.id)}
                      className="flex-1 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 break-words text-gray-900 dark:text-gray-100">
                          {chat.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock size={10} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {chat.savedAt && chat.isSaved
                              ? `Saved ${formatTimeAgo(chat.savedAt)}`
                              : formatTimeAgo(chat.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSaveChat(chat.id)
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                      aria-label={chat.isSaved ? "Unsave chat" : "Save chat"}
                    >
                      <Star
                        size={16}
                        className={chat.isSaved ? 'fill-amber-400 text-amber-400' : 'text-gray-400 dark:text-gray-500'}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}