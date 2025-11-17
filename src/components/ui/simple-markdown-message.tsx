'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'

interface SimpleMarkdownMessageProps {
  content: string
  isPolicy?: boolean
  className?: string
}

export default function SimpleMarkdownMessage({
  content,
  isPolicy = false,
  className = ""
}: SimpleMarkdownMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Small delay to ensure smooth animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [content])
  const markdownComponents = {
    h1: ({ ...props }: any) => (
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3" {...props} />
    ),
    h2: ({ ...props }: any) => (
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4" {...props} />
    ),
    h3: ({ ...props }: any) => (
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-3" {...props} />
    ),
    p: ({ ...props }: any) => (
      <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed" {...props} />
    ),
    ul: ({ ...props }: any) => (
      <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
    ),
    ol: ({ ...props }: any) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
    ),
    li: ({ ...props }: any) => (
      <li className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
    ),
    table: ({ ...props }: any) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
      </div>
    ),
    thead: ({ ...props }: any) => (
      <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
    ),
    th: ({ ...props }: any) => (
      <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props} />
    ),
    td: ({ ...props }: any) => (
      <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" {...props} />
    ),
    strong: ({ ...props }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />
    ),
    em: ({ ...props }: any) => (
      <em className="italic text-gray-800 dark:text-gray-200" {...props} />
    ),
    hr: ({ ...props }: any) => (
      <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
    ),
    blockquote: ({ ...props }: any) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3" {...props} />
    ),
    code: ({ inline, className, ...props }: any) => {
      const isInline = inline !== false && !className?.includes('language-')

      if (isInline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200" {...props} />
        )
      }

      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto mb-3">
          <code {...props} />
        </div>
      )
    },
    pre: ({ children, ...props }: any) => {
      return <>{children}</>
    }
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 5,
        filter: isVisible ? 'blur(0px)' : 'blur(4px)'
      }}
      transition={{
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1] // Custom easing for magical feel
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  )
}