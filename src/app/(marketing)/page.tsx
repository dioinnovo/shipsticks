'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Use replace instead of push to prevent back button issues
    // and add immediate navigation
    router.replace('/dashboard/assistant')
  }, [])

  // Show a simple loading message while redirecting
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scc-red mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Ship Sticks Travel Assistant...</p>
      </div>
    </div>
  )
}