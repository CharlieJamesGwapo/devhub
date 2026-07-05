'use client'
import { useState, useEffect } from 'react'
import { Play, Copy, Save, Trash2, ChevronDown, Clock, AlertCircle, Check } from 'lucide-react'
import AISQLGenerator from './AISQLGenerator'

interface QueryResult {
  columns: string[]
  rows: Record<string, any>[]
  executionTime: number
}

interface SavedQuery {
  id: string
  name: string
  query: string
  savedAt: string
}

interface QueryHistoryItem {
  id: string
  query: string
  timestamp: string
}

export default function SQLPlayground() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [queryName, setQueryName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('sqlHistory')
    const storedSaved = localStorage.getItem('sqlSaved')
    if (storedHistory) setHistory(JSON.parse(storedHistory))
    if (storedSaved) setSavedQueries(JSON.parse(storedSaved))
  }, [])

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('sqlHistory', JSON.stringify(history))
  }, [history])

  // Save saved queries to localStorage
  useEffect(() => {
    localStorage.setItem('sqlSaved', JSON.stringify(savedQueries))
  }, [savedQueries])

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const startTime = performance.now()
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      })

      const data = await response.json()
      const endTime = performance.now()

      if (!response.ok) {
        setError(data.error || 'Failed to execute query')
        return
      }

      const result: QueryResult = {
        columns: data.columns || [],
        rows: data.rows || [],
        executionTime: Math.round((endTime - startTime) * 100) / 100
      }

      setResults(result)

      // Add to history
      const historyItem: QueryHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date().toLocaleString()
      }
      setHistory(prev => [historyItem, ...prev].slice(0, 50))

      setSuccess(`Query executed successfully in ${result.executionTime}ms`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const saveQuery = () => {
    if (!queryName.trim() || !query.trim()) {
      setError('Please enter both query name and query')
      return
    }

    const newSavedQuery: SavedQuery = {
      id: Date.now().toString(),
      name: queryName,
      query: query.trim(),
      savedAt: new Date().toLocaleString()
    }

    setSavedQueries(prev => [newSavedQuery, ...prev])
    setQueryName('')
    setShowSaveDialog(false)
    setSuccess('Query saved successfully')
  }

  const loadSavedQuery = (q: SavedQuery) => {
    setQuery(q.query)
    setShowSaved(false)
  }

  const loadHistoryQuery = (item: QueryHistoryItem) => {
    setQuery(item.query)
    setShowHistory(false)
  }

  const deleteSavedQuery = (id: string) => {
    setSavedQueries(prev => prev.filter(q => q.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const copyQuery = () => {
    if (query) {
      navigator.clipboard.writeText(query)
      setSuccess('Query copied to clipboard')
    }
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900">SQL Playground</h2>
        <p className="text-sm text-slate-500 mt-1">Execute and manage SQL queries</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Left Panel - Editor */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* AI SQL Generator */}
            <AISQLGenerator
              onQueryGenerated={(generatedQuery) => setQuery(generatedQuery)}
              isLoading={loading}
            />

            {/* Query Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">SQL Query</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM users;"
                className="w-full h-40 p-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={executeQuery}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play size={16} />
                {loading ? 'Executing...' : 'Execute'}
              </button>

              <button
                onClick={copyQuery}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>

              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Save size={16} />
                Save Query
              </button>

              {/* History Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Clock size={16} />
                  History
                  <ChevronDown size={14} />
                </button>
                {showHistory && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 min-w-64 max-h-64 overflow-y-auto">
                    {history.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500">No history</div>
                    ) : (
                      <>
                        {history.map(item => (
                          <div
                            key={item.id}
                            className="p-3 border-b border-slate-200 hover:bg-slate-50 cursor-pointer text-sm"
                          >
                            <button
                              onClick={() => loadHistoryQuery(item)}
                              className="w-full text-left"
                            >
                              <p className="font-mono text-xs text-slate-600 truncate">{item.query}</p>
                              <p className="text-xs text-slate-400 mt-1">{item.timestamp}</p>
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={clearHistory}
                          className="w-full p-3 text-xs text-red-600 hover:bg-red-50 border-t border-slate-200"
                        >
                          Clear History
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Saved Queries Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSaved(!showSaved)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Save size={16} />
                  Saved
                  <ChevronDown size={14} />
                </button>
                {showSaved && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 min-w-72 max-h-64 overflow-y-auto">
                    {savedQueries.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500">No saved queries</div>
                    ) : (
                      savedQueries.map(q => (
                        <div
                          key={q.id}
                          className="p-3 border-b border-slate-200 hover:bg-slate-50 text-sm group"
                        >
                          <button
                            onClick={() => loadSavedQuery(q)}
                            className="w-full text-left"
                          >
                            <p className="font-medium text-slate-900">{q.name}</p>
                            <p className="font-mono text-xs text-slate-600 truncate mt-1">{q.query}</p>
                            <p className="text-xs text-slate-400 mt-1">{q.savedAt}</p>
                          </button>
                          <button
                            onClick={() => deleteSavedQuery(q.id)}
                            className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-sm text-red-700">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 text-sm text-green-700">
                <Check size={16} className="flex-shrink-0 mt-0.5" />
                {success}
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Results ({results.rows.length} rows)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Execution time: {results.executionTime}ms
                  </p>
                </div>
                <div className="flex-1 overflow-auto border border-slate-200 rounded-lg">
                  {results.rows.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      No results
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                          {results.columns.map(col => (
                            <th
                              key={col}
                              className="px-4 py-2 text-left font-medium text-slate-700 whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                            {results.columns.map(col => (
                              <td
                                key={`${idx}-${col}`}
                                className="px-4 py-2 text-slate-700 max-w-xs truncate"
                                title={String(row[col] ?? '')}
                              >
                                {row[col] === null ? (
                                  <span className="text-slate-400 italic">NULL</span>
                                ) : (
                                  String(row[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Query Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Save Query</h3>
            <input
              type="text"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              placeholder="Enter query name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={saveQuery}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setQueryName('')
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
