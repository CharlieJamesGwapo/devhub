import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ErrorAnalysisRequest {
  errorMessage: string
  context?: Record<string, unknown>
  logLevel?: string
  source?: string
}

interface ErrorAnalysis {
  cause: string
  solutions: string[]
  relatedDocs: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body: ErrorAnalysisRequest = await request.json()
    const { errorMessage, context, logLevel, source } = body

    if (!errorMessage) {
      return NextResponse.json(
        { error: 'Missing required field: errorMessage' },
        { status: 400 }
      )
    }

    // Prepare the prompt for OpenAI
    const prompt = `Analyze the following error message and provide a structured response.

Error Message: ${errorMessage}
${logLevel ? `Log Level: ${logLevel}` : ''}
${source ? `Source: ${source}` : ''}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Please provide the analysis in the following JSON format:
{
  "cause": "Brief explanation of what caused this error",
  "solutions": ["Solution 1", "Solution 2", "Solution 3"],
  "relatedDocs": ["Relevant documentation link 1", "Relevant documentation link 2"],
  "severity": "low|medium|high|critical"
}

Focus on:
1. Identifying the root cause
2. Providing actionable solutions
3. Suggesting relevant documentation or resources
4. Assessing the severity level

Return ONLY the JSON object, no additional text.`

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
    let analysis: ErrorAnalysis
    try {
      analysis = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse analysis response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error analyzing error message:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to analyze error', details: errorMessage },
      { status: 500 }
    )
  }
}
