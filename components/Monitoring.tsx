'use client'

import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  Activity,
  Zap,
  AlertTriangle,
  TrendingUp,
  Server,
  Clock,
  Cpu,
  HardDrive,
  RefreshCw,
} from 'lucide-react'

// Generate realistic dummy data for CPU and Memory
const generateCPUMemoryData = () => {
  const data = []
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      cpu: Math.floor(Math.random() * 40 + 20), // 20-60%
      memory: Math.floor(Math.random() * 35 + 40), // 40-75%
    })
  }
  return data
}

// Generate realistic response time data
const generateResponseTimeData = () => {
  const data = []
  const endpoints = ['API', 'Web', 'Database', 'Cache', 'Storage']
  for (let i = 0; i < 12; i++) {
    data.push({
      time: `${(i * 2).toString().padStart(2, '0')}:00`,
      api: Math.floor(Math.random() * 150 + 50), // 50-200ms
      web: Math.floor(Math.random() * 100 + 40), // 40-140ms
      database: Math.floor(Math.random() * 200 + 80), // 80-280ms
      cache: Math.floor(Math.random() * 50 + 10), // 10-60ms
      storage: Math.floor(Math.random() * 120 + 60), // 60-180ms
    })
  }
  return data
}

// Generate error rate data
const generateErrorRateData = () => {
  const data = []
  for (let i = 0; i < 12; i++) {
    data.push({
      time: `${(i * 2).toString().padStart(2, '0')}:00`,
      errors: Math.floor(Math.random() * 15 + 2), // 2-17 errors
      '4xx': Math.floor(Math.random() * 10 + 1),
      '5xx': Math.floor(Math.random() * 5),
    })
  }
  return data
}

// Generate uptime data (last 30 days)
const generateUptimeData = () => {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      uptime: Math.floor(Math.random() * 2 + 99), // 99-101%
      downtime: Math.max(0, Math.floor(Math.random() * 60)),
    })
  }
  return data
}

interface MonitoringStats {
  avgCPU: number
  avgMemory: number
  avgResponseTime: number
  errorRate: number
  uptime: number
  activeConnections: number
}

export default function Monitoring() {
  const [cpuMemoryData, setCpuMemoryData] = useState(generateCPUMemoryData())
  const [responseTimeData, setResponseTimeData] = useState(
    generateResponseTimeData()
  )
  const [errorRateData, setErrorRateData] = useState(generateErrorRateData())
  const [uptimeData, setUptimeData] = useState(generateUptimeData())
  const [stats, setStats] = useState<MonitoringStats>({
    avgCPU: 0,
    avgMemory: 0,
    avgResponseTime: 0,
    errorRate: 0,
    uptime: 0,
    activeConnections: 0,
  })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Calculate statistics
  useEffect(() => {
    if (cpuMemoryData.length > 0) {
      const avgCPU = Math.round(
        cpuMemoryData.reduce((sum, d) => sum + d.cpu, 0) / cpuMemoryData.length
      )
      const avgMemory = Math.round(
        cpuMemoryData.reduce((sum, d) => sum + d.memory, 0) / cpuMemoryData.length
      )
      const avgResponseTime = Math.round(
        responseTimeData.reduce(
          (sum, d) => sum + (d.api + d.web + d.database + d.cache + d.storage) / 5,
          0
        ) / responseTimeData.length
      )
      const totalErrors = errorRateData.reduce((sum, d) => sum + d.errors, 0)
      const errorRate = ((totalErrors / errorRateData.length) * 100).toFixed(2)
      const avgUptime = Math.round(
        uptimeData.reduce((sum, d) => sum + d.uptime, 0) / uptimeData.length
      )

      setStats({
        avgCPU,
        avgMemory,
        avgResponseTime,
        errorRate: parseFloat(errorRate),
        uptime: avgUptime,
        activeConnections: Math.floor(Math.random() * 150 + 50),
      })
    }
  }, [cpuMemoryData, responseTimeData, errorRateData, uptimeData])

  const handleRefresh = () => {
    setCpuMemoryData(generateCPUMemoryData())
    setResponseTimeData(generateResponseTimeData())
    setErrorRateData(generateErrorRateData())
    setUptimeData(generateUptimeData())
    setLastUpdated(new Date())
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    trend,
    color,
  }: {
    icon: React.ComponentType<any>
    label: string
    value: number | string
    unit: string
    trend?: number
    color: string
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-semibold">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
            <span className="text-lg text-gray-500 ml-1">{unit}</span>
          </p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% from last hour
            </p>
          )}
        </div>
        <Icon className="text-gray-400" size={40} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="text-blue-600" size={32} />
              System Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time performance metrics and health status
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>

        {/* Last Updated */}
        <div className="mb-6 text-sm text-gray-600">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Cpu}
            label="Avg CPU"
            value={stats.avgCPU}
            unit="%"
            color="border-blue-500"
          />
          <StatCard
            icon={HardDrive}
            label="Avg Memory"
            value={stats.avgMemory}
            unit="%"
            color="border-purple-500"
          />
          <StatCard
            icon={Zap}
            label="Avg Response Time"
            value={stats.avgResponseTime}
            unit="ms"
            color="border-green-500"
          />
          <StatCard
            icon={AlertTriangle}
            label="Error Rate"
            value={stats.errorRate}
            unit="%"
            color="border-red-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Uptime"
            value={stats.uptime}
            unit="%"
            color="border-emerald-500"
          />
          <StatCard
            icon={Server}
            label="Active Connections"
            value={stats.activeConnections}
            unit=""
            color="border-indigo-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CPU & Memory Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Cpu size={24} className="text-blue-600" />
              CPU & Memory Usage (24h)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cpuMemoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  dot={false}
                  name="CPU (%)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#a855f7"
                  dot={false}
                  name="Memory (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={24} className="text-green-600" />
              Response Time by Endpoint (12h)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                  formatter={(value) => `${value}ms`}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="api"
                  stroke="#10b981"
                  dot={false}
                  name="API"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="web"
                  stroke="#f59e0b"
                  dot={false}
                  name="Web"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="database"
                  stroke="#ef4444"
                  dot={false}
                  name="Database"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cache"
                  stroke="#06b6d4"
                  dot={false}
                  name="Cache"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="storage"
                  stroke="#8b5cf6"
                  dot={false}
                  name="Storage"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Error Rate Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-600" />
              Error Rates (12h)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <Legend />
                <Bar dataKey="4xx" stackId="a" fill="#f97316" name="4xx Errors" />
                <Bar dataKey="5xx" stackId="a" fill="#dc2626" name="5xx Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Uptime Tracking Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-emerald-600" />
              30-Day Uptime Tracking
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                  domain={[98, 101]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Area
                  type="monotone"
                  dataKey="uptime"
                  stroke="#10b981"
                  fill="#d1fae5"
                  name="Uptime (%)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Performance Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-600 text-sm font-semibold">System Health</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">Excellent</p>
              <p className="text-xs text-gray-500 mt-2">
                All metrics within normal range
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-600 text-sm font-semibold">Load Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">Normal</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.activeConnections} active connections
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-gray-600 text-sm font-semibold">
                Avg Response Time
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.avgResponseTime}ms
              </p>
              <p className="text-xs text-gray-500 mt-2">Across all endpoints</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-gray-600 text-sm font-semibold">Error Count</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {Math.round(stats.errorRate)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                per monitoring period
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
