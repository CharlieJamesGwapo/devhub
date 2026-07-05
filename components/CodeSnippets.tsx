'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Heart, Trash2, Plus, Search, Filter, Share2, X, Edit2, Sparkles } from 'lucide-react'
import AICodeExplainer from './AICodeExplainer'

interface Snippet {
  id: string
  title: string
  code: string
  language: string
  tags: string[]
  folder: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

type ViewType = 'list' | 'edit' | 'new'

const LANGUAGE_OPTIONS = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'sql',
  'html',
  'css',
  'json',
  'yaml',
  'xml',
  'bash',
  'shell'
]

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-100 text-yellow-800',
  typescript: 'bg-blue-100 text-blue-800',
  python: 'bg-blue-100 text-blue-800',
  java: 'bg-red-100 text-red-800',
  cpp: 'bg-purple-100 text-purple-800',
  csharp: 'bg-purple-100 text-purple-800',
  go: 'bg-cyan-100 text-cyan-800',
  rust: 'bg-orange-100 text-orange-800',
  php: 'bg-indigo-100 text-indigo-800',
  ruby: 'bg-red-100 text-red-800',
  sql: 'bg-green-100 text-green-800',
  html: 'bg-orange-100 text-orange-800',
  css: 'bg-blue-100 text-blue-800',
  json: 'bg-amber-100 text-amber-800',
  yaml: 'bg-slate-100 text-slate-800',
  xml: 'bg-slate-100 text-slate-800',
  bash: 'bg-slate-700 text-white',
  shell: 'bg-slate-700 text-white'
}

export default function CodeSnippets() {
  const [view, setView] = useState<ViewType>('list')
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [filterFolder, setFilterFolder] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showFoldersFilter, setShowFoldersFilter] = useState(false)
  const [showTagsFilter, setShowTagsFilter] = useState(false)

  // AI Code Explainer state
  const [explainerId, setExplainerId] = useState<string | null>(null)
  const [explainerSnippet, setExplainerSnippet] = useState<Snippet | null>(null)

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'javascript',
    tags: '',
    folder: 'General'
  })

  // Load snippets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('codeSnippets')
    if (stored) {
      try {
        setSnippets(JSON.parse(stored))
      } catch {
        // If parsing fails, initialize with empty array
      }
    }
  }, [])

  // Save snippets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('codeSnippets', JSON.stringify(snippets))
  }, [snippets])

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      language: 'javascript',
      tags: '',
      folder: 'General'
    })
    setEditingId(null)
  }

  const handleSaveSnippet = () => {
    if (!formData.title.trim() || !formData.code.trim()) {
      alert('Please enter both title and code')
      return
    }

    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (editingId) {
      // Update existing snippet
      setSnippets(
        snippets.map(s =>
          s.id === editingId
            ? {
                ...s,
                title: formData.title,
                code: formData.code,
                language: formData.language,
                tags,
                folder: formData.folder,
                updatedAt: new Date().toISOString()
              }
            : s
        )
      )
    } else {
      // Create new snippet
      const newSnippet: Snippet = {
        id: Date.now().toString(),
        title: formData.title,
        code: formData.code,
        language: formData.language,
        tags,
        folder: formData.folder,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setSnippets([newSnippet, ...snippets])
    }

    resetForm()
    setView('list')
  }

  const handleDeleteSnippet = (id: string) => {
    if (confirm('Are you sure you want to delete this snippet?')) {
      setSnippets(snippets.filter(s => s.id !== id))
    }
  }

  const handleToggleFavorite = (id: string) => {
    setSnippets(
      snippets.map(s => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    )
  }

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingId(snippet.id)
    setFormData({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags.join(', '),
      folder: snippet.folder
    })
    setView('edit')
  }

  const handleCopyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleShareSnippet = (snippet: Snippet) => {
    const shareText = `${snippet.title}\n\nLanguage: ${snippet.language}\n\n${snippet.code}`
    navigator.clipboard.writeText(shareText)
    setCopied(`share-${snippet.id}`)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleExplainSnippet = (snippet: Snippet) => {
    setExplainerSnippet(snippet)
    setExplainerId(snippet.id)
  }

  const handleCloseExplainer = () => {
    setExplainerId(null)
    setExplainerSnippet(null)
  }

  // Filter snippets based on search and filters
  const filteredSnippets = snippets.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !filterTag || s.tags.includes(filterTag)
    const matchesFolder = !filterFolder || s.folder === filterFolder

    return matchesSearch && matchesTag && matchesFolder
  })

  // Get unique folders and tags
  const folders = Array.from(new Set(snippets.map(s => s.folder)))
  const allTags = Array.from(new Set(snippets.flatMap(s => s.tags)))

  // Sort snippets: favorites first, then by date
  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  // View: New/Edit Snippet
  if (view === 'new' || view === 'edit') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {editingId ? 'Edit Snippet' : 'New Snippet'}
            </h2>
            <p className="text-slate-600 mt-1">
              {editingId ? 'Update your code snippet' : 'Create a new code snippet'}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setView('list')
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., React useEffect Hook Example"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Language Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LANGUAGE_OPTIONS.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Folder Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Folder
              </label>
              <select
                value={formData.folder}
                onChange={e => setFormData({ ...formData, folder: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {folders.length > 0 ? (
                  <>
                    {folders.map(folder => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                    <option value="">Create New Folder</option>
                  </>
                ) : (
                  <option value="General">General</option>
                )}
              </select>
              {formData.folder === '' && (
                <input
                  type="text"
                  placeholder="Enter new folder name"
                  onChange={e => setFormData({ ...formData, folder: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., react, hooks, example"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Code Editor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Code
            </label>
            <textarea
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              placeholder="Paste your code here..."
              className="w-full h-64 p-3 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveSnippet}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {editingId ? 'Update Snippet' : 'Save Snippet'}
            </button>
            <button
              onClick={() => {
                resetForm()
                setView('list')
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // View: List View
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Code Snippets</h2>
          <p className="text-slate-600 mt-1">Save and manage your code snippets</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setView('new')
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Snippet
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search snippets..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFoldersFilter(!showFoldersFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  filterFolder
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={16} />
                Folder
              </button>
              {showFoldersFilter && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setFilterFolder(null)
                      setShowFoldersFilter(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    All Folders
                  </button>
                  {folders.map(folder => (
                    <button
                      key={folder}
                      onClick={() => {
                        setFilterFolder(folder)
                        setShowFoldersFilter(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        filterFolder === folder
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowTagsFilter(!showTagsFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  filterTag
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={16} />
                Tag
              </button>
              {showTagsFilter && (
                <div className="absolute right-0 mt-1 max-h-60 w-48 bg-white border border-slate-300 rounded-lg shadow-lg z-10 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFilterTag(null)
                      setShowTagsFilter(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-200"
                  >
                    All Tags
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setFilterTag(tag)
                        setShowTagsFilter(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        filterTag === tag
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filterFolder || filterTag) && (
          <div className="flex gap-2 items-center">
            {filterFolder && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                Folder: {filterFolder}
                <button
                  onClick={() => setFilterFolder(null)}
                  className="hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {filterTag && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                Tag: {filterTag}
                <button
                  onClick={() => setFilterTag(null)}
                  className="hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Snippets List */}
      {sortedSnippets.length > 0 ? (
        <div className="space-y-4">
          {sortedSnippets.map(snippet => (
            <div
              key={snippet.id}
              className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="bg-slate-50 p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {snippet.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        LANGUAGE_COLORS[snippet.language] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {snippet.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">
                      {snippet.folder}
                    </span>
                    {snippet.tags.length > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <div className="flex gap-1 flex-wrap">
                          {snippet.tags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                setFilterTag(tag)
                                setView('list')
                              }}
                              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded transition-colors"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(snippet.id)}
                    className={`p-2 rounded transition-colors ${
                      snippet.isFavorite
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={snippet.isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>

              {/* Code Block */}
              <div className="bg-slate-900 text-slate-100 p-4 font-mono text-sm overflow-x-auto">
                <pre>{snippet.code}</pre>
              </div>

              {/* Actions */}
              <div className="bg-slate-50 p-3 flex gap-2 justify-end border-t border-slate-200">
                <button
                  onClick={() => handleExplainSnippet(snippet)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Explain code with AI"
                >
                  <Sparkles size={16} />
                  Explain
                </button>
                <button
                  onClick={() => handleShareSnippet(snippet)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  title="Copy to clipboard with metadata"
                >
                  {copied === `share-${snippet.id}` ? (
                    <>
                      <Check size={16} />
                      Shared!
                    </>
                  ) : (
                    <>
                      <Share2 size={16} />
                      Share
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleCopyToClipboard(snippet.code, snippet.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  title="Copy code to clipboard"
                >
                  {copied === snippet.id ? (
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
                <button
                  onClick={() => handleEditSnippet(snippet)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSnippet(snippet.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm">
            {searchTerm || filterTag || filterFolder
              ? 'No snippets match your filters'
              : 'No snippets yet. Click "New Snippet" to create one!'}
          </p>
        </div>
      )}

      {/* Stats */}
      {snippets.length > 0 && (
        <div className="pt-4 border-t border-slate-200 flex gap-4 text-sm text-slate-600">
          <div>
            <span className="font-semibold text-slate-900">{snippets.length}</span> total
            snippets
          </div>
          <div>
            <span className="font-semibold text-slate-900">
              {snippets.filter(s => s.isFavorite).length}
            </span>{' '}
            favorites
          </div>
          <div>
            <span className="font-semibold text-slate-900">{folders.length}</span> folders
          </div>
        </div>
      )}

      {/* AI Code Explainer Modal */}
      {explainerId && explainerSnippet && (
        <AICodeExplainer
          code={explainerSnippet.code}
          language={explainerSnippet.language}
          title={explainerSnippet.title}
          onClose={handleCloseExplainer}
        />
      )}
    </div>
  )
}
