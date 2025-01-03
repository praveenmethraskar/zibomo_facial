import { AsyncLocalStorage } from 'node:async_hooks'
import { v4 as uuidv4 } from 'uuid'

// ANSI escape codes for color
const COLORS = {
  INFO: '\x1b[37m',  // White
  DEBUG: '\x1b[31m', // Cyan
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m',  // Reset to default color
}

// AsyncLocalStorage instance for context propagation
const asyncLocalStorage = new AsyncLocalStorage()

// Function to get the caller's file name and line number
const getCallerInfo = () => {
  const error = new Error()
  const stack = error.stack?.split('\n')[3] // Get the 3rd line in the stack trace (caller)
  const match = stack?.match(/at .*\/([^/]+):(\d+):\d+/) // Extract file name and line number
  if (match) {
    const [, filename, line] = match
    return `[${filename}:${line}]`
  }
  return '[Unknown file:0]' // Fallback if filename and line number can't be determined
}

// Custom logger with timestamp and caller info
const logger = {
  info: function (message) {
    const timestamp = new Date().toISOString()
    const requestId = asyncLocalStorage.getStore()?.get('requestId') || 'N/A'
    const callerInfo = getCallerInfo()
    console.log(`${COLORS.INFO}[${timestamp}] [INFO] ${callerInfo} RequestID: ${requestId} | ${message}${COLORS.RESET}`)
  },
  error: function (message) {
    const timestamp = new Date().toISOString()
    const requestId = asyncLocalStorage.getStore()?.get('requestId') || 'N/A'
    const callerInfo = getCallerInfo()
    console.error(`${COLORS.ERROR}[${timestamp}] [ERROR] ${callerInfo} RequestID: ${requestId} | ${message}${COLORS.RESET}`)
  },
  warn: function (message) {
    const timestamp = new Date().toISOString()
    const requestId = asyncLocalStorage.getStore()?.get('requestId') || 'N/A'
    const callerInfo = getCallerInfo()
    console.warn(`${COLORS.WARN}[${timestamp}] [WARN] ${callerInfo} RequestID: ${requestId} | ${message}${COLORS.RESET}`)
  },
  debug: function (message) {
    const timestamp = new Date().toISOString()
    const requestId = asyncLocalStorage.getStore()?.get('requestId') || 'N/A'
    const callerInfo = getCallerInfo()
    console.debug(`${COLORS.DEBUG}[${timestamp}] [DEBUG] ${callerInfo} RequestID: ${requestId} | ${message}${COLORS.RESET}`)
  }
}

// Middleware to initialize context
export const contextMiddleware = (req, res, next) => {
  const requestId = uuidv4()
  asyncLocalStorage.run(new Map([['requestId', requestId]]), () => {
    req.requestId = requestId // Attach request ID to the request object
    next()
  })
}

export default logger
