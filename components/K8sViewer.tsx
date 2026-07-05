'use client'

import React, { useState, useEffect } from 'react'
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  RotateCcw,
  Terminal,
  Activity,
  Cpu,
  HardDrive,
} from 'lucide-react'

interface Pod {
  metadata: {
    name: string
    namespace: string
    uid: string
    creationTimestamp: string
  }
  status: {
    phase: string
    containerStatuses?: Array<{
      name: string
      ready: boolean
      restartCount: number
      state: Record<string, unknown>
    }>
  }
  spec: {
    containers: Array<{
      name: string
      image: string
    }>
  }
}

interface Deployment {
  metadata: {
    name: string
    namespace: string
    uid: string
    creationTimestamp: string
  }
  spec: {
    replicas: number
    selector: {
      matchLabels: Record<string, string>
    }
    template: {
      spec: {
        containers: Array<{
          name: string
          image: string
        }>
      }
    }
  }
  status: {
    replicas: number
    updatedReplicas: number
    readyReplicas: number
    availableReplicas: number
    conditions?: Array<{
      type: string
      status: string
      lastUpdateTime: string
      lastTransitionTime: string
      reason: string
      message: string
    }>
  }
}

interface Namespace {
  metadata: {
    name: string
    uid: string
    creationTimestamp: string
  }
  status: {
    phase: string
  }
}

interface ClusterStatus {
  nodes: number
  pods: number
  deployments: number
  namespaces: number
  kubeVersion: string
  connected: boolean
}

const API_BASE = '/api/kubernetes'

export default function K8sViewer() {
  const [pods, setPods] = useState<Pod[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'cluster' | 'deployments' | 'pods' | 'namespaces'>('cluster')
  const [expandedPod, setExpandedPod] = useState<string | null>(null)
  const [podLogs, setPodLogs] = useState<Record<string, string>>({})
  const [selectedNamespace, setSelectedNamespace] = useState('default')
  const [loadingLogs, setLoadingLogs] = useState<Set<string>>(new Set())
  const [restartingDeployment, setRestartingDeployment] = useState<Set<string>>(new Set())

  // Fetch cluster status
  const fetchClusterStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/cluster-status`)
      if (!response.ok) throw new Error('Failed to fetch cluster status')
      const data = await response.json()
      setClusterStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cluster status')
    } finally {
      setLoading(false)
    }
  }

  // Fetch deployments
  const fetchDeployments = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = selectedNamespace === 'all'
        ? `${API_BASE}/deployments`
        : `${API_BASE}/deployments?namespace=${selectedNamespace}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch deployments')
      const data = await response.json()
      setDeployments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deployments')
    } finally {
      setLoading(false)
    }
  }

  // Fetch pods
  const fetchPods = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = selectedNamespace === 'all'
        ? `${API_BASE}/pods`
        : `${API_BASE}/pods?namespace=${selectedNamespace}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch pods')
      const data = await response.json()
      setPods(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pods')
    } finally {
      setLoading(false)
    }
  }

  // Fetch namespaces
  const fetchNamespaces = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/namespaces`)
      if (!response.ok) throw new Error('Failed to fetch namespaces')
      const data = await response.json()
      setNamespaces(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch namespaces')
    } finally {
      setLoading(false)
    }
  }

  // Fetch pod logs
  const fetchPodLogs = async (podName: string, namespace: string) => {
    setLoadingLogs((prev) => new Set([...prev, podName]))
    try {
      const response = await fetch(`${API_BASE}/pods/${namespace}/${podName}/logs`)
      if (!response.ok) throw new Error('Failed to fetch logs')
      const data = await response.json()
      setPodLogs((prev) => ({ ...prev, [podName]: data.logs }))
    } catch (err) {
      setPodLogs((prev) => ({
        ...prev,
        [podName]: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }))
    } finally {
      setLoadingLogs((prev) => {
        const newSet = new Set(prev)
        newSet.delete(podName)
        return newSet
      })
    }
  }

  // Restart deployment
  const restartDeployment = async (deploymentName: string, namespace: string) => {
    setRestartingDeployment((prev) => new Set([...prev, deploymentName]))
    try {
      const response = await fetch(`${API_BASE}/deployments/${namespace}/${deploymentName}/restart`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to restart deployment')
      // Refresh deployments after restart
      await fetchDeployments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart deployment')
    } finally {
      setRestartingDeployment((prev) => {
        const newSet = new Set(prev)
        newSet.delete(deploymentName)
        return newSet
      })
    }
  }

  // Toggle pod logs display
  const togglePodLogs = (podName: string, namespace: string) => {
    if (expandedPod === podName) {
      setExpandedPod(null)
    } else {
      setExpandedPod(podName)
      if (!podLogs[podName]) {
        fetchPodLogs(podName, namespace)
      }
    }
  }

  // Initial load
  useEffect(() => {
    fetchClusterStatus()
    fetchNamespaces()
    fetchDeployments()
    fetchPods()
  }, [])

  // Refetch when namespace changes
  useEffect(() => {
    fetchDeployments()
    fetchPods()
  }, [selectedNamespace])

  const getPodPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Running':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      case 'Succeeded':
        return 'bg-blue-100 text-blue-800'
      case 'Unknown':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeploymentStatusColor = (deployment: Deployment) => {
    const { replicas = 0, readyReplicas = 0 } = deployment.status
    if (readyReplicas === replicas && replicas > 0) return 'bg-green-100 text-green-800'
    if (readyReplicas > 0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Kubernetes Viewer</h1>
          <p className="text-gray-600 mt-2">Monitor and manage Kubernetes cluster resources</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('cluster')
                fetchClusterStatus()
              }}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'cluster'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Cluster Status
            </button>
            <button
              onClick={() => {
                setActiveTab('deployments')
                fetchDeployments()
              }}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'deployments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Deployments
            </button>
            <button
              onClick={() => {
                setActiveTab('pods')
                fetchPods()
              }}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'pods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Pods
            </button>
            <button
              onClick={() => {
                setActiveTab('namespaces')
                fetchNamespaces()
              }}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'namespaces'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Namespaces
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

        {/* Cluster Status Tab */}
        {activeTab === 'cluster' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Cluster Overview</h2>
              <button
                onClick={fetchClusterStatus}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {loading && !clusterStatus ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600">Loading cluster status...</p>
              </div>
            ) : clusterStatus ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {clusterStatus.connected ? (
                          <span className="text-green-600">Connected</span>
                        ) : (
                          <span className="text-red-600">Disconnected</span>
                        )}
                      </p>
                    </div>
                    <Activity className={`w-8 h-8 ${clusterStatus.connected ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kube Version</p>
                      <p className="text-2xl font-bold text-gray-900">{clusterStatus.kubeVersion}</p>
                    </div>
                    <Cpu className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nodes</p>
                      <p className="text-2xl font-bold text-gray-900">{clusterStatus.nodes}</p>
                    </div>
                    <HardDrive className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Deployments</p>
                      <p className="text-2xl font-bold text-gray-900">{clusterStatus.deployments}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pods</p>
                      <p className="text-2xl font-bold text-gray-900">{clusterStatus.pods}</p>
                    </div>
                    <Activity className="w-8 h-8 text-cyan-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Namespaces</p>
                      <p className="text-2xl font-bold text-gray-900">{clusterStatus.namespaces}</p>
                    </div>
                    <HardDrive className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Unable to connect to Kubernetes cluster</p>
              </div>
            )}
          </div>
        )}

        {/* Deployments Tab */}
        {activeTab === 'deployments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Deployments</h2>
                <div className="mt-4 flex gap-4">
                  <select
                    value={selectedNamespace}
                    onChange={(e) => setSelectedNamespace(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="all">All Namespaces</option>
                    <option value="default">default</option>
                    {namespaces.map((ns) => (
                      <option key={ns.metadata.name} value={ns.metadata.name}>
                        {ns.metadata.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={fetchDeployments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {loading && deployments.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600">Loading deployments...</p>
              </div>
            ) : deployments.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No deployments found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Namespace</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Replicas</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ready</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Updated</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Available</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deployments.map((deployment) => (
                      <tr key={deployment.metadata.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{deployment.metadata.name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{deployment.metadata.namespace}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDeploymentStatusColor(deployment)}`}>
                            {deployment.status.availableReplicas === deployment.spec.replicas ? 'Ready' : 'Not Ready'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deployment.spec.replicas}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deployment.status.readyReplicas || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deployment.status.updatedReplicas || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deployment.status.availableReplicas || 0}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => restartDeployment(deployment.metadata.name, deployment.metadata.namespace)}
                            disabled={restartingDeployment.has(deployment.metadata.name)}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {restartingDeployment.has(deployment.metadata.name) ? 'Restarting...' : 'Restart'}
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

        {/* Pods Tab */}
        {activeTab === 'pods' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pods</h2>
                <div className="mt-4 flex gap-4">
                  <select
                    value={selectedNamespace}
                    onChange={(e) => setSelectedNamespace(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="all">All Namespaces</option>
                    <option value="default">default</option>
                    {namespaces.map((ns) => (
                      <option key={ns.metadata.name} value={ns.metadata.name}>
                        {ns.metadata.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={fetchPods}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {loading && pods.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600">Loading pods...</p>
              </div>
            ) : pods.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pods found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pods.map((pod) => (
                  <div key={pod.metadata.uid} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Pod Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{pod.metadata.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">Namespace: {pod.metadata.namespace}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPodPhaseColor(pod.status.phase)}`}>
                            {pod.status.phase}
                          </span>
                        </div>
                        <button
                          onClick={() => togglePodLogs(pod.metadata.name, pod.metadata.namespace)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {expandedPod === pod.metadata.name ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Pod Details */}
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Pod UID</p>
                          <p className="font-mono text-sm text-gray-900">{pod.metadata.uid.substring(0, 12)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="text-sm text-gray-900">
                            {new Date(pod.metadata.creationTimestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Containers */}
                      {pod.spec.containers && pod.spec.containers.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Containers</p>
                          <div className="space-y-2">
                            {pod.spec.containers.map((container, idx) => (
                              <div key={idx} className="px-3 py-2 bg-gray-100 rounded">
                                <p className="font-mono text-sm text-gray-900">{container.name}</p>
                                <p className="text-xs text-gray-600">{container.image}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Container Status */}
                      {pod.status.containerStatuses && pod.status.containerStatuses.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Container Status</p>
                          <div className="grid grid-cols-2 gap-4">
                            {pod.status.containerStatuses.map((cs, idx) => (
                              <div key={idx} className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
                                <p className="font-mono text-sm text-gray-900">{cs.name}</p>
                                <p className="text-xs text-gray-600 mt-1">Ready: {cs.ready ? 'Yes' : 'No'}</p>
                                <p className="text-xs text-gray-600">Restarts: {cs.restartCount}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Logs Section */}
                    {expandedPod === pod.metadata.name && (
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="mb-4 flex justify-between items-center">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            Pod Logs
                          </h4>
                          <button
                            onClick={() => fetchPodLogs(pod.metadata.name, pod.metadata.namespace)}
                            disabled={loadingLogs.has(pod.metadata.name)}
                            className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
                          >
                            {loadingLogs.has(pod.metadata.name) ? 'Loading...' : 'Refresh'}
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-100 overflow-x-auto max-h-64 overflow-y-auto">
                          {podLogs[pod.metadata.name] ? (
                            podLogs[pod.metadata.name]
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

        {/* Namespaces Tab */}
        {activeTab === 'namespaces' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Namespaces</h2>
              <button
                onClick={fetchNamespaces}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {loading && namespaces.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600">Loading namespaces...</p>
              </div>
            ) : namespaces.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No namespaces found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {namespaces.map((namespace) => (
                      <tr key={namespace.metadata.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{namespace.metadata.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {namespace.status.phase}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">
                          {namespace.metadata.uid.substring(0, 12)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(namespace.metadata.creationTimestamp).toLocaleDateString()}
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
