"use client"

import React, { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

import {
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"
import {
  Camera,
  FileText,
  CheckCircle,
  SkipForward,
  ArrowRight,
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  CircleIcon,
  ChevronUp
} from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  getCareAssessmentIcon,
  getCategoryColor,
  getStatusInfo
} from "@/lib/care-assessment-icons"

export interface CareAssessment {
  id: string
  name: string
  category: string
  icon?: any
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  photoCount?: number
  notesCount?: number
  completionPercentage?: number
  previewImage?: string
  findings?: string
  lastModified?: Date
}

interface CareAssessmentCarouselProps {
  areas: CareAssessment[]
  currentAreaIndex: number
  onAreaSelect: (area: CareAssessment, index: number) => void
  onAreaComplete: (area: CareAssessment) => void
  onAreaSkip: (area: CareAssessment) => void
  onNavigateBack?: () => void
  expandedAreaId?: string | null
  className?: string
  children?: React.ReactNode
  sessionId?: string
}

export function CareAssessmentCarousel({
  areas,
  currentAreaIndex,
  onAreaSelect,
  onAreaComplete,
  onAreaSkip,
  onNavigateBack,
  expandedAreaId,
  className = "",
  children,
  sessionId
}: CareAssessmentCarouselProps) {
  const pageId = sessionId
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(currentAreaIndex)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBottomNav, setShowBottomNav] = useState(true)
  const swiperRef = React.useRef<any>(null)

  // Helper function to get area with icon info
  const getAreaWithIcon = (area: CareAssessment) => {
    const iconInfo = getCareAssessmentIcon(area.id)
    return { ...area, iconInfo }
  }

  useEffect(() => {
    setIsExpanded(!!expandedAreaId)
  }, [expandedAreaId])

  useEffect(() => {
    if (swiperRef.current && !isExpanded) {
      swiperRef.current.slideTo(currentAreaIndex)
    }
  }, [currentAreaIndex, isExpanded])

  // Calculate overall progress (excluding skipped assessments)
  const calculateProgress = () => {
    const completedAssessments = areas.filter(a => a.status === 'completed').length
    const totalAssessments = areas.filter(a => a.status !== 'skipped').length
    return totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0
  }

  const progress = calculateProgress()

  // Get assessment with icon info
  const getAssessmentWithIcon = (assessment: CareAssessment) => {
    const iconInfo = getCareAssessmentIcon(assessment.id)
    return {
      ...assessment,
      iconInfo
    }
  }

  // Handle quick navigation from bottom icons - scrolls carousel only
  const handleQuickNavigation = (index: number) => {
    setActiveIndex(index)
    if (swiperRef.current) {
      swiperRef.current.slideTo(index)
    }
    // Don't trigger area selection - let the user click the active card
  }

  // Render expanded view
  if (isExpanded && expandedAreaId) {
    const expandedAssessment = areas.find(a => a.id === expandedAreaId)
    if (!expandedAssessment) return null

    const assessmentWithIcon = getAssessmentWithIcon(expandedAssessment)
    const statusInfo = getStatusInfo(expandedAssessment.status)
    const categoryColors = getCategoryColor(expandedAssessment.category)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`space-y-4 ${className}`}
      >
        {/* Expanded Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
          {/* Back button and Status on same line */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-100 transition"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back to Assessment Selection</span>
            </button>
            <Badge variant={statusInfo.badgeVariant} className="flex items-center gap-1">
              <statusInfo.icon className="w-3 h-3" />
              {getStatusText(expandedAssessment.status)}
            </Badge>
          </div>

          {/* Assessment Info */}
          <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${categoryColors.bgColor}`}>
                {assessmentWithIcon.iconInfo ? (
                  <assessmentWithIcon.iconInfo.icon className={`w-6 h-6 ${categoryColors.color}`} />
                ) : (
                  <Camera className={`w-6 h-6 ${categoryColors.color}`} />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{expandedAssessment.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{expandedAssessment.category}</p>
              </div>
            </div>

          {/* Assessment Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>{expandedAssessment.name} Progress</span>
              <span>
                {expandedAssessment.status === 'completed' ? '100%' :
                 expandedAssessment.status === 'skipped' ? 'Skipped' :
                 `${expandedAssessment.completionPercentage || 0}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  expandedAssessment.status === 'completed' && "bg-green-500",
                  expandedAssessment.status === 'skipped' && "bg-yellow-500",
                  expandedAssessment.status === 'in_progress' && "bg-blue-500",
                  (!expandedAssessment.status || expandedAssessment.status === 'not_started') && "bg-scc-red"
                )}
                style={{
                  width: expandedAssessment.status === 'completed' ? '100%' :
                         expandedAssessment.status === 'skipped' ? '100%' :
                         `${expandedAssessment.completionPercentage || 0}%`
                }}
              />
            </div>
          </div>

          {/* Action Buttons - Skip and Complete */}
          <div className="flex gap-2">
            <button
              onClick={() => onAreaSkip(expandedAssessment)}
              className="flex-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward size={16} />
              Skip Assessment
            </button>
            <button
              onClick={() => onAreaComplete(expandedAssessment)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Complete Assessment
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
          {children}
        </div>
      </motion.div>
    )
  }

  // Render carousel view
  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 flex-shrink-0">
        <div>
          {/* Back button */}
          {pageId && (
            <button
              onClick={() => router.push(`/dashboard/care-sessions/${pageId}/continue`)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition mb-3"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Care Session Overview</span>
            </button>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold text-scc-gray-dark dark:text-gray-100 mb-1">Care Session Assessment Categories</h2>

          {/* Instructions */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Swipe through categories and tap to document clinical findings
          </p>

          {/* Assessment Status Indicators */}
          <div className="flex items-center gap-1 mb-3">
            {areas.map((assessment, idx) => (
              <div
                key={`status-indicator-${assessment.id}-${idx}`}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all",
                  assessment.status === 'completed' && 'bg-green-500',
                  assessment.status === 'in_progress' && 'bg-blue-500',
                  assessment.status === 'skipped' && 'bg-yellow-500',
                  (!assessment.status || assessment.status === 'not_started') && 'bg-white border border-gray-300'
                )}
                title={`${assessment.name}: ${assessment.status || 'not started'}`}
              />
            ))}
          </div>

          {/* Complete Care Session Button */}
          <button
            onClick={() => {
              // Navigate to complete care session page which triggers animation and report generation
              if (pageId) {
                router.push(`/dashboard/care-sessions/${pageId}/complete`)
              } else {
                console.warn('No care session ID provided for completion')
              }
            }}
            className="w-full py-2.5 px-4 rounded-full font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow-md cursor-pointer"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              Confirm Care Session
            </span>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="h-[520px] px-1 py-4" style={{ overflow: 'visible' }}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          spaceBetween={10}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          initialSlide={currentAreaIndex}
          coverflowEffect={{
            rotate: 35,
            stretch: 20,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex)
          }}
          modules={[EffectCoverflow, Navigation]}
          className="care-assessment-carousel"
        >
          {areas.map((assessment, index) => {
            const assessmentWithIcon = getAssessmentWithIcon(assessment)
            const statusInfo = getStatusInfo(assessment.status)
            const categoryColors = getCategoryColor(assessment.category)
            const hasContent = (assessment.photoCount || 0) > 0 || (assessment.notesCount || 0) > 0

            return (
              <SwiperSlide key={assessment.id} className="!w-[250px] !h-[420px]">
                <div
                  className={cn(
                    "h-full transition-all duration-200",
                    index === activeIndex ? "cursor-pointer" : "cursor-grab"
                  )}
                  onClick={() => {
                    // Only trigger onAreaSelect if this is the active card
                    if (index === activeIndex) {
                      onAreaSelect(assessment, index)
                    } else {
                      // Otherwise, scroll the carousel to this card
                      if (swiperRef.current) {
                        swiperRef.current.slideTo(index)
                      }
                    }
                  }}
                >
                  <div className={cn(
                    "bg-white rounded-xl border-2 overflow-hidden relative h-[420px] max-h-[420px] flex flex-col transition-all duration-200",
                    assessment.status === 'completed' && 'border-green-400',
                    assessment.status === 'in_progress' && 'border-blue-400',
                    assessment.status === 'skipped' && 'border-yellow-400',
                    !assessment.status && 'border-gray-200'
                  )}>
                    {/* Status Badge - Top Right Corner */}
                    {assessment.status && (
                      <div className="absolute top-2 right-2 z-10">
                        {assessment.status === 'completed' && (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {assessment.status === 'skipped' && (
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                            <SkipForward className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {assessment.status === 'in_progress' && (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={cn("px-3 py-2 border-b", categoryColors.bgColor)}>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded-lg bg-white/80")}>
                          {assessmentWithIcon.iconInfo ? (
                            <assessmentWithIcon.iconInfo.icon className={cn("w-4 h-4", categoryColors.color)} />
                          ) : (
                            <Camera className={cn("w-4 h-4", categoryColors.color)} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{assessment.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{assessment.category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Preview Image or Placeholder */}
                      <div className="w-full h-[180px] bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden">
                        {assessment.previewImage && !assessment.previewImage.startsWith('blob:') ? (
                          <img
                            src={assessment.previewImage}
                            alt={assessment.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide the image if it fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Camera className="w-10 h-10 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tap to start assessment</p>
                          </div>
                        )}
                      </div>

                      {/* Content Stats */}
                      {hasContent && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {assessment.photoCount || 0} Photos
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {assessment.notesCount || 0} Notes
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {assessment.completionPercentage !== undefined && assessment.completionPercentage > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                            <span>Progress</span>
                            <span>{assessment.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-scc-red h-1.5 rounded-full transition-all"
                              style={{ width: `${assessment.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Last Modified */}
                      {assessment.lastModified && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Last updated {formatTimeAgo(assessment.lastModified)}</span>
                        </div>
                      )}

                      {/* Quick Actions - Only show on active card */}
                      {index === activeIndex && !assessment.status && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAreaSkip(assessment)
                            }}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <SkipForward size={14} />
                            Skip
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAreaSelect(assessment, index)
                            }}
                            className="flex-1 bg-scc-red text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-scc-red-dark transition-colors flex items-center justify-center gap-1"
                          >
                            <Camera size={14} />
                            Start
                          </button>
                        </div>
                      )}

                      {/* Instruction for non-active cards */}
                      {index !== activeIndex && !assessment.status && (
                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Click to select</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

        {/* Custom Navigation Buttons - Aligned to middle of cards */}
        <button className="swiper-button-prev-custom absolute left-4 top-[50%] -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button className="swiper-button-next-custom absolute right-4 top-[50%] -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Progress Dots and Current Position */}
      <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 flex-shrink-0">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-0.5 mb-1">
          {areas.map((area, idx) => (
            <button
              key={`progress-dot-${area.id}-${idx}`}
              onClick={() => handleQuickNavigation(idx)}
              className={cn(
                "transition-all rounded-full border",
                idx === activeIndex ? "w-2 h-2" : "w-1.5 h-1.5",
                area.status === 'completed' && "bg-green-500 border-green-600",
                area.status === 'in_progress' && "bg-blue-500 border-blue-600",
                area.status === 'skipped' && "bg-yellow-500 border-yellow-600",
                !area.status && "bg-gray-400 border-gray-500",
                idx === activeIndex && area.status !== 'completed' && "bg-scc-red border-red-700 ring-1 ring-scc-red/30",
                idx === activeIndex && area.status === 'completed' && "ring-1 ring-green-500/30"
              )}
              title={area.name}
            />
          ))}
        </div>

        {/* Current Position Text */}
        <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center">
          Assessment {activeIndex + 1} of {areas.length}
        </p>
      </div>

      {/* Bottom Navigation Bar with Icons */}
      <AnimatePresence>
        {showBottomNav && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="bg-white dark:bg-gray-900 border-t border-gray-200 px-4 pb-2 pt-0 flex-shrink-0"
          >
            {/* Category Groups */}
            <div className="space-y-0.5">
              {Array.from(new Set(areas.map(a => a.category))).map(category => {
                const categoryAreas = areas.filter(a => a.category === category)
                if (categoryAreas.length === 0) return null

                const categoryColors = getCategoryColor(category)
                
                return (
                  <div key={category}>
                    <div className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">{category}</div>
                    <div className="flex items-center gap-2 overflow-x-auto p-0.5">
                      {categoryAreas.map((area, areaIndex) => {
                        const globalIndex = areas.findIndex(a => a.id === area.id)
                        const areaWithIcon = getAreaWithIcon(area)
                        const statusInfo = getStatusInfo(area.status)
                        const isActive = globalIndex === activeIndex

                        return (
                          <button
                            key={`bottom-nav-${area.id}-${areaIndex}`}
                            onClick={() => handleQuickNavigation(globalIndex)}
                            className={cn(
                              "relative p-2.5 rounded-md transition-all flex-shrink-0",
                              area.status === 'completed' && "bg-green-50",
                              area.status === 'skipped' && "bg-yellow-50",
                              area.status === 'in_progress' && "bg-blue-50",
                              !area.status && "bg-gray-50 hover:bg-gray-100",
                              isActive && area.status !== 'completed' && area.status !== 'skipped' && "bg-scc-red ring-2 ring-scc-red/40",
                              isActive && area.status === 'completed' && "bg-green-50 ring-2 ring-green-500/40",
                              isActive && area.status === 'skipped' && "bg-yellow-50 ring-2 ring-yellow-500/40"
                            )}
                            title={area.name}
                          >
                            {areaWithIcon.iconInfo ? (
                              <areaWithIcon.iconInfo.icon
                                className={cn(
                                  "w-5 h-5",
                                  area.status === 'completed' && "text-green-600",
                                  area.status === 'skipped' && "text-yellow-600",
                                  area.status === 'in_progress' && "text-blue-600",
                                  !area.status && (isActive ? "text-white" : "text-gray-500")
                                )}
                              />
                            ) : area.icon ? (
                              <area.icon
                                className={cn(
                                  "w-5 h-5",
                                  area.status === 'completed' && "text-green-600",
                                  area.status === 'skipped' && "text-yellow-600",
                                  area.status === 'in_progress' && "text-blue-600",
                                  !area.status && (isActive ? "text-white" : "text-gray-500")
                                )}
                              />
                            ) : (
                              <Camera className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                            )}

                            {/* Status Indicator */}
                            {area.status === 'completed' && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border border-white">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {area.status === 'skipped' && (
                              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .care-assessment-carousel {
          width: 100%;
        }

        .care-assessment-carousel .swiper-slide {
          background-position: center;
          background-size: cover;
        }

        /* Remove any dark overlays from swiper-wrapper */
        .care-assessment-carousel .swiper-wrapper {
          background: transparent !important;
        }

        .care-assessment-carousel .swiper-wrapper::before,
        .care-assessment-carousel .swiper-wrapper::after {
          display: none !important;
        }


        .care-assessment-carousel .swiper-slide {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  )
}

// Helper function to get status text
function getStatusText(status?: string): string {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'in_progress':
      return 'In Progress'
    case 'skipped':
      return 'Skipped'
    default:
      return 'Not Started'
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}