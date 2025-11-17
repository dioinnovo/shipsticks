'use client'

import React, { useState } from 'react'
import { MapPin, Home, Building2, Check, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export interface AddressData {
  origin: {
    address: string
    city: string
    state: string
    zipCode: string
    type: 'home_business' | 'golf_resort' | ''
    golfCourseName?: string
    contactName: string
    contactPhone: string
  }
  destination: {
    address: string
    city: string
    state: string
    zipCode: string
    type: 'home_business' | 'golf_resort' | ''
    golfCourseName?: string
    contactName: string
    contactPhone: string
  }
}

interface AddressStepProps {
  data: AddressData
  onChange: (data: AddressData) => void
  onComplete: () => void
}

export function AddressStep({ data, onChange, onComplete }: AddressStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (section: 'origin' | 'destination', field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    })

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`${section}.${field}`]
      return newErrors
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Origin validation
    if (!data.origin.address) newErrors['origin.address'] = 'Origin address is required'
    if (!data.origin.city) newErrors['origin.city'] = 'City is required'
    if (!data.origin.state) newErrors['origin.state'] = 'State is required'
    if (!data.origin.zipCode) newErrors['origin.zipCode'] = 'ZIP code is required'
    if (!data.origin.type) newErrors['origin.type'] = 'Property type is required'
    if (data.origin.type === 'golf_resort' && !data.origin.golfCourseName) {
      newErrors['origin.golfCourseName'] = 'Golf club/resort name is required'
    }
    if (!data.origin.contactName) newErrors['origin.contactName'] = 'Contact name is required'
    if (!data.origin.contactPhone) newErrors['origin.contactPhone'] = 'Contact phone is required'

    // Destination validation
    if (!data.destination.address) newErrors['destination.address'] = 'Destination address is required'
    if (!data.destination.city) newErrors['destination.city'] = 'City is required'
    if (!data.destination.state) newErrors['destination.state'] = 'State is required'
    if (!data.destination.zipCode) newErrors['destination.zipCode'] = 'ZIP code is required'
    if (!data.destination.type) newErrors['destination.type'] = 'Destination type is required'
    if (data.destination.type === 'golf_resort' && !data.destination.golfCourseName) {
      newErrors['destination.golfCourseName'] = 'Golf club/resort name is required'
    }
    if (!data.destination.contactName) newErrors['destination.contactName'] = 'Contact name is required'
    if (!data.destination.contactPhone) newErrors['destination.contactPhone'] = 'Contact phone is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleComplete = () => {
    if (validateForm()) {
      onComplete()
    }
  }

  const isFormComplete =
    data.origin.address && data.origin.city && data.origin.state && data.origin.zipCode && data.origin.type &&
    data.origin.contactName && data.origin.contactPhone &&
    (data.origin.type !== 'golf_resort' || data.origin.golfCourseName) &&
    data.destination.address && data.destination.city && data.destination.state && data.destination.zipCode &&
    data.destination.type && data.destination.contactName && data.destination.contactPhone &&
    (data.destination.type !== 'golf_resort' || data.destination.golfCourseName)

  return (
    <div className="space-y-6">
      {/* Origin Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <MapPin className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pickup Location</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Where we'll collect your golf equipment</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Origin Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pickup Location Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateField('origin', 'type', 'home_business')}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  data.origin.type === 'home_business'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Home size={24} />
                <span className="font-medium">Home/Business</span>
              </button>
              <button
                type="button"
                onClick={() => updateField('origin', 'type', 'golf_resort')}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  data.origin.type === 'golf_resort'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">⛳</span>
                <span className="font-medium">Golf Club/Resort</span>
              </button>
            </div>
            {errors['origin.type'] && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors['origin.type']}
              </p>
            )}
          </div>

          {/* Golf Club/Resort Name for Origin (conditional) */}
          {data.origin.type === 'golf_resort' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Golf Club/Resort Name *
              </label>
              <input
                type="text"
                value={data.origin.golfCourseName || ''}
                onChange={(e) => updateField('origin', 'golfCourseName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 ${
                  errors['origin.golfCourseName'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="Augusta National Golf Club"
              />
              {errors['origin.golfCourseName'] && (
                <p className="text-red-500 text-xs mt-1">{errors['origin.golfCourseName']}</p>
              )}
            </div>
          )}

          {/* Origin Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              value={data.origin.address}
              onChange={(e) => updateField('origin', 'address', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                errors['origin.address'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
              }`}
              placeholder="123 Main Street"
            />
            {errors['origin.address'] && (
              <p className="text-red-500 text-xs mt-1">{errors['origin.address']}</p>
            )}
          </div>

          {/* Origin City, State, ZIP */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                value={data.origin.city}
                onChange={(e) => updateField('origin', 'city', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                  errors['origin.city'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="Miami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <input
                type="text"
                value={data.origin.state}
                onChange={(e) => updateField('origin', 'state', e.target.value.toUpperCase())}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                  errors['origin.state'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="FL"
                maxLength={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                value={data.origin.zipCode}
                onChange={(e) => updateField('origin', 'zipCode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                  errors['origin.zipCode'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="33101"
                maxLength={5}
              />
            </div>
          </div>

          {/* Origin Contact Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Pickup Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={data.origin.contactName}
                  onChange={(e) => updateField('origin', 'contactName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                    errors['origin.contactName'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={data.origin.contactPhone}
                  onChange={(e) => updateField('origin', 'contactPhone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                    errors['origin.contactPhone'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Destination Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <MapPin className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delivery Location</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Where your equipment will be delivered</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Destination Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Location Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateField('destination', 'type', 'home_business')}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  data.destination.type === 'home_business'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Home size={24} />
                <span className="font-medium">Home/Business</span>
              </button>
              <button
                type="button"
                onClick={() => updateField('destination', 'type', 'golf_resort')}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  data.destination.type === 'golf_resort'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">⛳</span>
                <span className="font-medium">Golf Club/Resort</span>
              </button>
            </div>
          </div>

          {/* Golf Club/Resort Name (conditional) */}
          {data.destination.type === 'golf_resort' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Golf Club/Resort Name *
              </label>
              <input
                type="text"
                value={data.destination.golfCourseName || ''}
                onChange={(e) => updateField('destination', 'golfCourseName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 ${
                  errors['destination.golfCourseName'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="Pebble Beach Golf Links"
              />
              {errors['destination.golfCourseName'] && (
                <p className="text-red-500 text-xs mt-1">{errors['destination.golfCourseName']}</p>
              )}
            </div>
          )}

          {/* Destination Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              value={data.destination.address}
              onChange={(e) => updateField('destination', 'address', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                errors['destination.address'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
              }`}
              placeholder="456 Golf Club Road"
            />
          </div>

          {/* Destination City, State, ZIP */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                value={data.destination.city}
                onChange={(e) => updateField('destination', 'city', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                  errors['destination.city'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="Pebble Beach"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <input
                type="text"
                value={data.destination.state}
                onChange={(e) => updateField('destination', 'state', e.target.value.toUpperCase())}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                  errors['destination.state'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="CA"
                maxLength={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                value={data.destination.zipCode}
                onChange={(e) => updateField('destination', 'zipCode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                  errors['destination.zipCode'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="93953"
                maxLength={5}
              />
            </div>
          </div>

          {/* Destination Contact Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Delivery Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={data.destination.contactName}
                  onChange={(e) => updateField('destination', 'contactName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                    errors['destination.contactName'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={data.destination.contactPhone}
                  onChange={(e) => updateField('destination', 'contactPhone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 ${
                    errors['destination.contactPhone'] ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleComplete}
        disabled={!isFormComplete}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          isFormComplete
            ? 'bg-arthur-blue text-white hover:bg-arthur-blue-dark cursor-pointer shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isFormComplete ? (
          <>
            <Check size={20} />
            <span>Continue to Dates</span>
          </>
        ) : (
          <span>Complete all fields to continue</span>
        )}
      </motion.button>
    </div>
  )
}
