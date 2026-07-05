import { NextRequest, NextResponse } from 'next/server'
import { getStoredLogs, addLog, clearLogs, addBatchLogs } from '@/lib/socket'

// GET: Retrieve stored logs
export async function GET(request: NextRequest) {
  try {
    const logs = getStoredLogs()
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error retrieving logs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    )
  }
}

// POST: Add a new log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, message, context, source } = body

    // Validate required fields
    if (!level || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: level, message' },
        { status: 400 }
      )
    }

    // Validate log level
    if (!['INFO', 'ERROR', 'WARN', 'DEBUG'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid log level. Must be one of: INFO, ERROR, WARN, DEBUG' },
        { status: 400 }
      )
    }

    addLog({ level, message, context, source })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding log:', error)
    return NextResponse.json(
      { error: 'Failed to add log' },
      { status: 500 }
    )
  }
}

// DELETE: Clear all logs
export async function DELETE(request: NextRequest) {
  try {
    clearLogs()
    return NextResponse.json({ success: true, message: 'All logs cleared' })
  } catch (error) {
    console.error('Error clearing logs:', error)
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    )
  }
}

// PATCH: Add batch logs
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { logs } = body

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide an array of logs.' },
        { status: 400 }
      )
    }

    // Validate each log entry
    for (const log of logs) {
      if (!log.level || !log.message) {
        return NextResponse.json(
          { error: 'Each log must have level and message' },
          { status: 400 }
        )
      }
      if (!['INFO', 'ERROR', 'WARN', 'DEBUG'].includes(log.level)) {
        return NextResponse.json(
          { error: 'Invalid log level. Must be one of: INFO, ERROR, WARN, DEBUG' },
          { status: 400 }
        )
      }
    }

    addBatchLogs(logs)

    return NextResponse.json({ success: true, count: logs.length })
  } catch (error) {
    console.error('Error adding batch logs:', error)
    return NextResponse.json(
      { error: 'Failed to add batch logs' },
      { status: 500 }
    )
  }
}
