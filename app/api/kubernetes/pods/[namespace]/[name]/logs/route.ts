import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ namespace: string; name: string }>
  }
) {
  try {
    const { namespace, name } = await params

    // Mock pod logs
    // In production, integrate with real Kubernetes API client
    const mockLogs: Record<string, string> = {
      'nginx-deployment-5d59d67564-abc12': `2024-07-05T10:15:32.123Z [info] Nginx worker process started
2024-07-05T10:15:33.456Z [info] Connection established
2024-07-05T10:15:34.789Z [debug] Handling GET /api/health
2024-07-05T10:15:35.012Z [info] Connection closed
2024-07-05T10:15:36.345Z [info] Nginx running normally`,

      'api-deployment-7c8d9e0f1a2-jkl01': `2024-07-05T10:14:00.111Z [info] API Server starting on port 3000
2024-07-05T10:14:01.222Z [info] Database connected
2024-07-05T10:14:02.333Z [info] Cache initialized
2024-07-05T10:14:03.444Z [info] Server ready to accept connections
2024-07-05T10:15:00.555Z [debug] GET /api/users - 200 OK`,

      'prometheus-0': `2024-07-05T10:10:00.000Z level=info ts=2024-07-05T10:10:00.000Z caller=main.go:123 msg="Starting Prometheus"
2024-07-05T10:10:01.001Z level=info ts=2024-07-05T10:10:01.001Z caller=config.go:456 msg="Loading configuration"
2024-07-05T10:10:02.002Z level=info ts=2024-07-05T10:10:02.002Z caller=scrape.go:789 msg="Starting scrape loops"
2024-07-05T10:10:03.003Z level=info ts=2024-07-05T10:10:03.003Z caller=main.go:200 msg="Server ready"`,

      'grafana-0': `2024-07-05T10:05:00.000Z logger=logger t=2024-07-05T10:05:00.000Z level=error msg="Failed to connect to data source"
2024-07-05T10:05:01.001Z logger=logger t=2024-07-05T10:05:01.001Z level=error msg="Connection timeout"
2024-07-05T10:05:02.002Z logger=logger t=2024-07-05T10:05:02.002Z level=error msg="Retrying connection..."
2024-07-05T10:05:05.005Z logger=logger t=2024-07-05T10:05:05.005Z level=error msg="Max retries exceeded"`,
    }

    const logs = mockLogs[name] || `Logs for pod ${name} in namespace ${namespace}\n[Mock logs - not yet connected to Kubernetes cluster]`

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching pod logs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pod logs' },
      { status: 500 }
    )
  }
}
