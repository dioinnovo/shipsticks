'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Something went wrong
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {error.message || 'An unexpected error occurred'}
        </p>

        {error.digest && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-8">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <Home className="w-4 h-4" />
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
