'use client'

import { useState } from 'react'
import { X, Sparkles, Copy, Check, Loader } from 'lucide-react'

interface AICodeExplainerProps {
  code: string
  language: string
  title: string
  onClose: () => void
}

export default function AICodeExplainer({
  code,
  language,
  title,
  onClose
}: AICodeExplainerProps) {
  const [explanation, setExplanation] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const handleExplain = async () => {
    setLoading(true)
    setError('')
    setExplanation('')

    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to explain code')
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while explaining the code'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">AI Code Explainer</h2>
              <p className="text-blue-100 text-sm">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!explanation && !loading && !error && (
            <div className="text-center py-8 space-y-4">
              <p className="text-slate-600">
                Click the button below to get an AI explanation of this code snippet.
              </p>
              <button
                onClick={handleExplain}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                <Sparkles size={18} />
                Explain Code
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 space-y-4">
              <Loader size={32} className="animate-spin text-blue-600 mx-auto" />
              <p className="text-slate-600">Analyzing your code...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium mb-2">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={handleExplain}
                className="mt-3 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded text-sm transition-colors"
              >
                <Sparkles size={16} />
                Try Again
              </button>
            </div>
          )}

          {explanation && (
            <div className="space-y-3">
              <div className="prose prose-sm max-w-none">
                <div className="bg-slate-50 rounded-lg p-4 whitespace-pre-wrap text-sm text-slate-800 font-sans leading-relaxed">
                  {explanation}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy Explanation
                    </>
                  )}
                </button>
                <button
                  onClick={handleExplain}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors ml-auto"
                >
                  <Sparkles size={16} />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {explanation && !loading && !error && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 rounded-b-lg text-xs text-slate-500">
            Powered by Claude AI
          </div>
        )}
      </div>
    </div>
  )
}
