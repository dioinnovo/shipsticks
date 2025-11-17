'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Circle } from 'lucide-react'
import Link from 'next/link'
import { AddressStep, AddressData } from '../../_components/shipment/AddressStep'
import { DatesStep, DatesData } from '../../_components/shipment/DatesStep'
import { EquipmentStep, EquipmentData } from '../../_components/shipment/EquipmentStep'
import { VoiceNotesStep, VoiceNotesData } from '../../_components/shipment/VoiceNotesStep'
import { SHIPMENT_STEPS } from '@/lib/constants/shipment-categories'

type StepId = 'shipment-addresses' | 'shipment-dates' | 'equipment-documentation' | 'special-instructions'

interface ShipmentFormData {
  addresses: AddressData
  dates: DatesData
  equipment: EquipmentData
  voiceNotes: VoiceNotesData
}

export default function NewShipmentPage() {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([])

  const [formData, setFormData] = useState<ShipmentFormData>({
    addresses: {
      origin: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        type: '',
        golfCourseName: '',
        contactName: '',
        contactPhone: ''
      },
      destination: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        type: '',
        golfCourseName: '',
        contactName: '',
        contactPhone: ''
      }
    },
    dates: {
      pickupDate: '',
      pickupTimeWindow: '',
      deliveryDate: '',
      deliveryTimeWindow: '',
      isFlexible: false,
      priority: 'express'
    },
    equipment: {
      photos: [],
      aiAnalysis: null,
      insuranceRecommendation: null
    },
    voiceNotes: {
      notes: [],
      additionalInstructions: ''
    }
  })

  const currentStep = SHIPMENT_STEPS[currentStepIndex]
  const isLastStep = currentStepIndex === SHIPMENT_STEPS.length - 1

  const handleStepComplete = () => {
    // Mark current step as completed
    if (!completedSteps.includes(currentStep.id as StepId)) {
      setCompletedSteps([...completedSteps, currentStep.id as StepId])
    }

    // If last step, save to localStorage and navigate to summary
    if (isLastStep) {
      const shipmentId = `SHP-${Date.now()}`
      localStorage.setItem(`shipment-${shipmentId}`, JSON.stringify(formData))
      router.push(`/dashboard/shipments/${shipmentId}/summary`)
    } else {
      // Move to next step
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handleStepChange = (stepIndex: number) => {
    // Only allow going back or to completed steps
    if (stepIndex < currentStepIndex || completedSteps.includes(SHIPMENT_STEPS[stepIndex].id as StepId)) {
      setCurrentStepIndex(stepIndex)
    }
  }

  const updateAddresses = (data: AddressData) => {
    setFormData({ ...formData, addresses: data })
  }

  const updateDates = (data: DatesData) => {
    setFormData({ ...formData, dates: data })
  }

  const updateEquipment = (data: EquipmentData) => {
    setFormData({ ...formData, equipment: data })
  }

  const updateVoiceNotes = (data: VoiceNotesData) => {
    setFormData({ ...formData, voiceNotes: data })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Link
            href="/dashboard/care-sessions"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back to Shipments</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create New Shipment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ship your golf equipment safely with AI-powered insurance recommendations
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            {SHIPMENT_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id as StepId)
              const isCurrent = index === currentStepIndex
              const isClickable = index < currentStepIndex || isCompleted

              return (
                <React.Fragment key={step.id}>
                  {/* Step Circle */}
                  <button
                    onClick={() => isClickable && handleStepChange(index)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-1.5 sm:gap-2 transition-all flex-1 min-w-0 ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-green-500 text-white ring-4 ring-green-500/20'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center w-full px-0.5">
                      <div
                        className={`text-[10px] leading-tight sm:text-xs font-medium break-words ${
                          isCurrent
                            ? 'text-green-600'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.name}
                      </div>
                    </div>
                  </button>

                  {/* Connector Line */}
                  {index < SHIPMENT_STEPS.length - 1 && (
                    <div className="flex-shrink-0 h-0.5 w-4 sm:w-8 mx-1 sm:mx-2 self-center" style={{ marginTop: '20px' }}>
                      <div
                        className={`h-full transition-all ${
                          completedSteps.includes(SHIPMENT_STEPS[index + 1].id as StepId) || index < currentStepIndex
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {currentStepIndex === 0 && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AddressStep
                data={formData.addresses}
                onChange={updateAddresses}
                onComplete={handleStepComplete}
              />
            </motion.div>
          )}

          {currentStepIndex === 1 && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DatesStep
                data={formData.dates}
                onChange={updateDates}
                onComplete={handleStepComplete}
              />
            </motion.div>
          )}

          {currentStepIndex === 2 && (
            <motion.div
              key="equipment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EquipmentStep
                data={formData.equipment}
                onChange={updateEquipment}
                onComplete={handleStepComplete}
              />
            </motion.div>
          )}

          {currentStepIndex === 3 && (
            <motion.div
              key="voice-notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VoiceNotesStep
                data={formData.voiceNotes}
                onChange={updateVoiceNotes}
                onComplete={handleStepComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStepIndex + 1} of {SHIPMENT_STEPS.length}
          </div>
          <div className="flex items-center gap-1">
            {SHIPMENT_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStepIndex
                    ? 'bg-green-600 w-4'
                    : completedSteps.includes(step.id as StepId)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
