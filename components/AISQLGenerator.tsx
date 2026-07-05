'use client'
import { useState } from 'react'
import { Wand2, Copy, AlertCircle, Check, Loader } from 'lucide-react'

interface AISQLGeneratorProps {
  onQueryGenerated: (query: string) => void
  isLoading?: boolean
}

export default function AISQLGenerator({ onQueryGenerated, isLoading = false }: AISQLGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [schema, setSchema] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedQuery, setGeneratedQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSchema, setShowSchema] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateSQL = async () => {
    if (!prompt.trim()) {
      setError('Please enter a natural language description')
      return
    }

    setGenerating(true)
    setError(null)
    setSuccess(null)
    setGeneratedQuery('')

    try {
      const response = await fetch('/api/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          schema: schema.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate SQL')
        return
      }

      setGeneratedQuery(data.query)
      onQueryGenerated(data.query)
      setSuccess('SQL generated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const copyQuery = () => {
    if (generatedQuery) {
      navigator.clipboard.writeText(generatedQuery)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Wand2 size={18} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900">AI SQL Generator</h3>
      </div>

      {/* Main Input Section */}
      <div className="space-y-3">
        {/* Natural Language Prompt */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Describe what you want to query
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Get all active users with more than 10 projects who registered in the last 30 days"
            className="w-full h-20 p-2 border border-blue-300 rounded-lg font-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
            disabled={generating || isLoading}
          />
        </div>

        {/* Schema Section (Collapsible) */}
        <div>
          <button
            onClick={() => setShowSchema(!showSchema)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 mb-1"
          >
            {showSchema ? '▼' : '▶'} Optional: Database Schema
          </button>
          {showSchema && (
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="e.g., Tables: users (id, email, created_at, status), projects (id, user_id, name)"
              className="w-full h-16 p-2 border border-blue-300 rounded-lg font-sm text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
              disabled={generating || isLoading}
            />
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={generateSQL}
          disabled={generating || isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {generating ? (
            <>
              <Loader size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Generate SQL
            </>
          )}
        </button>

        {/* Messages */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-xs text-red-700">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex gap-2 text-xs text-green-700">
            <Check size={14} className="flex-shrink-0 mt-0.5" />
            {success}
          </div>
        )}

        {/* Generated Query Display */}
        {generatedQuery && (
          <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Generated SQL</span>
              <button
                onClick={copyQuery}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                <Copy size={12} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 font-mono text-xs text-slate-700 overflow-x-auto max-h-32 bg-white">
              {generatedQuery}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
