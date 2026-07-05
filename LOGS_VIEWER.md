# LogsViewer Component Documentation

## Overview

The LogsViewer is a real-time log viewing component for DevHub that displays application logs with filtering, search, and error highlighting capabilities. It uses Socket.io for real-time updates and color-codes logs by severity level (INFO, ERROR, WARN, DEBUG).

## Files

- **Component**: `/components/LogsViewer.tsx` - Main React component
- **Socket.io Setup**: `/lib/socket.ts` - Socket.io initialization and log management
- **API Route**: `/app/api/logs/route.ts` - API endpoints for log operations
- **Logger Utility**: `/lib/logger.ts` - Logging utility for client and server
- **Socket Handler**: `/lib/socket-handler.ts` - Socket.io integration helpers

## Features

- **Real-time Logs**: Logs stream in real-time via Socket.io
- **Search**: Search logs by message, source, or context
- **Log Level Filtering**: Filter logs by INFO, ERROR, WARN, DEBUG
- **Color Coding**: Each log level has a distinct color scheme
- **Error Highlighting**: ERROR and WARN logs are prominently displayed
- **Context Expansion**: View detailed context data for logs
- **Auto-scroll**: Automatically scroll to latest logs
- **Pause/Resume**: Pause log streaming to review specific logs
- **Download**: Export logs as a text file
- **Clear Logs**: Clear all logs with confirmation
- **Connection Status**: Visual indicator of Socket.io connection status

## Usage

### Basic Implementation

```tsx
import LogsViewer from '@/components/LogsViewer'

export default function Dashboard() {
  return (
    <div className="h-screen">
      <LogsViewer />
    </div>
  )
}
```

### Emitting Logs from Components

#### Client-side (React Component):

```tsx
'use client'

import { createClientLogger } from '@/lib/logger'
import { useEffect } from 'react'

const logger = createClientLogger('MyComponent')

export function MyComponent() {
  useEffect(() => {
    logger.info('Component mounted')

    return () => {
      logger.info('Component unmounted')
    }
  }, [])

  const handleClick = async () => {
    try {
      await saveData()
      logger.info('Data saved successfully', { timestamp: new Date() })
    } catch (error) {
      logger.error('Failed to save data', { error: String(error) })
    }
  }

  return (
    <button onClick={handleClick}>Save</button>
  )
}
```

#### Server-side (API Route):

```ts
import { createServerLogger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'

const logger = createServerLogger('DataAPI')

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    logger.info('Received request', { dataKeys: Object.keys(data) })

    // Process data...

    logger.info('Request processed successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Request failed', { error: String(error) })
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

### Using the API Directly

#### Add a Log Entry:

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "INFO",
    "message": "User logged in",
    "source": "AuthService",
    "context": { "userId": 123 }
  }'
```

#### Get All Logs:

```bash
curl http://localhost:3000/api/logs
```

#### Add Batch Logs:

```bash
curl -X PATCH http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "level": "INFO",
        "message": "App started",
        "source": "System"
      },
      {
        "level": "ERROR",
        "message": "Database connection failed",
        "source": "Database"
      }
    ]
  }'
```

#### Clear All Logs:

```bash
curl -X DELETE http://localhost:3000/api/logs
```

## Logger Methods

Both `ClientLogger` and `ServerLogger` provide the same methods:

### `info(message: string, context?: Record<string, unknown>)`

Log informational messages.

```ts
logger.info('User profile updated', { userId: 123, changes: { email: true } })
```

### `error(message: string, context?: Record<string, unknown>)`

Log error messages (highlighted in red).

```ts
logger.error('Payment processing failed', {
  error: 'Insufficient funds',
  transactionId: 'txn_123'
})
```

### `warn(message: string, context?: Record<string, unknown>)`

Log warning messages (highlighted in yellow).

```ts
logger.warn('API response time exceeded', {
  endpoint: '/api/users',
  duration: 5000
})
```

### `debug(message: string, context?: Record<string, unknown>)`

Log debug messages for development.

```ts
logger.debug('Cache hit', { key: 'user_123', ttl: 3600 })
```

## Component Props & Styling

The LogsViewer component uses Tailwind CSS with a dark theme:

- **Dark background**: `bg-gray-900`
- **ERROR logs**: Red background with red left border
- **WARN logs**: Yellow background with yellow left border
- **INFO logs**: Blue background with blue left border
- **DEBUG logs**: Gray background with gray left border

### Customization

To customize colors, edit the color constants in `LogsViewer.tsx`:

```tsx
const LOG_LEVEL_COLORS: Record<string, string> = {
  ERROR: 'bg-red-50 border-l-4 border-l-red-500 text-red-900',
  WARN: 'bg-yellow-50 border-l-4 border-l-yellow-500 text-yellow-900',
  INFO: 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-900',
  DEBUG: 'bg-gray-50 border-l-4 border-l-gray-500 text-gray-900',
}
```

## Socket.io Connection

The LogsViewer connects to Socket.io on mount:

- **Path**: `/api/socket.io`
- **Auto-reconnection**: Enabled with exponential backoff
- **Max reconnection attempts**: 5
- **Events**:
  - `log` - Single log entry
  - `logs:batch` - Multiple log entries
  - `connect` - Socket connected
  - `disconnect` - Socket disconnected

## Configuration

### Server Setup (Optional Custom Server)

For a custom Next.js server with Socket.io support, use:

```ts
// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocketIOWithServer } = require('./lib/socket-handler')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  initSocketIOWithServer(server)

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
```

Then update `package.json`:

```json
{
  "scripts": {
    "dev": "node server.js",
    "start": "NODE_ENV=production node server.js"
  }
}
```

## Best Practices

1. **Use meaningful source names**: Help identify where logs come from
   ```ts
   const logger = createClientLogger('UserProfileForm')
   ```

2. **Include context for debugging**: Add relevant data for troubleshooting
   ```ts
   logger.error('Failed to fetch user', {
     userId: id,
     endpoint: '/api/users/' + id,
     status: response.status
   })
   ```

3. **Use appropriate log levels**:
   - `INFO` - Normal application flow
   - `ERROR` - Error conditions
   - `WARN` - Potential issues
   - `DEBUG` - Detailed debugging info

4. **Filter strategically**: Use the search and level filters to find issues
   - Search by component name or error type
   - Filter by level to focus on errors or warnings

5. **Monitor patterns**: Look for repeated errors or warnings

## Troubleshooting

### Logs not appearing

1. Check Socket.io connection status (green dot in header)
2. Verify logs are being emitted correctly
3. Check browser console for errors
4. Ensure the logger source matches what you're searching for

### High memory usage

The LogsViewer keeps only the last 1000 logs in memory. If you need more:

1. Export logs regularly
2. Clear logs when done reviewing
3. Consider implementing log rotation in production

### Socket.io connection issues

1. Verify Socket.io path: `/api/socket.io`
2. Check CORS configuration in `lib/socket.ts`
3. Ensure server is running and accessible
4. Check browser network tab for connection errors

## Performance Considerations

- Logs are stored in memory (easily replaced with database)
- Max 1000 logs kept by default (configurable)
- Auto-scroll disabled when scrolled up for performance
- Search is performed client-side
- Color-coded rendering for visual hierarchy
