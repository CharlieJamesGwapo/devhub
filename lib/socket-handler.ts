import { NextApiRequest, NextApiResponse } from 'next'
import { Server as HTTPServer } from 'http'
import { Socket as ServerSocket } from 'socket.io'
import { initSocketIO, getSocketIO } from './socket'

// This file provides utilities for integrating Socket.io with Next.js API routes
// and custom server setup

export function initSocketIOWithServer(server: HTTPServer) {
  return initSocketIO(server)
}

export function getIO() {
  return getSocketIO()
}

// Example usage in server.js or custom server:
// const { createServer } = require('http')
// const { parse } = require('url')
// const next = require('next')
// const { initSocketIOWithServer } = require('./lib/socket-handler')
//
// const dev = process.env.NODE_ENV !== 'production'
// const app = next({ dev })
// const handle = app.getRequestHandler()
//
// app.prepare().then(() => {
//   const server = createServer((req, res) => {
//     const parsedUrl = parse(req.url, true)
//     handle(req, res, parsedUrl)
//   })
//
//   initSocketIOWithServer(server)
//
//   server.listen(3000, (err) => {
//     if (err) throw err
//     console.log('> Ready on http://localhost:3000')
//   })
// })
