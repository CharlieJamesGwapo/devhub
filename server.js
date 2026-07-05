const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocketIO } = require('./lib/socket')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Initialize Socket.io
  try {
    initSocketIO(server)
    console.log('Socket.io initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Socket.io:', error)
  }

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> DevHub is running with 15 features`)
    console.log(`> Socket.io server: ws://localhost:${port}`)
  })
})
