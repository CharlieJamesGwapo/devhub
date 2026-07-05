'use client'

import React, { useState, useEffect } from 'react'
import {
  RotateCw,
  Save,
  Trash2,
  Plus,
  FolderPlus,
  Settings,
  Copy,
  Check,
} from 'lucide-react'
import AIDocWriter from './AIDocWriter'

interface RequestData {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers: Record<string, string>
  body: string
  collectionId: string
  createdAt: number
}

interface Collection {
  id: string
  name: string
  createdAt: number
}

interface Environment {
  id: string
  name: string
  variables: Record<string, string>
  active: boolean
}

interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  PATCH: 'bg-purple-100 text-purple-700',
  DELETE: 'bg-red-100 text-red-700',
}

export default function APITester() {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Record<string, string>>({})
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestName, setRequestName] = useState('')
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [requests, setRequests] = useState<RequestData[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [activeEnvironment, setActiveEnvironment] = useState<Environment | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newEnvName, setNewEnvName] = useState('')
  const [showNewEnv, setShowNewEnv] = useState(false)
  const [envVarKey, setEnvVarKey] = useState('')
  const [envVarValue, setEnvVarValue] = useState('')
  const [headerKey, setHeaderKey] = useState('')
  const [headerValue, setHeaderValue] = useState('')
  const [copied, setCopied] = useState(false)
  const [showDocGenerator, setShowDocGenerator] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCollections = localStorage.getItem('api_tester_collections')
    const savedRequests = localStorage.getItem('api_tester_requests')
    const savedEnvironments = localStorage.getItem('api_tester_environments')

    if (savedCollections) setCollections(JSON.parse(savedCollections))
    if (savedRequests) setRequests(JSON.parse(savedRequests))
    if (savedEnvironments) {
      const envs = JSON.parse(savedEnvironments)
      setEnvironments(envs)
      const active = envs.find((e: Environment) => e.active)
      if (active) setActiveEnvironment(active)
    }
  }, [])

  // Save collections to localStorage
  useEffect(() => {
    localStorage.setItem('api_tester_collections', JSON.stringify(collections))
  }, [collections])

  // Save requests to localStorage
  useEffect(() => {
    localStorage.setItem('api_tester_requests', JSON.stringify(requests))
  }, [requests])

  // Save environments to localStorage
  useEffect(() => {
    localStorage.setItem('api_tester_environments', JSON.stringify(environments))
  }, [environments])

  const substituteEnvironmentVariables = (text: string): string => {
    if (!activeEnvironment) return text
    let result = text
    Object.entries(activeEnvironment.variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value)
    })
    return result
  }

  const sendRequest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const substitutedUrl = substituteEnvironmentVariables(url)
      const substitutedHeaders = Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [k, substituteEnvironmentVariables(v)])
      )
      const substitutedBody = substituteEnvironmentVariables(body)

      const startTime = performance.now()

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...substitutedHeaders,
        },
      }

      if (method !== 'GET' && substitutedBody) {
        options.body = substitutedBody
      }

      const res = await fetch(substitutedUrl, options)
      const responseBody = await res.text()
      const endTime = performance.now()

      const headerObj: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        headerObj[key] = value
      })

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: headerObj,
        body: responseBody,
        time: Math.round(endTime - startTime),
        size: new Blob([responseBody]).size,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  const saveRequest = () => {
    if (!requestName.trim() || !selectedCollectionId) {
      setError('Please enter a request name and select a collection')
      return
    }

    const newRequest: RequestData = {
      id: `req_${Date.now()}`,
      name: requestName,
      method,
      url,
      headers,
      body,
      collectionId: selectedCollectionId,
      createdAt: Date.now(),
    }

    setRequests([...requests, newRequest])
    setRequestName('')
    setShowSaveModal(false)
  }

  const createCollection = () => {
    if (!newCollectionName.trim()) return

    const newCollection: Collection = {
      id: `col_${Date.now()}`,
      name: newCollectionName,
      createdAt: Date.now(),
    }

    setCollections([...collections, newCollection])
    setSelectedCollectionId(newCollection.id)
    setNewCollectionName('')
    setShowNewCollection(false)
  }

  const createEnvironment = () => {
    if (!newEnvName.trim()) return

    const newEnv: Environment = {
      id: `env_${Date.now()}`,
      name: newEnvName,
      variables: {},
      active: false,
    }

    setEnvironments([...environments, newEnv])
    setNewEnvName('')
    setShowNewEnv(false)
  }

  const addEnvironmentVariable = (envId: string) => {
    if (!envVarKey.trim() || !envVarValue.trim()) return

    setEnvironments(
      environments.map((env) =>
        env.id === envId
          ? { ...env, variables: { ...env.variables, [envVarKey]: envVarValue } }
          : env
      )
    )
    setEnvVarKey('')
    setEnvVarValue('')
  }

  const removeEnvironmentVariable = (envId: string, key: string) => {
    setEnvironments(
      environments.map((env) =>
        env.id === envId
          ? {
              ...env,
              variables: Object.fromEntries(
                Object.entries(env.variables).filter(([k]) => k !== key)
              ),
            }
          : env
      )
    )
  }

  const setActiveEnv = (envId: string | null) => {
    setEnvironments(
      environments.map((env) => ({
        ...env,
        active: env.id === envId,
      }))
    )
    const active = envId ? environments.find((e) => e.id === envId) : null
    setActiveEnvironment(active || null)
  }

  const addHeader = () => {
    if (!headerKey.trim()) return
    setHeaders({ ...headers, [headerKey]: headerValue })
    setHeaderKey('')
    setHeaderValue('')
  }

  const removeHeader = (key: string) => {
    setHeaders(Object.fromEntries(Object.entries(headers).filter(([k]) => k !== key)))
  }

  const loadRequest = (request: RequestData) => {
    setMethod(request.method)
    setUrl(request.url)
    setHeaders(request.headers)
    setBody(request.body)
    setRequestName(request.name)
  }

  const deleteRequest = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id))
  }

  const copyResponseToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Sidebar - Collections & Requests */}
      <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Collections</h3>
            <button
              onClick={() => setShowNewCollection(true)}
              className="p-1 hover:bg-slate-100 rounded transition"
              title="New Collection"
            >
              <FolderPlus size={18} className="text-slate-600" />
            </button>
          </div>

          {showNewCollection && (
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={createCollection}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewCollection(false)
                    setNewCollectionName('')
                  }}
                  className="flex-1 px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {collections.length === 0 ? (
              <p className="text-sm text-slate-500">No collections yet</p>
            ) : (
              collections.map((col) => (
                <div key={col.id} className="space-y-1">
                  <button
                    onClick={() =>
                      setSelectedCollectionId(
                        selectedCollectionId === col.id ? null : col.id
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                      selectedCollectionId === col.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {col.name}
                  </button>
                  {selectedCollectionId === col.id && (
                    <div className="pl-4 space-y-1">
                      {requests
                        .filter((r) => r.collectionId === col.id)
                        .map((req) => (
                          <div key={req.id} className="flex items-center gap-2">
                            <button
                              onClick={() => loadRequest(req)}
                              className="flex-1 text-left px-2 py-1 rounded text-xs bg-slate-50 hover:bg-slate-100 transition"
                            >
                              <span className={`px-2 py-0.5 rounded text-xs mr-2 ${methodColors[req.method]}`}>
                                {req.method}
                              </span>
                              {req.name}
                            </button>
                            <button
                              onClick={() => deleteRequest(req.id)}
                              className="p-1 hover:bg-red-100 rounded transition"
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Environments */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Environments</h3>
            <button
              onClick={() => setShowNewEnv(true)}
              className="p-1 hover:bg-slate-100 rounded transition"
              title="New Environment"
            >
              <Plus size={18} className="text-slate-600" />
            </button>
          </div>

          {showNewEnv && (
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Environment name"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={createEnvironment}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewEnv(false)
                    setNewEnvName('')
                  }}
                  className="flex-1 px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {environments.length === 0 ? (
              <p className="text-sm text-slate-500">No environments yet</p>
            ) : (
              environments.map((env) => (
                <div
                  key={env.id}
                  className={`p-2 rounded border-2 transition cursor-pointer ${
                    env.active ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setActiveEnv(env.active ? null : env.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{env.name}</span>
                    {env.active && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Active</span>}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(env.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs bg-white rounded p-1">
                        <code className="text-slate-700">{key}</code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEnvironmentVariable(env.id, key)
                          }}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Request Builder */}
      <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Request Name</label>
            <input
              type="text"
              placeholder="My API Request"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Method & URL */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2 items-end">
              <div className="flex-shrink-0 w-32">
                <label className="block text-sm font-medium text-slate-700 mb-2">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">URL</label>
                <input
                  type="text"
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Headers</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={key}
                    disabled
                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={value}
                    disabled
                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-sm"
                  />
                  <button
                    onClick={() => removeHeader(key)}
                    className="p-1 hover:bg-red-100 rounded transition"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 items-end">
                <input
                  type="text"
                  placeholder="Header name"
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Header value"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                />
                <button
                  onClick={addHeader}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          {method !== 'GET' && method !== 'DELETE' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Body</label>
              <textarea
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-32"
              />
            </div>
          )}

          {/* Active Environment Display */}
          {activeEnvironment && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
              <span className="text-green-700">
                <Settings size={16} className="inline mr-2" />
                Active Environment: <strong>{activeEnvironment.name}</strong>
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={sendRequest}
              disabled={loading || !url}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <RotateCw size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RotateCw size={18} />
                  Send
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (!selectedCollectionId) {
                  setError('Please select a collection first')
                  return
                }
                setShowSaveModal(true)
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>

        {/* Response & Documentation */}
        {response && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-700'
                        : response.status >= 400
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-sm text-slate-600">{response.time}ms</span>
                    <span className="text-sm text-slate-600">{response.size} bytes</span>
                  </div>
                  <button
                    onClick={copyResponseToClipboard}
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
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Headers</h4>
                    <div className="bg-slate-50 p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="text-slate-700">
                          <span className="text-blue-600">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Body</h4>
                    <div className="bg-slate-50 p-3 rounded text-sm font-mono max-h-64 overflow-y-auto break-words whitespace-pre-wrap">
                      {response.body}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation Generator */}
            <AIDocWriter
              request={{
                method,
                url,
                headers,
                body,
                requestName,
              }}
              response={response}
            />
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Save Request</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Request Name</label>
              <input
                type="text"
                placeholder="My API Request"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Collection</label>
              <select
                value={selectedCollectionId || ''}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a collection</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={saveRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
