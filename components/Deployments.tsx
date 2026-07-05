'use client'

import React, { useState, useEffect } from 'react'
import {
  GitBranch,
  Package,
  Settings,
  Trash2,
  Plus,
  Check,
  AlertTriangle,
  Clock,
  RefreshCw,
  Copy,
  Edit2,
  ChevronDown,
  Cloud,
  Server,
  Zap,
} from 'lucide-react'

interface DeploymentVersion {
  id: string
  version: string
  timestamp: number
  status: 'success' | 'failed' | 'in-progress'
  author: string
  message: string
  duration: number
}

interface DeploymentEnvironment {
  id: string
  name: 'dev' | 'staging' | 'prod'
  status: 'healthy' | 'warning' | 'error'
  currentVersion: string
  uptime: number
  activeUsers: number
  lastDeploy: number
  deployHistory: DeploymentVersion[]
}

interface EnvironmentVariable {
  id: string
  key: string
  value: string
  masked: boolean
}

const generateVersionId = () => {
  return `v${Date.now().toString(36)}`
}

export default function Deployments() {
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([
    {
      id: 'dev',
      name: 'dev',
      status: 'healthy',
      currentVersion: '2.1.0',
      uptime: 99.8,
      activeUsers: 12,
      lastDeploy: Date.now() - 3600000,
      deployHistory: [
        {
          id: 'v1',
          version: '2.1.0',
          timestamp: Date.now() - 3600000,
          status: 'success',
          author: 'alice@example.com',
          message: 'Fix authentication bug',
          duration: 245,
        },
        {
          id: 'v2',
          version: '2.0.9',
          timestamp: Date.now() - 86400000,
          status: 'success',
          author: 'bob@example.com',
          message: 'Add new API endpoint',
          duration: 312,
        },
        {
          id: 'v3',
          version: '2.0.8',
          timestamp: Date.now() - 172800000,
          status: 'failed',
          author: 'charlie@example.com',
          message: 'Database migration',
          duration: 180,
        },
      ],
    },
    {
      id: 'staging',
      name: 'staging',
      status: 'healthy',
      currentVersion: '2.0.9',
      uptime: 99.95,
      activeUsers: 45,
      lastDeploy: Date.now() - 604800000,
      deployHistory: [
        {
          id: 'v4',
          version: '2.0.9',
          timestamp: Date.now() - 604800000,
          status: 'success',
          author: 'alice@example.com',
          message: 'Release candidate v2.0.9',
          duration: 298,
        },
        {
          id: 'v5',
          version: '2.0.8',
          timestamp: Date.now() - 1209600000,
          status: 'success',
          author: 'bob@example.com',
          message: 'Hotfix for prod issue',
          duration: 267,
        },
      ],
    },
    {
      id: 'prod',
      name: 'prod',
      status: 'healthy',
      currentVersion: '2.0.7',
      uptime: 99.99,
      activeUsers: 1250,
      lastDeploy: Date.now() - 2592000000,
      deployHistory: [
        {
          id: 'v6',
          version: '2.0.7',
          timestamp: Date.now() - 2592000000,
          status: 'success',
          author: 'alice@example.com',
          message: 'Stable release v2.0.7',
          duration: 445,
        },
        {
          id: 'v7',
          version: '2.0.6',
          timestamp: Date.now() - 5184000000,
          status: 'success',
          author: 'bob@example.com',
          message: 'Major release v2.0.6',
          duration: 512,
        },
      ],
    },
  ])

  const [selectedEnv, setSelectedEnv] = useState<string>('dev')
  const [envVars, setEnvVars] = useState<Record<string, EnvironmentVariable[]>>({
    dev: [
      { id: '1', key: 'DATABASE_URL', value: 'postgresql://localhost/dev_db', masked: false },
      { id: '2', key: 'API_KEY', value: '****3456', masked: true },
      { id: '3', key: 'DEBUG_MODE', value: 'true', masked: false },
    ],
    staging: [
      { id: '4', key: 'DATABASE_URL', value: 'postgresql://staging-db.aws.com/stage_db', masked: false },
      { id: '5', key: 'API_KEY', value: '****7890', masked: true },
      { id: '6', key: 'DEBUG_MODE', value: 'false', masked: false },
    ],
    prod: [
      { id: '7', key: 'DATABASE_URL', value: 'postgresql://prod-db.aws.com/prod_db', masked: false },
      { id: '8', key: 'API_KEY', value: '****2468', masked: true },
      { id: '9', key: 'DEBUG_MODE', value: 'false', masked: false },
      { id: '10', key: 'LOG_LEVEL', value: 'error', masked: false },
    ],
  })

  const [showEnvVarForm, setShowEnvVarForm] = useState(false)
  const [newVarKey, setNewVarKey] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  const [newVarMasked, setNewVarMasked] = useState(false)
  const [showDeployForm, setShowDeployForm] = useState(false)
  const [deployMessage, setDeployMessage] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedEnv, setExpandedEnv] = useState<string | null>('dev')

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEnvs = localStorage.getItem('deployments_environments')
    const savedVars = localStorage.getItem('deployments_env_vars')
    if (savedEnvs) setEnvironments(JSON.parse(savedEnvs))
    if (savedVars) setEnvVars(JSON.parse(savedVars))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('deployments_environments', JSON.stringify(environments))
  }, [environments])

  useEffect(() => {
    localStorage.setItem('deployments_env_vars', JSON.stringify(envVars))
  }, [envVars])

  const currentEnv = environments.find((e) => e.id === selectedEnv)

  const handleAddEnvVar = () => {
    if (!newVarKey.trim() || !newVarValue.trim()) return

    const envVarsList = envVars[selectedEnv] || []
    const newVar: EnvironmentVariable = {
      id: Date.now().toString(),
      key: newVarKey,
      value: newVarValue,
      masked: newVarMasked,
    }

    setEnvVars({
      ...envVars,
      [selectedEnv]: [...envVarsList, newVar],
    })

    setNewVarKey('')
    setNewVarValue('')
    setNewVarMasked(false)
    setShowEnvVarForm(false)
  }

  const handleDeleteEnvVar = (varId: string) => {
    setEnvVars({
      ...envVars,
      [selectedEnv]: envVars[selectedEnv].filter((v) => v.id !== varId),
    })
  }

  const handleDeploy = () => {
    if (!deployMessage.trim()) return

    setDeploying(true)

    setTimeout(() => {
      const newVersion: DeploymentVersion = {
        id: generateVersionId(),
        version: `2.1.${Math.floor(Math.random() * 10)}`,
        timestamp: Date.now(),
        status: 'success',
        author: 'current@user.com',
        message: deployMessage,
        duration: Math.floor(Math.random() * 300) + 150,
      }

      setEnvironments(
        environments.map((env) => {
          if (env.id === selectedEnv) {
            return {
              ...env,
              currentVersion: newVersion.version,
              lastDeploy: newVersion.timestamp,
              deployHistory: [newVersion, ...env.deployHistory].slice(0, 10),
            }
          }
          return env
        })
      )

      setDeploying(false)
      setDeployMessage('')
      setShowDeployForm(false)
    }, 2000)
  }

  const handleRollback = (versionId: string) => {
    if (!currentEnv) return

    const versionToRollback = currentEnv.deployHistory.find((v) => v.id === versionId)
    if (!versionToRollback) return

    setEnvironments(
      environments.map((env) => {
        if (env.id === selectedEnv) {
          const newRollbackVersion: DeploymentVersion = {
            id: generateVersionId(),
            version: versionToRollback.version,
            timestamp: Date.now(),
            status: 'success',
            author: 'current@user.com',
            message: `Rollback to ${versionToRollback.version}`,
            duration: Math.floor(Math.random() * 200) + 100,
          }

          return {
            ...env,
            currentVersion: versionToRollback.version,
            lastDeploy: newRollbackVersion.timestamp,
            deployHistory: [newRollbackVersion, ...env.deployHistory].slice(0, 10),
          }
        }
        return env
      })
    )
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700'
      case 'error':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getDeployStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500'
      case 'failed':
        return 'bg-red-50 border-l-4 border-red-500'
      case 'in-progress':
        return 'bg-blue-50 border-l-4 border-blue-500'
      default:
        return 'bg-gray-50'
    }
  }

  const getDeployStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check size={18} className="text-green-600" />
      case 'failed':
        return <AlertTriangle size={18} className="text-red-600" />
      case 'in-progress':
        return <RefreshCw size={18} className="text-blue-600 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Cloud className="text-blue-600" size={32} />
            Deployments
          </h1>
          <p className="text-gray-600 mt-2">
            Manage deployment environments, release history, and environment variables
          </p>
        </div>

        {/* Environment Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => {
                setSelectedEnv(env.id)
                setExpandedEnv(env.id)
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedEnv === env.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
              }`}
            >
              <Server size={18} />
              {env.name.toUpperCase()}
            </button>
          ))}
        </div>

        {currentEnv && (
          <>
            {/* Environment Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-semibold">Current Version</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{currentEnv.currentVersion}</p>
                <p className="text-xs text-gray-500 mt-2">Running stable release</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-semibold">Status</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentEnv.status)}`}>
                    {currentEnv.status.charAt(0).toUpperCase() + currentEnv.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Environment health</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm font-semibold">Uptime</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{currentEnv.uptime.toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                <p className="text-gray-600 text-sm font-semibold">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{currentEnv.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-2">Currently online</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Deploy Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Zap size={24} className="text-orange-600" />
                      Deploy New Version
                    </h2>
                  </div>

                  {!showDeployForm ? (
                    <button
                      onClick={() => setShowDeployForm(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      New Deployment
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        value={deployMessage}
                        onChange={(e) => setDeployMessage(e.target.value)}
                        placeholder="Enter deployment message (e.g., 'Fix critical bug in payment module')"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        rows={4}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleDeploy}
                          disabled={deploying || !deployMessage.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {deploying ? (
                            <>
                              <RefreshCw size={20} className="animate-spin" />
                              Deploying...
                            </>
                          ) : (
                            <>
                              <Check size={20} />
                              Deploy Now
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeployForm(false)
                            setDeployMessage('')
                          }}
                          disabled={deploying}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deployment History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <GitBranch size={24} className="text-indigo-600" />
                    Release History
                  </h2>

                  <div className="space-y-3">
                    {currentEnv.deployHistory.map((deploy, index) => (
                      <div
                        key={deploy.id}
                        className={`rounded-lg p-5 flex items-start justify-between ${getDeployStatusColor(deploy.status)}`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1">{getDeployStatusIcon(deploy.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900">{deploy.version}</span>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                deploy.status === 'success'
                                  ? 'bg-green-200 text-green-800'
                                  : deploy.status === 'failed'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                {deploy.status.charAt(0).toUpperCase() + deploy.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-1">{deploy.message}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(deploy.timestamp)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap size={14} />
                                {deploy.duration}ms
                              </span>
                              <span>by {deploy.author}</span>
                            </div>
                          </div>
                        </div>

                        {deploy.status === 'success' && index !== 0 && (
                          <button
                            onClick={() => handleRollback(deploy.id)}
                            className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Environment Variables Panel */}
              <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings size={24} className="text-gray-600" />
                  Env Variables
                </h2>

                {!showEnvVarForm ? (
                  <button
                    onClick={() => setShowEnvVarForm(true)}
                    className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={18} />
                    Add Variable
                  </button>
                ) : (
                  <div className="mb-4 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <input
                      type="text"
                      value={newVarKey}
                      onChange={(e) => setNewVarKey(e.target.value)}
                      placeholder="Variable key"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <textarea
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      placeholder="Variable value"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      rows={3}
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newVarMasked}
                        onChange={(e) => setNewVarMasked(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-gray-700">Mask value (sensitive data)</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddEnvVar}
                        disabled={!newVarKey.trim() || !newVarValue.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowEnvVarForm(false)
                          setNewVarKey('')
                          setNewVarValue('')
                          setNewVarMasked(false)
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {(envVars[selectedEnv] || []).map((variable) => (
                    <div key={variable.id} className="bg-gray-50 rounded p-3 border border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-bold text-gray-900 break-all">{variable.key}</p>
                          <p className="font-mono text-xs text-gray-600 mt-1 break-all">
                            {variable.masked ? '••••••••' : variable.value}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                variable.masked ? 'MASKED' : variable.value,
                                variable.id
                              )
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy value"
                          >
                            {copied === variable.id ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} className="text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteEnvVar(variable.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete variable"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
