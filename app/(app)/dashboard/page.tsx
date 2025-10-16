'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp, DollarSign, Users, FileText, Clock, AlertTriangle,
  Calendar, BarChart3, Activity, Zap, Target, Shield,
  ArrowUp, ArrowDown, Building2, Home, Droplets, Flame,
  CloudRain, Palette, Briefcase, Brain
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeShipments: 1247,
    shippingValueDelivered: 8750000,
    avgCostSavings: 3500,
    deliveryScore: 94,
    avgDeliveryTime: 2.1,
    customerSatisfaction: 96
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'case_created', title: `New Shipment - Callaway Golf Set to Pebble Beach`, time: '5 minutes ago', status: 'new' },
    { id: 2, type: 'care_plan_approved', title: `Bulk Order Approved - $3,500 Monthly Savings`, time: '1 hour ago', status: 'success' },
    { id: 3, type: 'assessment_complete', title: `Delivery Confirmation - Shipment #1247`, time: '2 hours ago', status: 'info' },
    { id: 4, type: 'alert_triggered', title: `Weather Delay Alert - High Priority`, time: '3 hours ago', status: 'warning' },
    { id: 5, type: 'document_uploaded', title: '12 Golf Bag Photos Added - Order #892', time: '4 hours ago', status: 'info' }
  ])

  const scheduledShipments = [
    { id: 1, property: 'Golf Clubs to St. Andrews - J. Smith', time: 'Today 2:00 PM', type: 'Express Delivery', status: 'confirmed' },
    { id: 2, property: 'Ski Equipment to Aspen - M. Johnson', time: 'Today 3:30 PM', type: 'Standard Shipping', status: 'confirmed' },
    { id: 3, property: 'Luggage to Pinehurst - K. Williams', time: 'Tomorrow 10:00 AM', type: 'Resort Delivery', status: 'pending' },
    { id: 4, property: 'Golf Bag Set to Augusta - R. Davis', time: 'Tomorrow 2:00 PM', type: 'VIP Service', status: 'confirmed' }
  ]

  const kpiCards = [
    {
      title: 'Active Shipments',
      value: stats.activeShipments.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Cost-per-Shipment',
      value: `$${Math.round(stats.shippingValueDelivered / stats.activeShipments).toLocaleString()}`,
      change: '-12%',
      trend: 'down',
      icon: TrendingUp,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Avg Cost Savings',
      value: `$${(stats.avgCostSavings).toLocaleString()}`,
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Delivery Score',
      value: `${stats.deliveryScore}%`,
      change: '+7%',
      trend: 'up',
      icon: Target,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <PageHeader
        title="Ship Sticks Dashboard"
        description="Welcome to Ship Sticks! Here's your shipping management overview."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {kpiCards.map((kpi, index) => (
          <div
            key={kpi.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-3 sm:p-6 hover:shadow-lg transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1 sm:mt-2">{kpi.value}</p>
                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                  {kpi.trend === 'up' ? (
                    <ArrowUp className="text-green-500" size={14} />
                  ) : (
                    <ArrowDown className={kpi.title === 'Cost-per-Shipment' ? 'text-green-500' : 'text-red-500'} size={14} />
                  )}
                  <span className={`text-xs sm:text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-green-500' :
                    kpi.title === 'Cost-per-Shipment' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">vs last month</span>
                </div>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${kpi.lightColor} mt-2 sm:mt-0`}>
                <kpi.icon className={kpi.textColor} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Shipments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Scheduled Shipments</h2>
          <Link href="/dashboard/care-sessions" className="text-arthur-blue text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {scheduledShipments.map((shipment) => (
            <div key={shipment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-arthur-blue transition bg-white dark:bg-gray-800 hover:shadow-md">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-1">{shipment.property}</h3>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    shipment.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {shipment.status}
                  </span>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{shipment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{shipment.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
          <Link href="/dashboard/activity" className="text-arthur-blue text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <div className={`p-2 rounded-lg ${
                activity.status === 'new' ? 'bg-blue-100' :
                activity.status === 'success' ? 'bg-green-100' :
                activity.status === 'warning' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                {activity.type === 'case_created' && <Users className="text-arthur-blue" size={20} />}
                {activity.type === 'care_plan_approved' && <DollarSign className="text-green-600" size={20} />}
                {activity.type === 'assessment_complete' && <Shield className="text-gray-600 dark:text-gray-400" size={20} />}
                {activity.type === 'alert_triggered' && <AlertTriangle className="text-yellow-600" size={20} />}
                {activity.type === 'document_uploaded' && <FileText className="text-gray-600 dark:text-gray-400" size={20} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Shipping Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Activity className="text-indigo-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">845</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Golf Clubs</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Zap className="text-yellow-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">389</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Golf Bags</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Shield className="text-green-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">256</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Ski Equipment</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Brain className="text-purple-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">198</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Luggage</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Home className="text-teal-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">434</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Resort Direct</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Users className="text-cyan-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">167</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Bulk Orders</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <FileText className="text-orange-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">289</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">International</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Target className="text-indigo-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">176</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Express</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Customer Segments</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Users className="text-purple-500 w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Individual Golfers</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">55%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Building2 className="text-cyan-500 w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Golf Resorts</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">30%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Shield className="text-green-500 w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Travel Agencies</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">15%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}