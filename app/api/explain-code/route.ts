import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Please explain the following ${language} code in a clear, concise way. Focus on:
1. What the code does
2. Key functionality
3. Important concepts or patterns used
4. Potential improvements or considerations

Code:
\`\`\`${language}
${code}
\`\`\`

Provide the explanation in a readable format with sections if needed.`
        }
      ]
    })

    const explanation = completion.choices[0].message.content || ''

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error('Error explaining code:', error)
    return NextResponse.json(
      { error: 'Failed to explain code. Please ensure OPENAI_API_KEY is set.' },
      { status: 500 }
    )
  }
}
