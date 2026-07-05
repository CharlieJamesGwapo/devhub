'use client'

import React, { useState, useEffect } from 'react'
import {
  Play,
  Square,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
} from 'lucide-react'

interface Container {
  Id: string
  Name: string
  Image: string
  State: string
  Status: string
  Ports: Array<{
    PrivatePort: number
    PublicPort?: number
    Type: string
  }>
}

interface ContainerStats {
  memory_usage: string
  memory_limit: string
  cpu_percent: string
}

interface Image {
  Id: string
  RepoTags: string[]
  Size: number
  Created: number
}

const API_BASE = process.env.NEXT_PUBLIC_DOCKER_API || 'http://localhost:2375'

export default function DockerManager() {
  const [containers, setContainers] = useState<Container[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedContainer, setExpandedContainer] = useState<string | null>(null)
  const [containerLogs, setContainerLogs] = useState<Record<string, string>>({})
  const [containerStats, setContainerStats] = useState<Record<string, ContainerStats>>({})
  const [activeTab, setActiveTab] = useState<'containers' | 'images' | 'stats'>('containers')
  const [loadingStats, setLoadingStats] = useState<Set<string>>(new Set())

  // Fetch containers
  const fetchContainers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/docker/containers`)
      if (!response.ok) throw new Error('Failed to fetch containers')
      const data = await response.json()
      setContainers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch containers')
    } finally {
      setLoading(false)
    }
  }

  // Fetch images
  const fetchImages = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/docker/images`)
      if (!response.ok) throw new Error('Failed to fetch images')
      const data = await response.json()
      setImages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }

  // Fetch container logs
  const fetchLogs = async (containerId: string) => {
    try {
      const response = await fetch(`/api/docker/logs/${containerId}`)
      if (!response.ok) throw new Error('Failed to fetch logs')
      const data = await response.json()
      setContainerLogs((prev) => ({ ...prev, [containerId]: data.logs }))
    } catch (err) {
      setContainerLogs((prev) => ({
        ...prev,
        [containerId]: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }))
    }
  }

  // Fetch container stats
  const fetchStats = async (containerId: string) => {
    setLoadingStats((prev) => new Set([...prev, containerId]))
    try {
      const response = await fetch(`/api/docker/stats/${containerId}`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setContainerStats((prev) => ({ ...prev, [containerId]: data }))
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoadingStats((prev) => {
        const newSet = new Set(prev)
        newSet.delete(containerId)
        return newSet
      })
    }
  }

  // Start container
  const startContainer = async (containerId: string) => {
    try {
      const response = await fetch(`/api/docker/containers/${containerId}/start`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to start container')
      fetchContainers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start container')
    }
  }

  // Stop container
  const stopContainer = async (containerId: string) => {
    try {
      const response = await fetch(`/api/docker/containers/${containerId}/stop`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to stop container')
      fetchContainers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop container')
    }
  }

  // Toggle logs display
  const toggleLogs = (containerId: string) => {
    if (expandedContainer === containerId) {
      setExpandedContainer(null)
    } else {
      setExpandedContainer(containerId)
      if (!containerLogs[containerId]) {
        fetchLogs(containerId)
      }
    }
  }

  // Initial load
  useEffect(() => {
    fetchContainers()
    fetchImages()
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'stopped':
      case 'exited':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Docker Manager</h1>
          <p className="text-gray-600 mt-2">Manage containers, images, and resources</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('containers')
                fetchContainers()
              }}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'containers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Containers
            </button>
            <button
              onClick={() => {
                setActiveTab('images')
                fetchImages()
              }}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'images'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Containers Tab */}
        {activeTab === 'containers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Containers</h2>
              <button
                onClick={fetchContainers}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {loading && containers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600">Loading containers...</p>
              </div>
            ) : containers.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No containers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {containers.map((container) => (
                  <div key={container.Id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Container Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{container.Name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{container.Image}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(container.State)}`}>
                            {container.State}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {container.State === 'running' ? (
                            <button
                              onClick={() => stopContainer(container.Id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Stop container"
                            >
                              <Square className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => startContainer(container.Id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Start container"
                            >
                              <Play className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => toggleLogs(container.Id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            {expandedContainer === container.Id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Container Details */}
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Container ID</p>
                          <p className="font-mono text-sm text-gray-900">{container.Id.substring(0, 12)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="text-sm text-gray-900">{container.Status}</p>
                        </div>
                      </div>

                      {/* Ports */}
                      {container.Ports && container.Ports.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Ports</p>
                          <div className="flex flex-wrap gap-2">
                            {container.Ports.map((port, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                                {port.PublicPort ? `${port.PublicPort}→` : ''}{port.PrivatePort}/{port.Type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Logs Section */}
                    {expandedContainer === container.Id && (
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="mb-4 flex justify-between items-center">
                          <h4 className="font-semibold text-gray-900">Logs</h4>
                          <button
                            onClick={() => fetchLogs(container.Id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Refresh
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-100 overflow-x-auto max-h-64 overflow-y-auto">
                          {containerLogs[container.Id] ? (
                            containerLogs[container.Id]
                              .split('\n')
                              .slice(-50)
                              .map((line, idx) => (
                                <div key={idx}>{line}</div>
                              ))
                          ) : (
                            <div>Loading logs...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Images</h2>
              <button
                onClick={fetchImages}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {loading && images.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No images found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Repository</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tags</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {images.map((image) => (
                      <tr key={image.Id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-900">{image.Id.substring(0, 20)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {image.RepoTags && image.RepoTags.length > 0 ? (
                              image.RepoTags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">&lt;none&gt;</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatBytes(image.Size)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(image.Created * 1000).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Container Resource Usage</h2>
              <button
                onClick={() => {
                  containers.forEach((c) => {
                    if (c.State === 'running') {
                      fetchStats(c.Id)
                    }
                  })
                }}
                disabled={loadingStats.size > 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Stats
              </button>
            </div>

            {containers.filter((c) => c.State === 'running').length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No running containers</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Container</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Memory Usage</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Memory Limit</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">CPU %</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {containers
                      .filter((c) => c.State === 'running')
                      .map((container) => (
                        <tr key={container.Id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{container.Name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {containerStats[container.Id]?.memory_usage || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {containerStats[container.Id]?.memory_limit || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {containerStats[container.Id]?.cpu_percent || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => fetchStats(container.Id)}
                              disabled={loadingStats.has(container.Id)}
                              className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
                            >
                              {loadingStats.has(container.Id) ? 'Loading...' : 'Load Stats'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
