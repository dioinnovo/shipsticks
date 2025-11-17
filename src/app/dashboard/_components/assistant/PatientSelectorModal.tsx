'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { mockPatients } from '@/lib/ai/mock-patient-data'

interface PatientSelectorModalProps {
  showPatientSelector: boolean
  setShowPatientSelector: (show: boolean) => void
  setSelectedPatient: (patient: string | null) => void
  handleSend: (message: string) => void
  pendingQuestion: string | null
  setPendingQuestion: (question: string | null) => void
}

export default function PatientSelectorModal({
  showPatientSelector,
  setShowPatientSelector,
  setSelectedPatient,
  handleSend,
  pendingQuestion,
  setPendingQuestion
}: PatientSelectorModalProps) {
  const [searchInput, setSearchInput] = useState('')

  if (!showPatientSelector) return null

  // Filter patients based on search input
  const filteredPatients = Object.entries(mockPatients).filter(([key, patient]) => {
    const searchTerm = searchInput.toLowerCase()
    return patient.patientName.toLowerCase().includes(searchTerm) ||
           patient.mrn.toLowerCase().includes(searchTerm)
  })

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowPatientSelector(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-x-4 top-20 bottom-20 bg-white dark:bg-gray-900 rounded-2xl shadow-xl z-50 max-w-md mx-auto flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select Patient Context
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose a patient or enter a custom name to load their policy information
          </p>

          {/* Search Input */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g., Margaret Thompson or MRN-784512"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {/* If search input exists but no matches, show option to use custom name */}
          {searchInput && filteredPatients.length === 0 && (
            <button
              onClick={() => {
                const patientName = searchInput
                setSelectedPatient(patientName)
                setShowPatientSelector(false)
                setSearchInput('') // Clear search input

                if (pendingQuestion) {
                  handleSend(`For patient ${patientName}: ${pendingQuestion}`)
                  setPendingQuestion(null)
                }
                // Otherwise just close the modal - don't send anything
              }}
              className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-2 border-blue-500 rounded-lg transition-colors"
            >
              <div className="text-center">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  Use "{searchInput}" as custom patient
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Click to continue with this patient name
                </p>
              </div>
            </button>
          )}

          {/* Available Patients */}
          {filteredPatients.map(([key, patient]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedPatient(patient.patientName)
                setShowPatientSelector(false)
                setSearchInput('') // Clear search input

                // If there was a pending question, send it with the patient context
                if (pendingQuestion) {
                  handleSend(`For patient ${patient.patientName}: ${pendingQuestion}`)
                  setPendingQuestion(null)
                }
                // Otherwise just close the modal - don't send anything
              }}
              className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {patient.patientName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    MRN: {patient.mrn} • Age: {patient.age}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {patient.carrier} - {patient.planType}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {patient.currentConditions.slice(0, 3).map((condition, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                      >
                        {condition}
                      </span>
                    ))}
                    {patient.currentConditions.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{patient.currentConditions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deductible</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${patient.deductibles.individual.remaining}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    of ${patient.deductibles.individual.inNetwork}
                  </p>
                </div>
              </div>
            </button>
          ))}

        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => {
              setShowPatientSelector(false)
              setPendingQuestion(null)
              setSearchInput('') // Clear search input
            }}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  )
}