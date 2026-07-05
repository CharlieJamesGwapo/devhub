import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const namespace = request.nextUrl.searchParams.get('namespace')

    // Mock Kubernetes pods
    // In production, integrate with real Kubernetes API client
    const allPods = [
      {
        metadata: {
          name: 'nginx-deployment-5d59d67564-abc12',
          namespace: 'default',
          uid: 'nginx-pod-uid-001',
          creationTimestamp: new Date('2024-06-01').toISOString(),
        },
        status: {
          phase: 'Running',
          containerStatuses: [
            {
              name: 'nginx',
              ready: true,
              restartCount: 0,
              state: { running: { startedAt: new Date().toISOString() } },
            },
          ],
        },
        spec: {
          containers: [{ name: 'nginx', image: 'nginx:1.24' }],
        },
      },
      {
        metadata: {
          name: 'nginx-deployment-5d59d67564-def45',
          namespace: 'default',
          uid: 'nginx-pod-uid-002',
          creationTimestamp: new Date('2024-06-01').toISOString(),
        },
        status: {
          phase: 'Running',
          containerStatuses: [
            {
              name: 'nginx',
              ready: true,
              restartCount: 0,
              state: { running: { startedAt: new Date().toISOString() } },
            },
          ],
        },
        spec: {
          containers: [{ name: 'nginx', image: 'nginx:1.24' }],
        },
      },
      {
        metadata: {
          name: 'nginx-deployment-5d59d67564-ghi78',
          namespace: 'default',
          uid: 'nginx-pod-uid-003',
          creationTimestamp: new Date('2024-06-01').toISOString(),
        },
        status: {
          phase: 'Running',
          containerStatuses: [
            {
              name: 'nginx',
              ready: true,
              restartCount: 1,
              state: { running: { startedAt: new Date().toISOString() } },
            },
          ],
        },
        spec: {
          containers: [{ name: 'nginx', image: 'nginx:1.24' }],
        },
      },
      {
        metadata: {
          name: 'api-deployment-7c8d9e0f1a2-jkl01',
          namespace: 'default',
          uid: 'api-pod-uid-001',
          creationTimestamp: new Date('2024-06-05').toISOString(),
        },
        status: {
          phase: 'Running',
          containerStatuses: [
            {
              name: 'api',
              ready: true,
              restartCount: 0,
              state: { running: { startedAt: new Date().toISOString() } },
            },
          ],
        },
        spec: {
          containers: [{ name: 'api', image: 'api-service:1.0' }],
        },
      },
      {
        metadata: {
          name: 'api-deployment-7c8d9e0f1a2-mno23',
          namespace: 'default',
          uid: 'api-pod-uid-002',
          creationTimestamp: new Date('2024-06-05').toISOString(),
        },
        status: {
          phase: 'Pending',
          containerStatuses: [
            {
              name: 'api',
              ready: false,
              restartCount: 0,
              state: { waiting: { reason: 'ImagePullBackOff' } },
            },
          ],
        },
        spec: {
          containers: [{ name: 'api', image: 'api-service:1.0' }],
        },
      },
      {
        metadata: {
          name: 'prometheus-0',
          namespace: 'monitoring',
          uid: 'prom-pod-uid-001',
          creationTimestamp: new Date('2024-06-10').toISOString(),
        },
        status: {
          phase: 'Running',
          containerStatuses: [
            {
              name: 'prometheus',
              ready: true,
              restartCount: 0,
              state: { running: { startedAt: new Date().toISOString() } },
            },
          ],
        },
        spec: {
          containers: [{ name: 'prometheus', image: 'prom/prometheus:latest' }],
        },
      },
      {
        metadata: {
          name: 'grafana-0',
          namespace: 'monitoring',
          uid: 'grafana-pod-uid-001',
          creationTimestamp: new Date('2024-06-10').toISOString(),
        },
        status: {
          phase: 'Failed',
          containerStatuses: [
            {
              name: 'grafana',
              ready: false,
              restartCount: 3,
              state: { terminated: { reason: 'Error', exitCode: 1 } },
            },
          ],
        },
        spec: {
          containers: [{ name: 'grafana', image: 'grafana/grafana:latest' }],
        },
      },
    ]

    let pods = allPods
    if (namespace && namespace !== 'all') {
      pods = allPods.filter((pod) => pod.metadata.namespace === namespace)
    }

    return NextResponse.json(pods)
  } catch (error) {
    console.error('Error fetching pods:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pods' },
      { status: 500 }
    )
  }
}
