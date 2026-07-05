import { Server as HTTPServer } from 'http'
import { Socket as ServerSocket, Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export function initSocketIO(server: HTTPServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/socket.io',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    io.on('connection', (socket: ServerSocket) => {
      console.log(`Client connected: ${socket.id}`)

      // Request initial logs
      socket.on('request-logs', (callback) => {
        const logs = getStoredLogs()
        callback(logs)
      })

      // Custom events for applications to emit logs
      socket.on('log', (logEntry: any) => {
        io?.emit('log', logEntry)
      })

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
    })
  }

  return io
}

export function getSocketIO(): SocketIOServer | null {
  return io
}

// In-memory log storage (can be replaced with database)
let storedLogs: Array<{
  id: string
  timestamp: string
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  message: string
  context?: Record<string, unknown>
  source?: string
}> = []

export function addLog(logEntry: {
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  message: string
  context?: Record<string, unknown>
  source?: string
}): void {
  const newLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...logEntry,
  }

  storedLogs.unshift(newLog)

  // Keep only last 1000 logs in memory
  if (storedLogs.length > 1000) {
    storedLogs = storedLogs.slice(0, 1000)
  }

  // Emit to all connected clients
  if (io) {
    io.emit('log', newLog)
  }
}

export function getStoredLogs() {
  return storedLogs
}

export function clearLogs(): void {
  storedLogs = []
}

export function addBatchLogs(logs: Array<{
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  message: string
  context?: Record<string, unknown>
  source?: string
}>): void {
  const newLogs = logs.map((log) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...log,
  }))

  storedLogs = [...newLogs, ...storedLogs].slice(0, 1000)

  if (io) {
    io.emit('logs:batch', newLogs)
  }
}
