/**
 * Logger utility for emitting logs to the LogsViewer
 * Can be used from both client and server side
 */

export type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  source?: string
}

/**
 * Client-side logger - for use in React components
 * Emits logs via Socket.io
 */
export class ClientLogger {
  private source: string

  constructor(source: string) {
    this.source = source
  }

  private async emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          context,
          source: this.source,
        }),
      })
    } catch (error) {
      console.error('Failed to emit log:', error)
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.emit('INFO', message, context)
  }

  error(message: string, context?: Record<string, unknown>) {
    this.emit('ERROR', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.emit('WARN', message, context)
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.emit('DEBUG', message, context)
  }
}

/**
 * Server-side logger - for use in API routes and server functions
 * Imports the Socket.io utilities directly
 */
export class ServerLogger {
  private source: string

  constructor(source: string) {
    this.source = source
  }

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
    try {
      const { addLog } = require('./socket')
      addLog({ level, message, context, source: this.source })
    } catch (error) {
      console.error('Failed to emit log:', error)
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.emit('INFO', message, context)
  }

  error(message: string, context?: Record<string, unknown>) {
    this.emit('ERROR', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.emit('WARN', message, context)
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.emit('DEBUG', message, context)
  }
}

/**
 * Create a logger for a specific source
 * Usage: const logger = createLogger('ComponentName')
 *
 * Client-side:
 * logger.info('Something happened', { userId: 123 })
 *
 * Server-side:
 * logger.error('Database error', { query: 'SELECT...' })
 */
export function createClientLogger(source: string): ClientLogger {
  return new ClientLogger(source)
}

export function createServerLogger(source: string): ServerLogger {
  return new ServerLogger(source)
}

// Example usage:
// import { createClientLogger } from '@/lib/logger'
//
// const logger = createClientLogger('UserProfile')
//
// export function UserProfile() {
//   useEffect(() => {
//     logger.info('User profile loaded')
//   }, [])
//
//   const handleClick = async () => {
//     try {
//       await saveUser()
//       logger.info('User saved successfully')
//     } catch (error) {
//       logger.error('Failed to save user', { error: error.message })
//     }
//   }
// }
