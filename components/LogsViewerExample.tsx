'use client'

import { createClientLogger } from '@/lib/logger'
import { useState, useRef } from 'react'

const logger = createClientLogger('LogsViewerExample')

/**
 * Example component demonstrating how to use the logger
 * This component provides buttons to simulate different types of logs
 */
export default function LogsViewerExample() {
  const [logMessage, setLogMessage] = useState('')
  const messageInputRef = useRef<HTMLInputElement>(null)

  const handleLogInfo = () => {
    const msg = logMessage || 'Info message'
    logger.info(msg, {
      timestamp: new Date().toISOString(),
      component: 'LogsViewerExample',
    })
    setLogMessage('')
  }

  const handleLogError = () => {
    const msg = logMessage || 'Error occurred'
    logger.error(msg, {
      error: 'Example error',
      stack: new Error().stack,
      userId: 'user_123',
    })
    setLogMessage('')
  }

  const handleLogWarn = () => {
    const msg = logMessage || 'Warning message'
    logger.warn(msg, {
      severity: 'medium',
      affectedUsers: 5,
    })
    setLogMessage('')
  }

  const handleLogDebug = () => {
    const msg = logMessage || 'Debug message'
    logger.debug(msg, {
      variables: {
        x: 123,
        y: 456,
      },
      state: 'active',
    })
    setLogMessage('')
  }

  const handleBatchLogs = async () => {
    try {
      const logs = [
        {
          level: 'INFO' as const,
          message: 'Application started',
          source: 'System',
          context: { version: '1.0.0' },
        },
        {
          level: 'INFO' as const,
          message: 'Database connection established',
          source: 'Database',
          context: { host: 'localhost', port: 5432 },
        },
        {
          level: 'WARN' as const,
          message: 'API response time is high',
          source: 'API',
          context: { endpoint: '/api/users', duration: 2500 },
        },
        {
          level: 'ERROR' as const,
          message: 'Failed to fetch data',
          source: 'DataService',
          context: { error: 'Network timeout', retry: 3 },
        },
        {
          level: 'DEBUG' as const,
          message: 'Cache updated',
          source: 'Cache',
          context: { keys: 42, size: '1.2MB' },
        },
      ]

      const response = await fetch('/api/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      })

      if (response.ok) {
        logger.info('Batch logs sent successfully', { count: logs.length })
      }
    } catch (error) {
      logger.error('Failed to send batch logs', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const handleSimulateTraffic = async () => {
    const messages = [
      'User logged in',
      'Page loaded',
      'API request sent',
      'Data fetched',
      'Cache hit',
      'Component rendered',
      'User action detected',
      'Request processed',
    ]

    const logLevels: Array<'INFO' | 'ERROR' | 'WARN' | 'DEBUG'> = [
      'INFO',
      'INFO',
      'INFO',
      'DEBUG',
      'WARN',
      'INFO',
    ]

    for (let i = 0; i < 20; i++) {
      const level = logLevels[Math.floor(Math.random() * logLevels.length)]
      const message = messages[Math.floor(Math.random() * messages.length)]

      if (level === 'INFO') {
        logger.info(message, { index: i, timestamp: Date.now() })
      } else if (level === 'ERROR') {
        logger.error(message + ' (error)', { index: i, retries: 3 })
      } else if (level === 'WARN') {
        logger.warn(message + ' (warning)', { index: i, severity: 'low' })
      } else {
        logger.debug(message, { index: i, value: Math.random() })
      }

      // Small delay between logs for readability
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    logger.info('Traffic simulation completed', { totalLogs: 20 })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Logs Viewer Demo</h2>

      <div className="space-y-4">
        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Custom Log Message
          </label>
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Enter a custom message..."
            value={logMessage}
            onChange={(e) => setLogMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogInfo()
              }
            }}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Log Level Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleLogInfo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
          >
            Log Info
          </button>
          <button
            onClick={handleLogWarn}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-medium transition-colors"
          >
            Log Warning
          </button>
          <button
            onClick={handleLogError}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
          >
            Log Error
          </button>
          <button
            onClick={handleLogDebug}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-medium transition-colors"
          >
            Log Debug
          </button>
        </div>

        {/* Advanced Actions */}
        <div className="border-t border-gray-600 pt-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Advanced Actions
          </label>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleBatchLogs}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium transition-colors"
            >
              Send Batch Logs
            </button>
            <button
              onClick={handleSimulateTraffic}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-medium transition-colors"
            >
              Simulate Traffic (20 logs)
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-700 p-4 rounded text-sm text-gray-300">
          <p className="font-medium text-white mb-2">How to use:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Enter a custom message or use the default ones</li>
            <li>Click a log level button to emit that type of log</li>
            <li>Watch the logs appear in real-time in the LogsViewer</li>
            <li>Use the search, filters, and other controls in LogsViewer</li>
            <li>Try "Simulate Traffic" to generate multiple logs at once</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
