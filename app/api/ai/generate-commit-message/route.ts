import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CommitMessageRequest {
  diff: string
  context?: string
  style?: 'conventional' | 'descriptive' | 'concise'
  maxMessages?: number
}

interface CommitMessage {
  title: string
  body: string
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore'
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body: CommitMessageRequest = await request.json()
    const { diff, context, style = 'conventional', maxMessages = 3 } = body

    if (!diff) {
      return NextResponse.json(
        { error: 'Missing required field: diff' },
        { status: 400 }
      )
    }

    // Truncate diff if too large (OpenAI has token limits)
    const truncatedDiff = diff.length > 5000 ? diff.substring(0, 5000) + '\n...(truncated)' : diff

    // Prepare the prompt for OpenAI
    const prompt = `You are a helpful assistant that generates clear, concise Git commit messages based on code diffs.

Code Diff:
\`\`\`
${truncatedDiff}
\`\`\`

${context ? `Additional Context: ${context}` : ''}

Please generate ${maxMessages} commit message suggestions in the following JSON format:
[
  {
    "title": "Brief one-line summary (max 72 chars)",
    "body": "Detailed explanation of changes (optional, max 100 chars)",
    "type": "feat|fix|docs|style|refactor|perf|test|chore"
  }
]

Style preference: ${style}
${style === 'conventional' ? 'Use Conventional Commits format (type(scope): description)' : ''}
${style === 'descriptive' ? 'Provide detailed descriptions' : ''}
${style === 'concise' ? 'Keep messages brief and to the point' : ''}

Guidelines:
1. Analyze the diff to understand what changed
2. Identify the type of change (feature, bug fix, documentation, etc.)
3. Write clear, descriptive commit messages that explain WHY the change was made
4. Keep titles to 72 characters or less
5. Provide up to ${maxMessages} variations of commit messages

Return ONLY the JSON array, no additional text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    })

    // Extract the text response
    const responseText = completion.choices[0]?.message?.content || ''

    // Parse the JSON response
    let messages: CommitMessage[]
    try {
      const parsed = JSON.parse(responseText)
      messages = Array.isArray(parsed) ? parsed : [parsed]
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse commit message response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error generating commit message:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to generate commit message', details: errorMessage },
      { status: 500 }
    )
  }
}
