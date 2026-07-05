'use client'

import React, { useState } from 'react'
import { FileText, Copy, Check, RotateCw, Download } from 'lucide-react'

interface RequestData {
  method: string
  url: string
  headers: Record<string, string>
  body: string
  requestName: string
}

interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
}

interface AIDocWriterProps {
  request: RequestData
  response?: ResponseData | null
}

// Simple markdown to HTML converter
const markdownToHtml = (markdown: string): string => {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-900">$1</h3>')
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-5 mb-3 text-slate-900">$1</h2>')
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-slate-900">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
  html = html.replace(/__(.*?)__/g, '<strong class="font-semibold text-slate-900">$1</strong>')
  html = html.replace(/_(.*?)_/g, '<em class="italic text-slate-700">$1</em>')

  // Code blocks
  html = html.replace(/```(.*?)\n([\s\S]*?)```/g,
    '<div class="bg-slate-900 text-slate-100 p-3 rounded my-2 overflow-x-auto"><pre class="font-mono text-sm">$2</pre></div>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-red-600 px-2 py-0.5 rounded font-mono text-sm">$1</code>')

  // Lists
  html = html.replace(/^\s*[-*] (.*?)$/gm, '<li class="ml-4 text-slate-700">$1</li>')
  html = html.replace(/(<li.*?<\/li>\n?)+/g, '<ul class="list-disc my-2">$&</ul>')

  // Line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p class="my-2 text-slate-700">')
  html = html.replace(/\n/g, '<br/>')
  html = '<p class="my-2 text-slate-700">' + html + '</p>'

  return html
}

export default function AIDocWriter({ request, response }: AIDocWriterProps) {
  const [documentation, setDocumentation] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const generateDocumentation = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
          response: response,
          requestName: request.requestName,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to generate documentation')
      }

      const data = await res.json()
      setDocumentation(data.documentation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(documentation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadDocumentation = () => {
    const element = document.createElement('a')
    const file = new Blob([documentation], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${request.requestName || 'api-docs'}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="bg-white rounded-lg shadow space-y-4">
      <div className="border-b border-slate-200 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900">API Documentation Generator</h3>
          </div>
          <button
            onClick={generateDocumentation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <RotateCw size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RotateCw size={16} />
                Generate Docs
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {documentation && (
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className={`px-3 py-1 rounded text-sm transition ${
                  showPreview
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className={`px-3 py-1 rounded text-sm transition ${
                  !showPreview
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Raw Markdown
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm transition"
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy
                  </>
                )}
              </button>
              <button
                onClick={downloadDocumentation}
                className="flex items-center gap-2 px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm transition"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>

          {showPreview ? (
            <div className="bg-slate-50 rounded p-4 max-h-96 overflow-y-auto prose prose-sm max-w-none">
              <div
                className="prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-red-600"
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(documentation),
                }}
              />
            </div>
          ) : (
            <div className="bg-slate-900 text-slate-100 rounded p-4 max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words">
              {documentation}
            </div>
          )}
        </div>
      )}

      {!documentation && !loading && (
        <div className="px-6 pb-6 text-center py-8">
          <FileText size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Click "Generate Docs" to create API documentation</p>
        </div>
      )}
    </div>
  )
}
