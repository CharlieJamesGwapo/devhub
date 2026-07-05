'use client'

import { useState } from 'react'
import { Copy, Check, AlertCircle, Zap } from 'lucide-react'

type TabType = 'format' | 'validate' | 'minify' | 'diff'

interface DiffResult {
  operation: string
  details: string
}

export default function JSONTools() {
  const [activeTab, setActiveTab] = useState<TabType>('format')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [diffInput2, setDiffInput2] = useState('')
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)

  const validateJSON = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  const getJSONError = (jsonString: string): string => {
    try {
      JSON.parse(jsonString)
      return ''
    } catch (err: any) {
      return err.message || 'Invalid JSON'
    }
  }

  const handleFormat = () => {
    setError('')
    setDiffResult(null)
    if (!input.trim()) {
      setError('Please enter JSON to format')
      setOutput('')
      return
    }
    if (!validateJSON(input)) {
      setError(`Invalid JSON: ${getJSONError(input)}`)
      setOutput('')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
    } catch (err: any) {
      setError(`Error formatting JSON: ${err.message}`)
      setOutput('')
    }
  }

  const handleValidate = () => {
    setError('')
    setDiffResult(null)
    if (!input.trim()) {
      setError('Please enter JSON to validate')
      setOutput('')
      return
    }
    const isValid = validateJSON(input)
    if (isValid) {
      const parsed = JSON.parse(input)
      const stats = {
        valid: true,
        size: input.length,
        lines: input.split('\n').length,
        keys: Object.keys(parsed).length,
        type: Array.isArray(parsed) ? 'Array' : typeof parsed
      }
      setOutput(JSON.stringify(stats, null, 2))
      setError('')
    } else {
      setError(`Invalid JSON: ${getJSONError(input)}`)
      setOutput('')
    }
  }

  const handleMinify = () => {
    setError('')
    setDiffResult(null)
    if (!input.trim()) {
      setError('Please enter JSON to minify')
      setOutput('')
      return
    }
    if (!validateJSON(input)) {
      setError(`Invalid JSON: ${getJSONError(input)}`)
      setOutput('')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      const reduction = Math.round(((input.length - minified.length) / input.length) * 100)
      setOutput(minified)
      setError(`Minified successfully. Size reduction: ${reduction}%`)
    } catch (err: any) {
      setError(`Error minifying JSON: ${err.message}`)
      setOutput('')
    }
  }

  const handleDiff = () => {
    setError('')
    if (!input.trim() || !diffInput2.trim()) {
      setError('Please enter both JSON inputs to compare')
      setDiffResult(null)
      return
    }
    if (!validateJSON(input) || !validateJSON(diffInput2)) {
      setError(`Invalid JSON: ${!validateJSON(input) ? getJSONError(input) : getJSONError(diffInput2)}`)
      setDiffResult(null)
      return
    }
    try {
      const obj1 = JSON.parse(input)
      const obj2 = JSON.parse(diffInput2)

      const getKeys = (obj: any): Set<string> => {
        if (typeof obj !== 'object' || obj === null) return new Set()
        return new Set(Object.keys(obj))
      }

      const keys1 = getKeys(obj1)
      const keys2 = getKeys(obj2)

      const added = Array.from(keys2).filter(k => !keys1.has(k))
      const removed = Array.from(keys1).filter(k => !keys2.has(k))
      const modified = Array.from(keys1).filter(k =>
        keys2.has(k) && JSON.stringify(obj1[k]) !== JSON.stringify(obj2[k])
      )

      setDiffResult({
        operation: 'diff',
        details: JSON.stringify({
          added: added.length > 0 ? added : 'None',
          removed: removed.length > 0 ? removed : 'None',
          modified: modified.length > 0 ? modified : 'None',
          summary: `${added.length} added, ${removed.length} removed, ${modified.length} modified`
        }, null, 2)
      })
      setError('')
    } catch (err: any) {
      setError(`Error comparing JSON: ${err.message}`)
      setDiffResult(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: { label: string; value: TabType }[] = [
    { label: 'Format', value: 'format' },
    { label: 'Validate', value: 'validate' },
    { label: 'Minify', value: 'minify' },
    { label: 'Diff', value: 'diff' }
  ]

  const handleAction = () => {
    switch (activeTab) {
      case 'format':
        handleFormat()
        break
      case 'validate':
        handleValidate()
        break
      case 'minify':
        handleMinify()
        break
      case 'diff':
        handleDiff()
        break
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">JSON Tools</h2>
        <p className="text-slate-600 mt-1">Format, validate, minify, and compare JSON</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {activeTab === 'diff' ? 'JSON Input 1' : 'JSON Input'}
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Paste ${activeTab === 'diff' ? 'first' : ''} JSON here...`}
            className="w-full h-32 p-3 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Second Input for Diff */}
        {activeTab === 'diff' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              JSON Input 2
            </label>
            <textarea
              value={diffInput2}
              onChange={e => setDiffInput2(e.target.value)}
              placeholder="Paste second JSON here..."
              className="w-full h-32 p-3 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Zap size={18} />
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} JSON
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message (for minify) */}
        {!error && activeTab === 'minify' && output && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex gap-3 items-start">
            <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-green-700">{error || 'JSON minified successfully'}</p>
          </div>
        )}

        {/* Output Section */}
        {(output || diffResult) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                {activeTab === 'diff' ? 'Comparison Results' : 'Output'}
              </label>
              <button
                onClick={() => copyToClipboard(diffResult?.details || output)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <textarea
              value={diffResult?.details || output}
              readOnly
              className="w-full h-64 p-3 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:outline-none resize-none overflow-auto"
            />
          </div>
        )}

        {/* Empty State */}
        {!output && !diffResult && !error && (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg">
            <p className="text-sm">
              {activeTab === 'diff'
                ? 'Enter two JSON inputs and click "Diff JSON" to compare'
                : `Paste JSON in the input field and click "${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} JSON" to get started`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
