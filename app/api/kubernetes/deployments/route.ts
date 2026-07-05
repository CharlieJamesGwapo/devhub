import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const namespace = request.nextUrl.searchParams.get('namespace')

    // Mock Kubernetes deployments
    // In production, integrate with real Kubernetes API client
    const allDeployments = [
      {
        metadata: {
          name: 'nginx-deployment',
          namespace: 'default',
          uid: 'nginx-dep-uid-001',
          creationTimestamp: new Date('2024-01-15').toISOString(),
        },
        spec: {
          replicas: 3,
          selector: { matchLabels: { app: 'nginx' } },
          template: {
            spec: {
              containers: [{ name: 'nginx', image: 'nginx:1.24' }],
            },
          },
        },
        status: {
          replicas: 3,
          updatedReplicas: 3,
          readyReplicas: 3,
          availableReplicas: 3,
          conditions: [],
        },
      },
      {
        metadata: {
          name: 'api-deployment',
          namespace: 'default',
          uid: 'api-dep-uid-001',
          creationTimestamp: new Date('2024-02-10').toISOString(),
        },
        spec: {
          replicas: 2,
          selector: { matchLabels: { app: 'api' } },
          template: {
            spec: {
              containers: [{ name: 'api', image: 'api-service:1.0' }],
            },
          },
        },
        status: {
          replicas: 2,
          updatedReplicas: 2,
          readyReplicas: 2,
          availableReplicas: 2,
          conditions: [],
        },
      },
      {
        metadata: {
          name: 'prometheus',
          namespace: 'monitoring',
          uid: 'prom-dep-uid-001',
          creationTimestamp: new Date('2024-03-05').toISOString(),
        },
        spec: {
          replicas: 1,
          selector: { matchLabels: { app: 'prometheus' } },
          template: {
            spec: {
              containers: [{ name: 'prometheus', image: 'prom/prometheus:latest' }],
            },
          },
        },
        status: {
          replicas: 1,
          updatedReplicas: 1,
          readyReplicas: 1,
          availableReplicas: 1,
          conditions: [],
        },
      },
      {
        metadata: {
          name: 'grafana',
          namespace: 'monitoring',
          uid: 'grafana-dep-uid-001',
          creationTimestamp: new Date('2024-03-05').toISOString(),
        },
        spec: {
          replicas: 1,
          selector: { matchLabels: { app: 'grafana' } },
          template: {
            spec: {
              containers: [{ name: 'grafana', image: 'grafana/grafana:latest' }],
            },
          },
        },
        status: {
          replicas: 1,
          updatedReplicas: 1,
          readyReplicas: 0,
          availableReplicas: 0,
          conditions: [],
        },
      },
      {
        metadata: {
          name: 'database-migration',
          namespace: 'default',
          uid: 'db-mig-uid-001',
          creationTimestamp: new Date('2024-06-20').toISOString(),
        },
        spec: {
          replicas: 1,
          selector: { matchLabels: { job: 'db-migration' } },
          template: {
            spec: {
              containers: [{ name: 'migration', image: 'db-migration:1.2' }],
            },
          },
        },
        status: {
          replicas: 1,
          updatedReplicas: 0,
          readyReplicas: 0,
          availableReplicas: 0,
          conditions: [],
        },
      },
    ]

    let deployments = allDeployments
    if (namespace && namespace !== 'all') {
      deployments = allDeployments.filter((dep) => dep.metadata.namespace === namespace)
    }

    return NextResponse.json(deployments)
  } catch (error) {
    console.error('Error fetching deployments:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch deployments' },
      { status: 500 }
    )
  }
}
