'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Package, MapPin, Truck } from 'lucide-react'
import { mockShipments } from '@/lib/ai/mock-shipment-data'

interface ShipmentSelectorModalProps {
  showShipmentSelector: boolean
  setShowShipmentSelector: (show: boolean) => void
  setSelectedShipment: (shipment: string | null) => void
  handleSend: (message: string) => void
  pendingQuestion: string | null
  setPendingQuestion: (question: string | null) => void
}

export default function ShipmentSelectorModal({
  showShipmentSelector,
  setShowShipmentSelector,
  setSelectedShipment,
  handleSend,
  pendingQuestion,
  setPendingQuestion
}: ShipmentSelectorModalProps) {
  const [searchInput, setSearchInput] = useState('')

  if (!showShipmentSelector) return null

  // Filter shipments based on search input
  const filteredShipments = Object.entries(mockShipments).filter(([key, shipment]) => {
    const searchTerm = searchInput.toLowerCase()
    return shipment.shipmentNumber.toLowerCase().includes(searchTerm) ||
           shipment.trackingNumber.toLowerCase().includes(searchTerm) ||
           shipment.customerName.toLowerCase().includes(searchTerm) ||
           shipment.destinationCourse.toLowerCase().includes(searchTerm)
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'in transit':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'out for delivery':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      case 'pending pickup':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowShipmentSelector(false)}
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Select Shipment Context
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose a shipment or enter a tracking number to load shipment details
          </p>

          {/* Search Input */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g., SS-2024-10145 or 1Z9876543210"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {/* If search input exists but no matches, show option to use custom tracking number */}
          {searchInput && filteredShipments.length === 0 && (
            <button
              onClick={() => {
                const shipmentNumber = searchInput
                setSelectedShipment(shipmentNumber)
                setShowShipmentSelector(false)
                setSearchInput('') // Clear search input

                if (pendingQuestion) {
                  handleSend(`For shipment ${shipmentNumber}: ${pendingQuestion}`)
                  setPendingQuestion(null)
                }
              }}
              className="w-full p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-2 border-green-500 rounded-lg transition-colors"
            >
              <div className="text-center">
                <p className="font-medium text-green-700 dark:text-green-300">
                  Use "{searchInput}" as custom shipment
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Click to continue with this tracking number
                </p>
              </div>
            </button>
          )}

          {/* Available Shipments */}
          {filteredShipments.map(([key, shipment]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedShipment(shipment.shipmentNumber)
                setShowShipmentSelector(false)
                setSearchInput('') // Clear search input

                // If there was a pending question, send it with the shipment context
                if (pendingQuestion) {
                  handleSend(`For shipment ${shipment.shipmentNumber}: ${pendingQuestion}`)
                  setPendingQuestion(null)
                }
              }}
              className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {shipment.customerName}
                    </p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {shipment.shipmentNumber} • {shipment.trackingNumber}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs">{shipment.destinationCourse}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs">{shipment.carrier} - {shipment.serviceLevel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Package className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs">{shipment.equipmentType}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${shipment.totalPrice}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {shipment.estimatedDelivery.split(',')[0]}
                  </p>
                </div>
              </div>
            </button>
          ))}

        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => {
              setShowShipmentSelector(false)
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
