'use client'

import { useState, useRef } from 'react'
import { Copy, Loader, AlertCircle, Check } from 'lucide-react'

interface CommitMessage {
  title: string
  body: string
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore'
}

interface AICommitGeneratorProps {
  onSelectMessage?: (message: CommitMessage) => void
  placeholder?: string
}

export default function AICommitGenerator({
  onSelectMessage,
  placeholder = 'Paste your git diff here...',
}: AICommitGeneratorProps) {
  const [diff, setDiff] = useState('')
  const [context, setContext] = useState('')
  const [style, setStyle] = useState<'conventional' | 'descriptive' | 'concise'>(
    'conventional'
  )
  const [messages, setMessages] = useState<CommitMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const diffInputRef = useRef<HTMLTextAreaElement>(null)

  const generateMessages = async () => {
    if (!diff.trim()) {
      setError('Please provide a git diff')
      return
    }

    setLoading(true)
    setError(null)
    setMessages([])

    try {
      const response = await fetch('/api/ai/generate-commit-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diff: diff.trim(),
          context: context.trim() || undefined,
          style,
          maxMessages: 3,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate commit messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error generating commit messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (message: CommitMessage, index: number) => {
    const fullMessage = `${message.title}${message.body ? '\n\n' + message.body : ''}`
    navigator.clipboard.writeText(fullMessage)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const formatCommitType = (type: string): string => {
    const typeMap: Record<string, string> = {
      feat: 'Feature',
      fix: 'Bug Fix',
      docs: 'Documentation',
      style: 'Style',
      refactor: 'Refactor',
      perf: 'Performance',
      test: 'Test',
      chore: 'Chore',
    }
    return typeMap[type] || type
  }

  const getTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      feat: 'bg-green-100 text-green-800',
      fix: 'bg-red-100 text-red-800',
      docs: 'bg-blue-100 text-blue-800',
      style: 'bg-purple-100 text-purple-800',
      refactor: 'bg-yellow-100 text-yellow-800',
      perf: 'bg-orange-100 text-orange-800',
      test: 'bg-pink-100 text-pink-800',
      chore: 'bg-gray-100 text-gray-800',
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Commit Message Generator</h2>
        <p className="text-gray-600 text-sm mt-1">
          Paste a git diff and let AI generate meaningful commit messages
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        {/* Diff Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Git Diff
          </label>
          <textarea
            ref={diffInputRef}
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
            placeholder={placeholder}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Use `git diff` or `git diff --staged` to get the diff
          </p>
        </div>

        {/* Context Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context (Optional)
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., JIRA ticket, feature name, or additional context"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commit Style
          </label>
          <div className="flex gap-3">
            {(['conventional', 'descriptive', 'concise'] as const).map((s) => (
              <label
                key={s}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="style"
                  value={s}
                  checked={style === s}
                  onChange={(e) => setStyle(e.target.value as typeof style)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateMessages}
          disabled={loading || !diff.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Commit Messages'
          )}
        </button>
      </div>

      {/* Results Section */}
      {messages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Generated Suggestions</h3>
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${getTypeColor(message.type)}`}
                      >
                        {formatCommitType(message.type)}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="font-mono text-sm font-medium text-gray-900 mb-2 break-words">
                      {message.title}
                    </p>

                    {/* Body */}
                    {message.body && (
                      <p className="text-sm text-gray-600 mb-3 break-words">
                        {message.body}
                      </p>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(message, index)}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Select Button */}
                {onSelectMessage && (
                  <button
                    onClick={() => onSelectMessage(message)}
                    className="w-full mt-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded transition-colors"
                  >
                    Use This Message
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && messages.length === 0 && diff.trim() && (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Generate Commit Messages" to generate suggestions</p>
        </div>
      )}
    </div>
  )
}
