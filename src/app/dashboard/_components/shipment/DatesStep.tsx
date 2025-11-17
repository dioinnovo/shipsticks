'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Check, AlertCircle, Zap, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export interface DatesData {
  pickupDate: string
  pickupTimeWindow: 'morning' | 'afternoon' | 'evening' | ''
  deliveryDate: string
  deliveryTimeWindow: 'morning' | 'afternoon' | 'evening' | ''
  isFlexible: boolean
  priority: 'standard' | 'express' | 'overnight'
}

interface DatesStepProps {
  data: DatesData
  onChange: (data: DatesData) => void
  onComplete: () => void
}

const TIME_WINDOWS = [
  { value: 'morning', label: 'Morning', time: '8 AM - 12 PM', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', time: '12 PM - 5 PM', icon: '☀️' },
  { value: 'evening', label: 'Evening', time: '5 PM - 8 PM', icon: '🌆' }
]

const PRIORITY_OPTIONS = [
  {
    value: 'standard',
    label: 'Standard',
    description: '5-7 business days',
    price: '$49',
    icon: <Calendar className="w-6 h-6" />
  },
  {
    value: 'express',
    label: 'Express',
    description: '2-3 business days',
    price: '$89',
    icon: <Zap className="w-6 h-6" />,
    badge: 'Popular'
  },
  {
    value: 'overnight',
    label: 'Overnight',
    description: 'Next business day',
    price: '$149',
    icon: <TrendingUp className="w-6 h-6" />,
    badge: 'Fastest'
  }
]

export function DatesStep({ data, onChange, onComplete }: DatesStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [minPickupDate, setMinPickupDate] = useState('')
  const [minDeliveryDate, setMinDeliveryDate] = useState('')

  useEffect(() => {
    // Set minimum pickup date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setMinPickupDate(tomorrow.toISOString().split('T')[0])

    // Set minimum delivery date based on pickup date and priority
    if (data.pickupDate) {
      const pickup = new Date(data.pickupDate)
      const minDays = data.priority === 'overnight' ? 1 : data.priority === 'express' ? 2 : 5
      pickup.setDate(pickup.getDate() + minDays)
      setMinDeliveryDate(pickup.toISOString().split('T')[0])
    }
  }, [data.pickupDate, data.priority])

  const updateField = (field: keyof DatesData, value: any) => {
    onChange({
      ...data,
      [field]: value
    })

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.pickupDate) newErrors['pickupDate'] = 'Pickup date is required'
    if (!data.pickupTimeWindow) newErrors['pickupTimeWindow'] = 'Pickup time window is required'
    if (!data.deliveryDate) newErrors['deliveryDate'] = 'Delivery date is required'
    if (!data.deliveryTimeWindow) newErrors['deliveryTimeWindow'] = 'Delivery time window is required'

    // Validate delivery date is after pickup date
    if (data.pickupDate && data.deliveryDate) {
      const pickup = new Date(data.pickupDate)
      const delivery = new Date(data.deliveryDate)

      const minDays = data.priority === 'overnight' ? 1 : data.priority === 'express' ? 2 : 5
      const minDelivery = new Date(pickup)
      minDelivery.setDate(minDelivery.getDate() + minDays)

      if (delivery < minDelivery) {
        newErrors['deliveryDate'] = `Delivery must be at least ${minDays} day(s) after pickup for ${data.priority} shipping`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleComplete = () => {
    if (validateForm()) {
      onComplete()
    }
  }

  const isFormComplete =
    data.pickupDate && data.pickupTimeWindow &&
    data.deliveryDate && data.deliveryTimeWindow

  // Calculate estimated transit time
  const getTransitTime = () => {
    if (!data.pickupDate || !data.deliveryDate) return null

    const pickup = new Date(data.pickupDate)
    const delivery = new Date(data.deliveryDate)
    const days = Math.ceil((delivery.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))

    return days
  }

  const transitDays = getTransitTime()

  return (
    <div className="space-y-6">
      {/* Priority Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
            <Zap className="text-purple-600" size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 break-words">Shipping Speed</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">Choose your delivery timeline</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('priority', option.value)}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                data.priority === option.value
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {option.badge && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-md">
                  {option.badge}
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex-shrink-0 ${data.priority === option.value ? 'text-green-600' : 'text-gray-400'}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base text-gray-900 dark:text-gray-100">{option.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">{option.price}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pickup Date & Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 break-words">Pickup Schedule</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">When we'll collect your equipment</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Pickup Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pickup Date *
            </label>
            <input
              type="date"
              value={data.pickupDate}
              min={minPickupDate}
              onChange={(e) => updateField('pickupDate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                errors['pickupDate'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors['pickupDate'] && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors['pickupDate']}
              </p>
            )}
          </div>

          {/* Pickup Time Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pickup Time Window *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TIME_WINDOWS.map((window) => (
                <button
                  key={window.value}
                  type="button"
                  onClick={() => updateField('pickupTimeWindow', window.value)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-center ${
                    data.pickupTimeWindow === window.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{window.icon}</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">{window.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-tight">{window.time}</div>
                </button>
              ))}
            </div>
            {errors['pickupTimeWindow'] && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors['pickupTimeWindow']}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delivery Date & Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
            <Calendar className="text-green-600" size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 break-words">Delivery Schedule</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">When you'd like to receive your equipment</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Date *
            </label>
            <input
              type="date"
              value={data.deliveryDate}
              min={minDeliveryDate}
              onChange={(e) => updateField('deliveryDate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                errors['deliveryDate'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors['deliveryDate'] && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors['deliveryDate']}
              </p>
            )}
          </div>

          {/* Delivery Time Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Time Window *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TIME_WINDOWS.map((window) => (
                <button
                  key={window.value}
                  type="button"
                  onClick={() => updateField('deliveryTimeWindow', window.value)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-center ${
                    data.deliveryTimeWindow === window.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{window.icon}</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">{window.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-tight">{window.time}</div>
                </button>
              ))}
            </div>
            {errors['deliveryTimeWindow'] && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors['deliveryTimeWindow']}
              </p>
            )}
          </div>

          {/* Flexible Dates Toggle */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.isFlexible}
                onChange={(e) => updateField('isFlexible', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-600 flex-shrink-0 mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">My dates are flexible</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                  I can adjust delivery dates if needed to save on shipping costs
                </div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Transit Summary */}
      {transitDays && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4"
        >
          <div className="flex items-start gap-3">
            <Clock className="text-blue-600 flex-shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                Estimated Transit Time: {transitDays} {transitDays === 1 ? 'day' : 'days'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                Your equipment will be in transit from {data.pickupDate} to {data.deliveryDate}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleComplete}
        disabled={!isFormComplete}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          isFormComplete
            ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isFormComplete ? (
          <>
            <Check size={20} className="flex-shrink-0" />
            <span>Continue to Equipment Photos</span>
          </>
        ) : (
          <span>Complete all fields to continue</span>
        )}
      </motion.button>
    </div>
  )
}
