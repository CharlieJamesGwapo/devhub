import { NextRequest, NextResponse } from 'next/server'

const DOCKER_API_URL = process.env.DOCKER_API_URL || 'http://localhost:2375'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const response = await fetch(
      `${DOCKER_API_URL}/v1.44/containers/${id}/logs?stdout=true&stderr=true&tail=100`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`)
    }

    const logsBuffer = await response.arrayBuffer()
    // Docker logs are returned as raw stream, convert to string
    const logsText = new TextDecoder().decode(logsBuffer)

    return NextResponse.json({ logs: logsText })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
