'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  MapPin,
  Calendar,
  Package,
  Shield,
  DollarSign,
  ArrowRight,
  Check,
  Edit,
  Home,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface ShipmentSummary {
  addresses: {
    origin: {
      address: string
      city: string
      state: string
      zipCode: string
      type: string
      golfCourseName?: string
      contactName: string
      contactPhone: string
    }
    destination: {
      address: string
      city: string
      state: string
      zipCode: string
      type: string
      golfCourseName?: string
      contactName: string
      contactPhone: string
    }
  }
  dates: {
    pickupDate: string
    pickupTimeWindow: string
    deliveryDate: string
    deliveryTimeWindow: string
    priority: string
  }
  equipment: {
    photos: any[]
    aiAnalysis: any
    insuranceRecommendation: any
  }
  voiceNotes: {
    notes: any[]
    additionalInstructions: string
  }
}

export default function ShipmentSummaryPage() {
  const router = useRouter()
  const params = useParams()
  const shipmentId = params?.shipmentId as string

  const [shipmentData, setShipmentData] = useState<ShipmentSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load shipment data from localStorage
    const savedData = localStorage.getItem(`shipment-${shipmentId}`)
    if (savedData) {
      setShipmentData(JSON.parse(savedData))
    }
    setIsLoading(false)
  }, [shipmentId])

  const handleConfirmShipment = () => {
    // In a real app, this would call an API to create the shipment
    // For now, just navigate back to shipments list
    alert('Shipment created successfully! (Demo mode)')
    router.push('/dashboard/care-sessions')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading summary...</p>
        </div>
      </div>
    )
  }

  if (!shipmentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Shipment Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Could not load shipment data. Please try again.
          </p>
          <Link
            href="/dashboard/care-sessions"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Shipments
          </Link>
        </div>
      </div>
    )
  }

  const { addresses, dates, equipment, voiceNotes } = shipmentData

  // Calculate estimated cost based on priority
  const getShippingCost = () => {
    const baseCost = 49
    const priorityCosts = {
      standard: 49,
      express: 89,
      overnight: 149
    }
    return priorityCosts[dates.priority as keyof typeof priorityCosts] || baseCost
  }

  const formatTimeWindow = (window: string) => {
    const windows: Record<string, string> = {
      morning: '8 AM - 12 PM',
      afternoon: '12 PM - 5 PM',
      evening: '5 PM - 8 PM'
    }
    return windows[window] || window
  }

  const formatLocationType = (type: string) => {
    if (type === 'home_business') return 'Home/Business'
    if (type === 'golf_resort') return 'Golf Club/Resort'
    return type
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Review Your Shipment
            </h1>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <Edit size={20} />
              <span className="text-sm">Edit</span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Review your shipment details before confirming
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Route Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <MapPin className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Shipping Route</h2>
          </div>

          <div className="space-y-4">
            {/* Origin */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-500">From</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {addresses.origin.type === 'golf_resort' ? (
                    <span className="text-sm">⛳</span>
                  ) : (
                    <Home size={16} className="text-gray-400" />
                  )}
                  <span className="text-xs text-gray-500">{formatLocationType(addresses.origin.type)}</span>
                </div>
                {addresses.origin.golfCourseName && (
                  <p className="font-semibold text-green-700 dark:text-green-500 mb-1">
                    {addresses.origin.golfCourseName}
                  </p>
                )}
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {addresses.origin.address}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {addresses.origin.city}, {addresses.origin.state} {addresses.origin.zipCode}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {addresses.origin.contactName} • {addresses.origin.contactPhone}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-4">
              <div className="w-20"></div>
              <ArrowRight className="text-green-600" size={20} />
            </div>

            {/* Destination */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-500">To</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {addresses.destination.type === 'golf_resort' ? (
                    <span className="text-sm">⛳</span>
                  ) : (
                    <Home size={16} className="text-gray-400" />
                  )}
                  <span className="text-xs text-gray-500">{formatLocationType(addresses.destination.type)}</span>
                </div>
                {addresses.destination.golfCourseName && (
                  <p className="font-semibold text-green-700 dark:text-green-500 mb-1">
                    {addresses.destination.golfCourseName}
                  </p>
                )}
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {addresses.destination.address}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {addresses.destination.city}, {addresses.destination.state} {addresses.destination.zipCode}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {addresses.destination.contactName} • {addresses.destination.contactPhone}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Schedule Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Schedule</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Pickup</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {new Date(dates.pickupDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatTimeWindow(dates.pickupTimeWindow)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Delivery</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {new Date(dates.deliveryDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatTimeWindow(dates.deliveryTimeWindow)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dates.priority.charAt(0).toUpperCase() + dates.priority.slice(1)} Shipping
              </span>
            </div>
          </div>
        </motion.div>

        {/* Equipment & Insurance Card */}
        {equipment.aiAnalysis && equipment.insuranceRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Package className="text-purple-600" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Equipment & Insurance
              </h2>
            </div>

            {/* Equipment Detected */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                AI Equipment Analysis
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Equipment Detected</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {equipment.aiAnalysis.equipmentDetected.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Value</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      ${equipment.aiAnalysis.totalValue.estimated.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-500">
                  <Check size={16} />
                  <span>
                    {equipment.aiAnalysis.brandTier.charAt(0).toUpperCase() + equipment.aiAnalysis.brandTier.slice(1)}{' '}
                    quality equipment detected
                  </span>
                </div>
              </div>
            </div>

            {/* Insurance Recommendation */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Recommended Insurance Coverage
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="text-green-600" size={20} />
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        {equipment.insuranceRecommendation.recommendedTier.name}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ${equipment.insuranceRecommendation.recommendedTier.coverage.toLocaleString()} coverage
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${equipment.insuranceRecommendation.recommendedTier.cost}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">added to total</p>
                  </div>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {equipment.insuranceRecommendation.recommendedTier.description}
                </p>
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                    💡 {equipment.insuranceRecommendation.reasoning}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Voice Notes (if any) */}
        {voiceNotes.notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Special Instructions
            </h3>
            <div className="space-y-2">
              {voiceNotes.notes.map((note: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{note.transcription}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cost Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <DollarSign size={24} />
            <h2 className="text-xl font-semibold">Total Cost</h2>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Shipping ({dates.priority})</span>
              <span className="font-semibold">${getShippingCost()}</span>
            </div>
            {equipment.insuranceRecommendation && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Insurance Coverage</span>
                <span className="font-semibold">${equipment.insuranceRecommendation.recommendedTier.cost}</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-3xl font-bold text-green-400">
                  ${getShippingCost() + (equipment.insuranceRecommendation?.recommendedTier.cost || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3 text-sm text-gray-300">
            💰 <strong>Savings:</strong> Shipping your clubs saves you from airline baggage fees (typically
            $50-150 each way)
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => router.back()}
            className="flex-1 h-14 px-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Go Back to Edit
          </button>
          <button
            onClick={handleConfirmShipment}
            className="flex-1 h-14 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Confirm & Create Shipment
          </button>
        </motion.div>
      </div>
    </div>
  )
}
