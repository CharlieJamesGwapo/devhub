import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock Kubernetes namespaces
    // In production, integrate with real Kubernetes API client
    const namespaces = [
      {
        metadata: {
          name: 'default',
          uid: 'default-uid-001',
          creationTimestamp: new Date('2024-01-01').toISOString(),
        },
        status: {
          phase: 'Active',
        },
      },
      {
        metadata: {
          name: 'kube-system',
          uid: 'kube-system-uid-001',
          creationTimestamp: new Date('2024-01-01').toISOString(),
        },
        status: {
          phase: 'Active',
        },
      },
      {
        metadata: {
          name: 'kube-public',
          uid: 'kube-public-uid-001',
          creationTimestamp: new Date('2024-01-01').toISOString(),
        },
        status: {
          phase: 'Active',
        },
      },
      {
        metadata: {
          name: 'monitoring',
          uid: 'monitoring-uid-001',
          creationTimestamp: new Date('2024-06-15').toISOString(),
        },
        status: {
          phase: 'Active',
        },
      },
    ]

    return NextResponse.json(namespaces)
  } catch (error) {
    console.error('Error fetching namespaces:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch namespaces' },
      { status: 500 }
    )
  }
}
