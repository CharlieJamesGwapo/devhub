import { NextRequest, NextResponse } from 'next/server'

const DOCKER_API_URL = process.env.DOCKER_API_URL || 'http://localhost:2375'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${DOCKER_API_URL}/v1.44/containers/json?all=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Docker API error: ${response.statusText}`)
    }

    const containers = await response.json()

    const transformedContainers = containers.map((container: any) => ({
      Id: container.Id,
      Name: container.Names?.[0]?.replace(/^\//, '') || 'unknown',
      Image: container.Image,
      ImageID: container.ImageID,
      State: container.State,
      Status: container.Status,
      Ports: container.Ports || [],
      Labels: container.Labels || {},
      Created: container.Created,
      Command: container.Command,
    }))

    return NextResponse.json(transformedContainers)
  } catch (error) {
    console.error('Error fetching containers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch containers' },
      { status: 500 }
    )
  }
}
