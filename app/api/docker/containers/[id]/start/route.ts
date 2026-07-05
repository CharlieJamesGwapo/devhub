import { NextRequest, NextResponse } from 'next/server'

const DOCKER_API_URL = process.env.DOCKER_API_URL || 'http://localhost:2375'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
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
  } catch (error) {
    console.error('Error starting container:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start container' },
      { status: 500 }
    )
  }
}
