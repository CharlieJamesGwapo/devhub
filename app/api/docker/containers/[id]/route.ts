import { NextRequest, NextResponse } from 'next/server'

const DOCKER_API_URL = process.env.DOCKER_API_URL || 'http://localhost:2375'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  try {
    if (action === 'start') {
      const response = await fetch(`${DOCKER_API_URL}/v1.44/containers/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok && response.status !== 304) {
        throw new Error(`Failed to start container: ${response.statusText}`)
      }

      return NextResponse.json({ success: true, message: 'Container started' })
    } else if (action === 'stop') {
      const response = await fetch(`${DOCKER_API_URL}/v1.44/containers/${id}/stop?t=10`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok && response.status !== 304) {
        throw new Error(`Failed to stop container: ${response.statusText}`)
      }

      return NextResponse.json({ success: true, message: 'Container stopped' })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=start or ?action=stop' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error managing container:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to manage container' },
      { status: 500 }
    )
  }
}
