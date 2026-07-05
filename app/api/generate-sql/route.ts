import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, schema } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = `You are an expert SQL query generator. Generate valid SQL queries based on natural language descriptions.
${schema ? `Schema context:\n${schema}\n` : ''}
Rules:
- Generate only valid SQL syntax
- Return ONLY the SQL query, no explanations
- Prefer SELECT statements
- Include comments if needed for clarity
- Use proper formatting and indentation`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const generatedSql = response.choices[0]?.message?.content?.trim() || ''

    if (!generatedSql) {
      return NextResponse.json(
        { error: 'Failed to generate SQL query' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      query: generatedSql,
      success: true
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('SQL generation error:', errorMessage)

    return NextResponse.json(
      {
        error: `Failed to generate SQL: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI SQL Generator API',
    description: 'Send a POST request with { prompt: "...", schema?: "..." } to generate SQL queries',
    example: {
      prompt: 'Get all users who signed up in the last 7 days',
      schema: 'Table: users (id, email, created_at)'
    }
  })
}
