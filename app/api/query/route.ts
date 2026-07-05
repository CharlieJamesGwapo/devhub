import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Query validation helper
function isSelectQuery(query: string): boolean {
  const trimmedQuery = query.trim().toUpperCase()
  return trimmedQuery.startsWith('SELECT') ||
         trimmedQuery.startsWith('WITH')
}

// Ensure only safe queries are executed
function validateQuery(query: string): { valid: boolean; error?: string } {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return { valid: false, error: 'Query cannot be empty' }
  }

  // Only allow SELECT and WITH queries for safety
  if (!isSelectQuery(trimmedQuery)) {
    return { valid: false, error: 'Only SELECT and WITH queries are allowed' }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    // Validate query
    const validation = validateQuery(query)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Execute query using Prisma raw query
    const result = await prisma.$queryRawUnsafe(query)

    // Extract columns from result
    let columns: string[] = []
    if (Array.isArray(result) && result.length > 0) {
      columns = Object.keys(result[0])
    }

    return NextResponse.json({
      columns,
      rows: result || [],
      success: true
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Query execution error:', errorMessage)

    return NextResponse.json(
      {
        error: `Query failed: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 400 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Optional: Add GET handler for documentation
export async function GET() {
  return NextResponse.json({
    message: 'SQL Query API',
    description: 'Send a POST request with { query: "SELECT ..." } to execute queries',
    restrictions: 'Only SELECT and WITH queries are allowed for safety'
  })
}
