import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { method, url, headers, body, response, requestName } = await request.json()

    if (!method || !url) {
      return NextResponse.json(
        { error: 'Method and URL are required' },
        { status: 400 }
      )
    }

    const prompt = `Generate comprehensive API documentation in Markdown format for the following API endpoint. Include sections for:
1. Endpoint Overview
2. Method & URL
3. Request Headers
4. Request Body (if applicable)
5. Response Example
6. Status Codes
7. Notes & Considerations

Request Details:
- Name: ${requestName || 'Unnamed API'}
- Method: ${method}
- URL: ${url}
- Headers: ${JSON.stringify(headers, null, 2)}
${body ? `- Body: ${body}` : ''}

${response ? `Response Example:
- Status: ${response.status} ${response.statusText}
- Headers: ${JSON.stringify(response.headers, null, 2)}
- Body: ${response.body}` : ''}

Generate well-formatted, professional API documentation that would be useful for developers.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const documentation = completion.choices[0].message.content || ''

    return NextResponse.json({ documentation })
  } catch (error) {
    console.error('Error generating documentation:', error)
    return NextResponse.json(
      { error: 'Failed to generate documentation. Please ensure OPENAI_API_KEY is set.' },
      { status: 500 }
    )
  }
}
