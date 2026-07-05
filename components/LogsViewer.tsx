'use client'

import React, { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  X,
  Search,
  Trash2,
  Download,
  Pause,
  Play,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  ChevronDown,
  Lightbulb,
} from 'lucide-react'
import AIErrorAnalyzer from './AIErrorAnalyzer'

interface LogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  message: string
  context?: Record<string, unknown>
  source?: string
}

const LOG_LEVEL_COLORS: Record<string, string> = {
  ERROR: 'bg-red-50 border-l-4 border-l-red-500 text-red-900',
  WARN: 'bg-yellow-50 border-l-4 border-l-yellow-500 text-yellow-900',
  INFO: 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-900',
  DEBUG: 'bg-gray-50 border-l-4 border-l-gray-500 text-gray-900',
}

const LOG_LEVEL_ICONS: Record<string, React.ComponentType<any>> = {
  ERROR: AlertCircle,
  WARN: AlertTriangle,
  INFO: Info,
  DEBUG: Bug,
}

const LOG_LEVEL_BADGE_COLORS: Record<string, string> = {
  ERROR: 'bg-red-100 text-red-800',
  WARN: 'bg-yellow-100 text-yellow-800',
  INFO: 'bg-blue-100 text-blue-800',
  DEBUG: 'bg-gray-100 text-gray-800',
}

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(
    new Set(['INFO', 'ERROR', 'WARN', 'DEBUG'])
  )
  const [isPaused, setIsPaused] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [autoScroll, setAutoScroll] = useState(true)
  const [analyzerLog, setAnalyzerLog] = useState<LogEntry | null>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // Connect to Socket.io on mount
  useEffect(() => {
    setConnectionStatus('connecting')
    socketRef.current = io(window.location.origin, {
      path: '/api/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      setConnectionStatus('connected')
    })

    socketRef.current.on('log', (logEntry: LogEntry) => {
      if (!isPaused) {
        setLogs((prevLogs) => {
          const newLogs = [logEntry, ...prevLogs]
          return newLogs.slice(0, 1000) // Keep only the last 1000 logs
        })
      }
    })

    socketRef.current.on('logs:batch', (batchLogs: LogEntry[]) => {
      if (!isPaused) {
        setLogs((prevLogs) => {
          const newLogs = [...batchLogs, ...prevLogs]
          return newLogs.slice(0, 1000)
        })
      }
    })

    socketRef.current.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })

    socketRef.current.on('error', () => {
      setConnectionStatus('disconnected')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [isPaused])

  // Filter logs based on search query and selected levels
  useEffect(() => {
    let filtered = logs.filter((log) => {
      const matchesLevel = selectedLevels.has(log.level)
      const matchesSearch =
        searchQuery === '' ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.context && JSON.stringify(log.context).toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesLevel && matchesSearch
    })

    setFilteredLogs(filtered)
  }, [logs, searchQuery, selectedLevels])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [filteredLogs, autoScroll])

  const handleLevelToggle = (level: string) => {
    const newLevels = new Set(selectedLevels)
    if (newLevels.has(level)) {
      newLevels.delete(level)
    } else {
      newLevels.add(level)
    }
    setSelectedLevels(newLevels)
  }

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      setLogs([])
      setFilteredLogs([])
      setExpandedLogs(new Set())
    }
  }

  const handleDownloadLogs = () => {
    const logsText = filteredLogs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level}] ${log.source ? `(${log.source}) ` : ''}${log.message}${
            log.context ? '\n' + JSON.stringify(log.context, null, 2) : ''
          }`
      )
      .join('\n\n')

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logsText))
    element.setAttribute('download', `logs_${new Date().toISOString()}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const handleScrollChange = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      setAutoScroll(isAtBottom)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Logs Viewer</h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'connecting'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-400">
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : connectionStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button
              onClick={handleDownloadLogs}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Download logs"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleClearLogs}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-red-400"
              title="Clear logs"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['DEBUG', 'INFO', 'WARN', 'ERROR'].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelToggle(level)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedLevels.has(level)
                    ? `${LOG_LEVEL_BADGE_COLORS[level]}`
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
            <span className="text-xs text-gray-400 self-center ml-auto">
              {filteredLogs.length} of {logs.length} logs
            </span>
          </div>
        </div>
      </div>

      {/* Logs Container */}
      <div
        ref={logsContainerRef}
        onScroll={handleScrollChange}
        className="flex-1 overflow-y-auto space-y-1 p-4"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No logs to display</p>
              <p className="text-sm">
                {logs.length === 0
                  ? 'Waiting for logs...'
                  : 'No logs match your search or filter criteria'}
              </p>
            </div>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const IconComponent = LOG_LEVEL_ICONS[log.level]
            const isExpanded = expandedLogs.has(log.id)

            return (
              <div
                key={log.id}
                className={`${LOG_LEVEL_COLORS[log.level]} p-3 rounded text-sm font-mono transition-all`}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => log.context && toggleLogExpansion(log.id)}
                  >
                    <IconComponent size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${LOG_LEVEL_BADGE_COLORS[log.level]}`}>
                          {log.level}
                        </span>
                        <span className="text-xs opacity-75">{log.timestamp}</span>
                        {log.source && <span className="text-xs opacity-75">({log.source})</span>}
                        {log.context && (
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>
                      <p className="mt-1 break-words whitespace-pre-wrap">{log.message}</p>

                      {/* Expanded context */}
                      {log.context && isExpanded && (
                        <details open className="mt-2 text-xs opacity-75">
                          <summary className="cursor-pointer font-semibold mb-1">Context</summary>
                          <pre className="bg-gray-900 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis Button for ERROR logs */}
                  {log.level === 'ERROR' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAnalyzerLog(log)
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium text-white transition-colors"
                      title="Analyze error with AI"
                    >
                      <Lightbulb size={14} />
                      Analyze with AI
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
        {!autoScroll && (
          <div className="sticky bottom-0 flex justify-center py-2">
            <button
              onClick={() => {
                setAutoScroll(true)
                if (logsContainerRef.current) {
                  logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
                }
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
            >
              Jump to bottom
            </button>
          </div>
        )}
      </div>

      {/* AI Error Analyzer Modal */}
      {analyzerLog && (
        <AIErrorAnalyzer
          errorMessage={analyzerLog.message}
          logLevel={analyzerLog.level}
          source={analyzerLog.source}
          context={analyzerLog.context}
          onClose={() => setAnalyzerLog(null)}
        />
      )}
    </div>
  )
}
