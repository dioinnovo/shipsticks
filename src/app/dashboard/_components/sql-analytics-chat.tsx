'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  Send,
  ChevronDown,
  ArrowUp,
  Database,
  BarChart3,
  TrendingUp,
  Code
} from 'lucide-react'
import SiriOrb from '@/components/ui/siri-orb'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getFriendlyColumnName } from '@/lib/columnMapping'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sqlQuery?: string
  results?: any[]
  rowCount?: number
  queryTime?: number
  followUpQuestions?: string[]
  chartData?: any[]
}

const QUICK_QUESTIONS = [
  // 💰 Revenue Optimization
  "What is our customer lifetime value by acquisition channel?",
  "Compare carrier performance by success rate and profit margin",
  "Compare our profit margins across different service tiers",
  "Show me conversion rates from quote to booking by customer segment",

  // 📉 Cost Reduction & Operational Efficiency
  "Which routes have the highest failure rates and what is the cost impact?",
  "Show me the insurance coverage gap by route and estimate potential losses",
  "What percentage of shipments have tracking delays and which carriers are responsible?",
  "Analyze our revenue by month and identify seasonal patterns",

  // 👥 Customer Experience & Retention
  "What are the top customer service issues and their resolution times?",
  "Show me NPS scores by customer segment and service tier",
  "Analyze customer acquisition cost vs lifetime value trends",

  // 📊 Strategic Planning & Partnerships
  "Identify our top 10 partner courses by volume and revenue",
  "Which marketing campaigns had the highest ROI and why?",
  "Analyze our monthly recurring revenue from premium memberships",
  "Which routes have the highest failure rates and why? Show me a detailed breakdown by carrier, time of year, and estimated annual cost"
]

export default function SQLAnalyticsChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const latestAssistantMessageRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputValue])

  // Auto-scroll to latest message
  useEffect(() => {
    if (latestAssistantMessageRef.current) {
      setTimeout(() => {
        latestAssistantMessageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return

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
    setIsTyping(true)

    try {
      const response = await fetch('/api/sql-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Prepare chart data if applicable
      let chartData = null
      if (data.results && data.results.length > 0) {
        chartData = prepareChartData(data.results)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Found ${data.rowCount} results in ${data.queryTime}ms`,
        timestamp: new Date(),
        sqlQuery: data.query,
        results: data.results,
        rowCount: data.rowCount,
        queryTime: data.queryTime,
        followUpQuestions: data.followUpQuestions,
        chartData
      }

      setMessages([...newMessages, assistantMessage])
      setIsTyping(false)
    } catch (error) {
      console.error('Error calling SQL agent:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing that query. Please try again.',
        timestamp: new Date()
      }

      setMessages([...newMessages, errorMessage])
      setIsTyping(false)
    }
  }

  const prepareChartData = (results: any[]) => {
    if (!results || results.length === 0) return null

    // Try to detect if this data is suitable for charting
    const firstRow = results[0]
    const keys = Object.keys(firstRow)

    // Look for numeric columns
    const numericKeys = keys.filter(key => typeof firstRow[key] === 'number')

    if (numericKeys.length === 0) return null

    return results.slice(0, 10) // Limit to first 10 rows for cleaner charts
  }

  const renderChart = (data: any[]) => {
    if (!data || data.length === 0) return null

    const firstRow = data[0]
    const keys = Object.keys(firstRow)

    // Find the label key (usually first column or one containing "name", "month", etc.)
    const labelKey = keys.find(k =>
      k.toLowerCase().includes('name') ||
      k.toLowerCase().includes('month') ||
      k.toLowerCase().includes('course') ||
      k.toLowerCase().includes('carrier') ||
      k.toLowerCase().includes('status')
    ) || keys[0]

    // Find numeric keys
    const numericKeys = keys.filter(key => typeof firstRow[key] === 'number')

    if (numericKeys.length === 0) return null

    // Use the most significant numeric column (usually total, revenue, count)
    const primaryMetric = numericKeys.find(k =>
      k.toLowerCase().includes('revenue') ||
      k.toLowerCase().includes('total') ||
      k.toLowerCase().includes('shipment') ||
      k.toLowerCase().includes('count')
    ) || numericKeys[0]

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={labelKey} angle={-45} textAnchor="end" height={100} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name) => [value, getFriendlyColumnName(name as string)]} />
            <Legend formatter={(value) => getFriendlyColumnName(value)} />
            <Bar dataKey={primaryMetric} fill="#5fd063" name={getFriendlyColumnName(primaryMetric)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderTable = (results: any[]) => {
    if (!results || results.length === 0) {
      return <p className="text-sm text-gray-500">No results found</p>
    }

    const columns = Object.keys(results[0])

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  {getFriendlyColumnName(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {typeof row[col] === 'number' ? row[col].toLocaleString() : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 min-h-[4rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Ship Sticks Analytics
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI Ready
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">200+ Shipments</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4">
        {messages.length === 0 ? (
          /* Welcome Screen */
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
                Natural Language to SQL
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-sm px-4 sm:px-0">
                Ask questions in plain English, get instant data insights
              </p>
            </div>

            {/* Quick Questions */}
            <div className="max-w-2xl w-full">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Quick Questions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(question)}
                    className="text-left p-3 rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 transition-all group"
                  >
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages View */
          <div className="space-y-4 max-w-4xl mx-auto pb-8">
            <AnimatePresence>
              {messages.map((message, index) => (
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
                    {/* Message bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>

                    {/* Assistant-specific content */}
                    {message.role === 'assistant' && (
                      <div className="mt-3 space-y-3">
                        {/* Visualization */}
                        {message.chartData && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visualization</span>
                              <span className="text-xs text-gray-500">{message.rowCount} results</span>
                            </div>
                            {renderChart(message.chartData)}
                          </div>
                        )}

                        {/* Expandable SQL Query */}
                        {message.sqlQuery && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => setExpandedQuery(expandedQuery === message.id ? null : message.id)}
                              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Generated SQL Query
                                </span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 text-gray-600 transition-transform",
                                  expandedQuery === message.id && "transform rotate-180"
                                )}
                              />
                            </button>
                            {expandedQuery === message.id && (
                              <div className="px-4 pb-4">
                                <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                                  <code>{message.sqlQuery}</code>
                                </pre>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(message.sqlQuery!)
                                  }}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Query Results Table */}
                        {message.results && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Results</span>
                              </div>
                              <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                Export Excel
                              </button>
                            </div>
                            {renderTable(message.results)}
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {message.followUpQuestions.map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(question)}
                                className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-right text-gray-400' : 'text-left text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%]">
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

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 !pb-[16px] sm:pb-4">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl backdrop-saturate-150 border-2 border-white/30 dark:border-gray-700/30 rounded-2xl p-2 shadow-lg shadow-black/10 ring-2 ring-white dark:ring-gray-700">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask about shipments, routes, revenue..."
            disabled={isTyping}
            className="w-full px-2 py-1.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none transition-all disabled:opacity-50"
            style={{
              minHeight: '32px',
              maxHeight: '120px',
              overflowY: inputValue.split('\n').length > 3 ? 'auto' : 'hidden'
            }}
          />

          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Natural Language to SQL
            </div>

            <button
              onClick={() => handleSend()}
              disabled={isTyping || !inputValue.trim()}
              className={cn(
                "p-1.5 rounded-full transition-all",
                inputValue.trim() && !isTyping
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "text-gray-400 bg-gray-100 dark:bg-gray-700"
              )}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
