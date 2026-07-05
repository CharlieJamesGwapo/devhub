import { NextRequest, NextResponse } from 'next/server'

const DOCKER_API_URL = process.env.DOCKER_API_URL || 'http://localhost:2375'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${DOCKER_API_URL}/v1.44/images/json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Docker API error: ${response.statusText}`)
    }

    const images = await response.json()

    const transformedImages = images.map((image: any) => ({
      Id: image.Id,
      RepoTags: image.RepoTags || [],
      Size: image.Size || 0,
      Created: image.Created || 0,
      VirtualSize: image.VirtualSize || 0,
    }))

    return NextResponse.json(transformedImages)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
