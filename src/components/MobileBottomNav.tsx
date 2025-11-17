'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Brain,
  Users,
  MapPin
} from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Shipments',
      icon: Package,
      href: '/dashboard/care-sessions',
    },
    {
      title: 'Sticks',
      icon: Brain,
      href: '/dashboard/assistant',
    },
    {
      title: 'Customers',
      icon: Users,
      href: '/dashboard/claims',
    },
    {
      title: 'Partners',
      icon: MapPin,
      href: '/dashboard/referrals',
    }
  ]

  const activeIndex = menuItems.findIndex(item => {
    if (item.href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden pb-safe">
      <div className="relative p-4">
        <nav className="
          relative
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl backdrop-saturate-150
          border border-gray-200/50 dark:border-gray-700/50
          rounded-full
          shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]
          px-2 py-2
        ">
          <ul className="flex items-center justify-between relative">
            {/* Animated background indicator - positioned behind the active item */}
            {menuItems.map((item, index) => {
              const isActive = index === activeIndex
              const Icon = item.icon

              return (
                <li key={item.href} className="flex-1 relative z-10 flex justify-center">
                  {/* Bubble positioned absolutely within the active item */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-[#4fab55] rounded-full shadow-lg pointer-events-none"
                      layoutId="nav-bubble"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <Link
                    href={item.href}
                    className={`
                      relative z-10 flex flex-col items-center justify-center gap-0.5 px-2 py-3 rounded-full transition-all w-full
                      ${isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-[#4fab55] hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <Icon size={18} className="transition-transform" />
                    <span className="text-[11px] font-medium leading-tight">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}