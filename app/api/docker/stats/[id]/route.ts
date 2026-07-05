import { NextRequest, NextResponse } from 'next/server'

const DOCKER_API_URL = process.env.DOCKER_API_URL || 'http://localhost:2375'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function calculateCPUPercent(stats: any): string {
  try {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - (stats.precpu_stats?.cpu_usage?.total_usage || 0)
    const systemDelta = stats.cpu_stats.system_cpu_usage - (stats.precpu_stats?.system_cpu_usage || 0)
    const cpuPercent =
      (cpuDelta / systemDelta) * (stats.cpu_stats.online_cpus || 1) * 100.0

    return cpuPercent.toFixed(2) + '%'
  } catch {
    return '0%'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    // Fetch stats with stream=false to get one snapshot
    const response = await fetch(
      `${DOCKER_API_URL}/v1.44/containers/${id}/stats?stream=false`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`)
    }

    const stats = await response.json()

    // Calculate memory usage
    const memoryUsage = stats.memory_stats?.usage || 0
    const memoryLimit = stats.memory_stats?.limit || 0
    const memoryPercent = memoryLimit > 0 ? ((memoryUsage / memoryLimit) * 100).toFixed(2) : '0'

    // Calculate CPU percent
    const cpuPercent = calculateCPUPercent(stats)

    return NextResponse.json({
      memory_usage: formatBytes(memoryUsage),
      memory_limit: formatBytes(memoryLimit),
      memory_percent: memoryPercent + '%',
      cpu_percent: cpuPercent,
      pids_stats: stats.pids_stats?.current || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        memory_usage: 'N/A',
        memory_limit: 'N/A',
        memory_percent: 'N/A',
        cpu_percent: 'N/A',
        pids_stats: 0,
      },
      { status: 200 }
    )
  }
}
