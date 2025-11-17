'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Home,
  FileSearch,
  MessageSquare,
  FileText,
  DollarSign,
  Users,
  CalendarDays,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Camera,
  History,
  FileCheck,
  Sun,
  Moon,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      description: 'Analytics & Insights'
    },
    {
      title: 'Sticks',
      icon: Brain,
      href: '/dashboard/assistant',
      description: 'AI Assistant'
    },
    {
      title: 'Customers',
      icon: FileText,
      href: '/dashboard/claims',
      description: 'Customer Orders'
    },
    {
      title: 'Shipments',
      icon: CalendarDays,
      href: '/dashboard/care-sessions',
      description: 'Active Shipments'
    },
    {
      title: 'Partners',
      icon: Users,
      href: '/dashboard/referrals',
      description: 'Golf Course & Resort Network'
    }
  ]

  return (
    <aside
      className={`
        bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 h-full transition-all duration-300 flex flex-col rounded-2xl shadow-lg shadow-gray-400/30 dark:shadow-gray-800/30 ring-2 ring-white dark:ring-gray-800
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            {isCollapsed ? (
              <Image
                src={theme === 'dark' ? "/shipsticks-icon-white.png" : "/shipsticks-icon-blue.png"}
                alt="Ship Sticks"
                width={32}
                height={32}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            ) : (
              <Image
                src={theme === 'dark' ? "/shipsticks-logo-white.png" : "/shipsticks-logo-blue.png"}
                alt="Ship Sticks"
                width={246}
                height={50}
                className="object-contain"
                style={{ height: 'auto' }}
                priority
              />
            )}
          </Link>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-green-600 dark:text-green-500 border-l-4 border-green-600 pl-2'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    }
                  `}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs opacity-75">{item.description}</div>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Theme Toggle */}
        {mounted && (
          <div className={`mb-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              title={isCollapsed ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : undefined}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              {!isCollapsed && (
                <span className="text-sm font-medium">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Company Info */}
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold mb-1">Making Golf Travel Simpler</p>
            <p>Door-to-Door Golf Equipment & Luggage Shipping</p>
            <p className="mt-2">© 2025 Ship Sticks</p>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>© '25</p>
          </div>
        )}
      </div>
    </aside>
  )
}