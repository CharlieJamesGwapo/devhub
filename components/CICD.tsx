'use client'

import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  GitBranch,
  PlayCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Build {
  id: string
  number: number
  status: 'success' | 'failed' | 'running' | 'cancelled'
  branch: string
  commit: string
  message: string
  author: string
  startTime: string
  endTime?: string
  duration?: number
  logs?: string
}

interface Pipeline {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  successRate: number
  recentBuilds: number
}

interface CICDProps {
  projectId?: string
  onDeploy?: (buildId: string, environment: string) => Promise<void>
}

const mockBuilds: Build[] = [
  {
    id: 'build-124',
    number: 124,
    status: 'success',
    branch: 'main',
    commit: 'a3f2e1c',
    message: 'feat: add CI/CD dashboard component',
    author: 'John Doe',
    startTime: '2026-07-05T10:30:00Z',
    endTime: '2026-07-05T10:45:00Z',
    duration: 15,
  },
  {
    id: 'build-123',
    number: 123,
    status: 'success',
    branch: 'develop',
    commit: 'f8d5c2a',
    message: 'fix: resolve memory leak in build process',
    author: 'Jane Smith',
    startTime: '2026-07-05T09:15:00Z',
    endTime: '2026-07-05T09:32:00Z',
    duration: 17,
  },
  {
    id: 'build-122',
    number: 122,
    status: 'failed',
    branch: 'feature/auth',
    commit: 'b1e4f9d',
    message: 'feat: implement OAuth2 authentication',
    author: 'Mike Johnson',
    startTime: '2026-07-05T08:00:00Z',
    endTime: '2026-07-05T08:12:00Z',
    duration: 12,
    logs: 'Tests failed: AuthService.test.ts (Failed: 3 tests)\nError: Expected true but got false in login validation',
  },
  {
    id: 'build-121',
    number: 121,
    status: 'running',
    branch: 'main',
    commit: '7c6f3e2',
    message: 'chore: update dependencies',
    author: 'John Doe',
    startTime: '2026-07-05T11:00:00Z',
  },
  {
    id: 'build-120',
    number: 120,
    status: 'success',
    branch: 'main',
    commit: 'e5a2b8f',
    message: 'docs: update API documentation',
    author: 'Sarah Chen',
    startTime: '2026-07-05T07:30:00Z',
    endTime: '2026-07-05T07:42:00Z',
    duration: 12,
  },
]

export default function CICD({ projectId = 'default', onDeploy }: CICDProps) {
  const [builds, setBuilds] = useState<Build[]>(mockBuilds)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedBuild, setExpandedBuild] = useState<string | null>(null)
  const [deploying, setDeploying] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    // Calculate pipeline statistics
    const calculatePipelines = () => {
      const successCount = builds.filter((b) => b.status === 'success').length
      const totalCount = builds.filter(
        (b) => b.status !== 'running'
      ).length
      const successRate =
        totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0

      const newPipelines: Pipeline[] = [
        {
          name: 'Main Pipeline',
          status: successRate >= 90 ? 'healthy' : successRate >= 70 ? 'warning' : 'critical',
          successRate,
          recentBuilds: builds.length,
        },
      ]

      setPipelines(newPipelines)
    }

    calculatePipelines()
  }, [builds])

  const handleDeploy = async (buildId: string, environment: string) => {
    setDeploying(buildId)
    try {
      if (onDeploy) {
        await onDeploy(buildId, environment)
      }
      setSuccessMessage(
        `Deployment triggered for ${environment} environment`
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Deployment failed:', error)
    } finally {
      setDeploying(null)
    }
  }

  const handleRetryBuild = (buildId: string) => {
    const build = builds.find((b) => b.id === buildId)
    if (build) {
      const newBuild = {
        ...build,
        id: `${build.id}-retry`,
        number: build.number + 1,
        status: 'running' as const,
        startTime: new Date().toISOString(),
      }
      setBuilds([newBuild, ...builds])
    }
  }

  const handleDeleteBuild = (buildId: string) => {
    setBuilds(builds.filter((b) => b.id !== buildId))
  }

  const buildChartData = builds
    .filter((b) => b.status !== 'running')
    .slice(0, 10)
    .reverse()
    .map((build) => ({
      buildNumber: `#${build.number}`,
      duration: build.duration || 0,
      status: build.status,
    }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getPipelineStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getPipelineStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CI/CD Pipeline</h1>
        <p className="text-gray-600 mt-2">
          Manage builds, monitor pipeline health, and trigger deployments
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✓ {successMessage}
        </div>
      )}

      {/* Pipeline Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pipelines.map((pipeline) => (
          <div
            key={pipeline.name}
            className={`rounded-lg shadow p-6 border ${getPipelineStatusColor(
              pipeline.status
            )}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{pipeline.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Success Rate: {pipeline.successRate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Recent Builds: {pipeline.recentBuilds}
                  </p>
                </div>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPipelineStatusBadge(
                  pipeline.status
                )}`}
              >
                {pipeline.status.charAt(0).toUpperCase() +
                  pipeline.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900">Build Duration</h3>
          <p className="text-sm text-gray-600 mt-2">
            Average: ~{Math.round(
              builds
                .filter((b) => b.duration)
                .reduce((sum, b) => sum + (b.duration || 0), 0) /
                builds.filter((b) => b.duration).length || 0
            )}{' '}
            min
          </p>
        </div>
      </div>

      {/* Build Duration Chart */}
      {buildChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Build Duration Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={buildChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="buildNumber" />
              <YAxis label={{ value: 'Duration (minutes)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="duration" fill="#3b82f6" name="Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Build History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Build History</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
            Successful
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full ml-3"></span>
            Failed
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full ml-3"></span>
            Running
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Build
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {builds.map((build) => (
                <React.Fragment key={build.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      #{build.number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(build.status)}
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            build.status
                          )}`}
                        >
                          {build.status.charAt(0).toUpperCase() +
                            build.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GitBranch className="w-4 h-4" />
                        {build.branch}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {build.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {build.author}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {build.duration ? `${build.duration}m` : 'Running...'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setExpandedBuild(
                              expandedBuild === build.id ? null : build.id
                            )
                          }
                          className="text-gray-600 hover:text-gray-900"
                          title="View details"
                        >
                          {expandedBuild === build.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {build.status === 'failed' && (
                          <button
                            onClick={() => handleRetryBuild(build.id)}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                            title="Retry build"
                          >
                            Retry
                          </button>
                        )}
                        {build.status === 'success' && (
                          <button
                            onClick={() =>
                              handleDeploy(build.id, 'staging')
                            }
                            disabled={deploying === build.id}
                            className="text-green-600 hover:text-green-900 text-xs font-medium px-2 py-1 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Deploy to staging"
                          >
                            <PlayCircle className="w-3 h-3" />
                            Deploy
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBuild(build.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete build"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedBuild === build.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase">
                                Commit
                              </p>
                              <p className="text-sm font-mono text-gray-900 mt-1">
                                {build.commit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase">
                                Start Time
                              </p>
                              <p className="text-sm text-gray-900 mt-1">
                                {new Date(
                                  build.startTime
                                ).toLocaleString()}
                              </p>
                            </div>
                            {build.endTime && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase">
                                  End Time
                                </p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {new Date(build.endTime).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Deployment Options for Successful Builds */}
                          {build.status === 'success' && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                                Deploy To
                              </p>
                              <div className="flex gap-2">
                                {['staging', 'production'].map((env) => (
                                  <button
                                    key={env}
                                    onClick={() =>
                                      handleDeploy(build.id, env)
                                    }
                                    disabled={deploying === build.id}
                                    className="px-3 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    Deploy to {env}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Build Logs for Failed Builds */}
                          {build.status === 'failed' && build.logs && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                                Build Logs
                              </p>
                              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto">
                                <pre>{build.logs}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {builds.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No builds found
          </div>
        )}
      </div>

      {/* Failed Builds Summary */}
      {builds.filter((b) => b.status === 'failed').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                {builds.filter((b) => b.status === 'failed').length} Failed Build
                {builds.filter((b) => b.status === 'failed').length !== 1
                  ? 's'
                  : ''}
              </h3>
              <div className="mt-2 space-y-2">
                {builds
                  .filter((b) => b.status === 'failed')
                  .map((build) => (
                    <div
                      key={build.id}
                      className="text-sm text-red-800 bg-white rounded p-2"
                    >
                      <span className="font-mono">Build #{build.number}</span>:{' '}
                      {build.message}
                    </div>
                  ))}
              </div>
              <p className="text-sm text-red-700 mt-3">
                Review logs and fix failing tests before merging to main.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
