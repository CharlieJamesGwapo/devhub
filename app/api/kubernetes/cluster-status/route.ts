import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock Kubernetes cluster status
    // In production, integrate with real Kubernetes API client
    const clusterStatus = {
      nodes: 3,
      pods: 15,
      deployments: 5,
      namespaces: 4,
      kubeVersion: 'v1.28.0',
      connected: true,
    }

    return NextResponse.json(clusterStatus)
  } catch (error) {
    console.error('Error fetching cluster status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch cluster status' },
      { status: 500 }
    )
  }
}
