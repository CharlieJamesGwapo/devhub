'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Loader,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Zap,
} from 'lucide-react'

interface ErrorAnalysis {
  cause: string
  solutions: string[]
  relatedDocs: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface AIErrorAnalyzerProps {
  errorMessage: string
  logLevel?: string
  source?: string
  context?: Record<string, unknown>
  onClose: () => void
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300',
}

const SEVERITY_ICONS: Record<string, React.ComponentType<any>> = {
  low: AlertCircle,
  medium: AlertCircle,
  high: AlertCircle,
  critical: Zap,
}

export default function AIErrorAnalyzer({
  errorMessage,
  logLevel,
  source,
  context,
  onClose,
}: AIErrorAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const analyzerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const analyzeError = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/ai/analyze-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            errorMessage,
            logLevel,
            source,
            context,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to analyze error')
        }

        const data = await response.json()
        setAnalysis(data.analysis)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    analyzeError()
  }, [errorMessage, logLevel, source, context])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (analyzerRef.current && !analyzerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={analyzerRef}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb size={24} />
            <h2 className="text-xl font-bold">AI Error Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Error Details</h3>
            <div className="space-y-2 font-mono text-sm text-gray-700">
              <div>
                <span className="font-semibold">Message:</span> {errorMessage}
              </div>
              {logLevel && (
                <div>
                  <span className="font-semibold">Level:</span> {logLevel}
                </div>
              )}
              {source && (
                <div>
                  <span className="font-semibold">Source:</span> {source}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <Loader className="animate-spin mx-auto text-blue-600" size={32} />
                <p className="text-gray-600">Analyzing error with AI...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Analysis Failed</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && !loading && (
            <div className="space-y-4">
              {/* Severity Badge */}
              <div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${
                    SEVERITY_COLORS[analysis.severity]
                  }`}
                >
                  {React.createElement(SEVERITY_ICONS[analysis.severity], { size: 18 })}
                  Severity: {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
                </div>
              </div>

              {/* Cause */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} className="text-orange-600" />
                  Root Cause
                </h3>
                <p className="text-gray-700 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  {analysis.cause}
                </p>
              </div>

              {/* Solutions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb size={18} className="text-yellow-600" />
                  Recommended Solutions
                </h3>
                <ul className="space-y-2">
                  {analysis.solutions.map((solution, index) => (
                    <li
                      key={index}
                      className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <span className="font-semibold text-yellow-700 flex-shrink-0 w-6">
                        {index + 1}.
                      </span>
                      <span className="text-gray-700">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Documentation */}
              {analysis.relatedDocs && analysis.relatedDocs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-600" />
                    Related Documentation
                  </h3>
                  <ul className="space-y-2">
                    {analysis.relatedDocs.map((doc, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 flex-shrink-0 mt-1">→</span>
                        <span className="text-gray-700">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
