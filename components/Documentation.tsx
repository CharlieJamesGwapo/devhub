'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Save,
  Edit2,
  Eye,
  Clock,
  Trash2,
  ChevronDown,
  BookOpen,
  Home,
  Copy,
  MoreVertical,
  Check,
  X,
} from 'lucide-react'

interface WikiPage {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  versions: PageVersion[]
  slug: string
}

interface PageVersion {
  versionId: string
  content: string
  timestamp: Date
  author: string
  changeDescription: string
}

interface SearchResult {
  id: string
  title: string
  excerpt: string
  matchCount: number
}

export default function Documentation() {
  const [pages, setPages] = useState<WikiPage[]>([])
  const [currentPage, setCurrentPage] = useState<WikiPage | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [changeDescription, setChangeDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewPageForm, setShowNewPageForm] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  // Load pages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wiki_pages')
    if (stored) {
      const parsedPages = JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        versions: p.versions.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        })),
      }))
      setPages(parsedPages)
      if (parsedPages.length > 0) {
        setCurrentPage(parsedPages[0])
        setEditContent(parsedPages[0].content)
        setEditTitle(parsedPages[0].title)
      }
    }
  }, [])

  // Save pages to localStorage
  useEffect(() => {
    if (pages.length > 0) {
      localStorage.setItem('wiki_pages', JSON.stringify(pages))
    }
  }, [pages])

  // Generate URL slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
  }

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim().length === 0) {
      setSearchResults([])
      return
    }

    const results = pages
      .map((page) => {
        const contentMatches = (page.content.match(new RegExp(query, 'gi')) || [])
          .length
        const titleMatch = page.title.toLowerCase().includes(query.toLowerCase())
          ? 2
          : 0
        const matchCount = contentMatches + titleMatch

        if (matchCount > 0) {
          const contentIndex = page.content.toLowerCase().indexOf(query.toLowerCase())
          const start = Math.max(0, contentIndex - 50)
          const end = Math.min(page.content.length, contentIndex + 100)
          const excerpt = page.content.substring(start, end).trim()

          return {
            id: page.id,
            title: page.title,
            excerpt: `...${excerpt}...`,
            matchCount,
          }
        }
        return null
      })
      .filter((r): r is SearchResult => r !== null)
      .sort((a, b) => b.matchCount - a.matchCount)

    setSearchResults(results)
  }, [pages])

  // Create new page
  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      setError('Page title cannot be empty')
      return
    }

    const slug = generateSlug(newPageTitle)
    if (pages.some((p) => p.slug === slug)) {
      setError('A page with this title already exists')
      return
    }

    const newPage: WikiPage = {
      id: `page_${Date.now()}`,
      title: newPageTitle,
      content: '# ' + newPageTitle + '\n\nStart typing here...',
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: [
        {
          versionId: `v_${Date.now()}`,
          content: '# ' + newPageTitle + '\n\nStart typing here...',
          timestamp: new Date(),
          author: 'System',
          changeDescription: 'Initial creation',
        },
      ],
      slug,
    }

    setPages([...pages, newPage])
    setCurrentPage(newPage)
    setEditContent(newPage.content)
    setEditTitle(newPage.title)
    setShowNewPageForm(false)
    setNewPageTitle('')
    setIsEditing(true)
    setError(null)
  }

  // Save page changes
  const handleSavePage = async () => {
    if (!currentPage) return

    setIsLoading(true)
    try {
      const updatedPages = pages.map((p) => {
        if (p.id === currentPage.id) {
          const newVersion: PageVersion = {
            versionId: `v_${Date.now()}`,
            content: editContent,
            timestamp: new Date(),
            author: 'User',
            changeDescription: changeDescription || 'Updated content',
          }

          return {
            ...p,
            title: editTitle,
            content: editContent,
            updatedAt: new Date(),
            versions: [...p.versions, newVersion],
          }
        }
        return p
      })

      setPages(updatedPages)
      const updated = updatedPages.find((p) => p.id === currentPage.id)
      if (updated) {
        setCurrentPage(updated)
      }
      setChangeDescription('')
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError('Failed to save page')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete page
  const handleDeletePage = (pageId: string) => {
    const updatedPages = pages.filter((p) => p.id !== pageId)
    setPages(updatedPages)
    if (currentPage?.id === pageId) {
      setCurrentPage(updatedPages[0] || null)
    }
    setError(null)
  }

  // Restore version
  const handleRestoreVersion = (versionId: string) => {
    if (!currentPage) return

    const version = currentPage.versions.find((v) => v.versionId === versionId)
    if (!version) return

    setEditContent(version.content)
    setChangeDescription(`Restored from version ${versionId.slice(-8)}`)
    setShowVersionHistory(false)
  }

  // View specific version
  const handleViewVersion = (versionId: string) => {
    if (!currentPage) return

    const version = currentPage.versions.find((v) => v.versionId === versionId)
    if (version) {
      setSelectedVersionId(versionId)
    }
  }

  // Copy to clipboard
  const handleCopyContent = () => {
    navigator.clipboard.writeText(currentPage?.content || '')
    const timer = setTimeout(() => {
      setError(null)
    }, 2000)
    return () => clearTimeout(timer)
  }

  const currentVersion =
    selectedVersionId && currentPage
      ? currentPage.versions.find((v) => v.versionId === selectedVersionId)
      : null

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-800 border-r border-gray-700 overflow-hidden transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="flex items-center gap-2 font-bold text-lg mb-4">
            <BookOpen size={20} />
            Wiki
          </h1>

          <button
            onClick={() => setShowNewPageForm(!showNewPageForm)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            New Page
          </button>
        </div>

        {/* New Page Form */}
        {showNewPageForm && (
          <div className="p-3 border-b border-gray-700 bg-gray-750">
            <input
              type="text"
              placeholder="Page title..."
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCreatePage()
              }}
              className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded text-sm mb-2 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreatePage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewPageForm(false)
                  setNewPageTitle('')
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-2 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto p-2">
          {searchResults.length > 0 && searchQuery ? (
            <div>
              <p className="text-xs text-gray-400 px-2 py-2 font-semibold">
                Search Results
              </p>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    const page = pages.find((p) => p.id === result.id)
                    if (page) {
                      setCurrentPage(page)
                      setEditContent(page.content)
                      setEditTitle(page.title)
                      setIsEditing(false)
                      setSearchQuery('')
                      setSearchResults([])
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 mb-1 transition-colors"
                >
                  <p className="text-sm font-medium">{result.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {result.excerpt}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 px-2 py-2 font-semibold">
                All Pages
              </p>
              {pages.length === 0 ? (
                <p className="text-xs text-gray-500 px-3 py-4">
                  No pages yet. Create one to get started!
                </p>
              ) : (
                pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      setCurrentPage(page)
                      setEditContent(page.content)
                      setEditTitle(page.title)
                      setIsEditing(false)
                      setSelectedVersionId(null)
                    }}
                    className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                      currentPage?.id === page.id
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{page.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-gray-700 bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <ChevronDown
                size={20}
                className={`transform transition-transform ${
                  sidebarOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            {currentPage ? (
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h2 className="text-2xl font-bold">{currentPage.title}</h2>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {new Date(currentPage.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <Home size={20} />
                <span>Welcome to Documentation</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            {currentPage && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSavePage}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded transition-colors font-medium"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditContent(currentPage.content)
                        setEditTitle(currentPage.title)
                        setChangeDescription('')
                      }}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors font-medium"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setEditContent(currentPage.content)
                        setEditTitle(currentPage.title)
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowVersionHistory(!showVersionHistory)}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors font-medium"
                    >
                      <Clock size={16} />
                      History
                    </button>
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                          <button
                            onClick={() => {
                              handleDeletePage(currentPage.id)
                              setShowMenu(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                            Delete Page
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-6 py-3">
            {error}
          </div>
        )}

        {/* Content Area */}
        {currentPage ? (
          <div className="flex-1 overflow-hidden flex">
            {/* Editor/Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {isEditing ? (
                <div className="flex-1 flex flex-col overflow-hidden p-6">
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Change Description (optional)
                    </label>
                    <input
                      type="text"
                      value={changeDescription}
                      onChange={(e) => setChangeDescription(e.target.value)}
                      placeholder="What changed?"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Write your markdown here..."
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-6">
                  <div className="prose prose-invert max-w-none">
                    <MarkdownRenderer content={editContent} />
                  </div>
                </div>
              )}
            </div>

            {/* Version History Sidebar */}
            {showVersionHistory && (
              <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-bold flex items-center gap-2">
                    <Clock size={16} />
                    Version History
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentPage.versions.length} versions
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {currentPage.versions
                    .slice()
                    .reverse()
                    .map((version, index) => (
                      <div
                        key={version.versionId}
                        className={`p-3 border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                          selectedVersionId === version.versionId
                            ? 'bg-gray-700'
                            : ''
                        }`}
                      >
                        <p className="text-xs font-mono text-gray-400">
                          v{currentPage.versions.length - index}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {version.changeDescription}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(version.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          by {version.author}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleViewVersion(version.versionId)}
                            className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                          >
                            <Eye size={12} className="inline mr-1" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleRestoreVersion(version.versionId)
                            }
                            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                          >
                            <RotateCcw size={12} className="inline mr-1" />
                            Restore
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Version Viewer */}
            {selectedVersionId && currentVersion && (
              <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <p className="text-sm font-medium">
                    {currentVersion.changeDescription}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(currentVersion.timestamp).toLocaleString()}
                  </p>
                  <button
                    onClick={() => setSelectedVersionId(null)}
                    className="w-full mt-3 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                  >
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="prose prose-invert max-w-none text-sm">
                    <MarkdownRenderer content={currentVersion.content} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold mb-2">Welcome to Documentation</h3>
              <p className="text-gray-400">
                Create a new page to get started with your wiki
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Markdown Renderer Component
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements = []
  let codeBlock = false
  let codeContent = ''
  let codeLanguage = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      if (codeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-gray-900 border border-gray-700 p-4 rounded overflow-x-auto my-3"
          >
            <code className="text-sm font-mono text-green-400">{codeContent}</code>
          </pre>
        )
        codeContent = ''
        codeLanguage = ''
        codeBlock = false
      } else {
        codeBlock = true
        codeLanguage = line.slice(3).trim()
      }
      continue
    }

    if (codeBlock) {
      codeContent += line + '\n'
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-3xl font-bold mt-6 mb-3">
          {line.slice(2)}
        </h1>
      )
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl font-bold mt-5 mb-3">
          {line.slice(3)}
        </h2>
      )
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl font-bold mt-4 mb-2">
          {line.slice(4)}
        </h3>
      )
      continue
    }

    // Lists
    if (line.startsWith('- ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-4 mb-1">
          {formatInlineMarkdown(line.slice(2))}
        </li>
      )
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-gray-700" />)
      continue
    }

    // Paragraphs
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="mb-3 leading-relaxed">
          {formatInlineMarkdown(line)}
        </p>
      )
      continue
    }

    // Empty lines
    if (elements.length > 0 && !line.trim()) {
      elements.push(<div key={`space-${i}`} className="my-2" />)
    }
  }

  return <div className="text-gray-100">{elements}</div>
}

// Inline Markdown Formatter
function formatInlineMarkdown(text: string) {
  const parts: (string | JSX.Element)[] = []
  let remaining = text
  let key = 0

  const patterns = [
    {
      pattern: /\*\*(.*?)\*\*/g,
      replace: (match: string) => (
        <strong key={key++} className="font-bold">
          {match.slice(2, -2)}
        </strong>
      ),
    },
    {
      pattern: /\*(.*?)\*/g,
      replace: (match: string) => (
        <em key={key++} className="italic">
          {match.slice(1, -1)}
        </em>
      ),
    },
    {
      pattern: /`(.*?)`/g,
      replace: (match: string) => (
        <code key={key++} className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
          {match.slice(1, -1)}
        </code>
      ),
    },
    {
      pattern: /\[(.*?)\]\((.*?)\)/g,
      replace: (match: string) => {
        const linkMatch = match.match(/\[(.*?)\]\((.*?)\)/)
        if (linkMatch) {
          return (
            <a
              key={key++}
              href={linkMatch[2]}
              className="text-blue-400 hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkMatch[1]}
            </a>
          )
        }
        return match
      },
    },
  ]

  patterns.forEach((pattern) => {
    remaining = remaining.replace(pattern.pattern, (match) => {
      parts.push(pattern.replace(match))
      return '\0'
    })
  })

  return (
    <>
      {remaining.split('\0').map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length && parts[i]}
        </span>
      ))}
    </>
  )
}

// Icon component not in lucide-react
function RotateCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}
