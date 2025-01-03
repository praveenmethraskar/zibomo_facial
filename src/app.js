import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import UserController from "./controllers/userController.js"
import AdminRoutes from "./routes/adminRoutes.js"
import OrderController from "./controllers/orderController.js"
import OrderRouter from "./routes/orderRoutes.js"
import AdminController from "./controllers/adminController.js"
import UserRouter from "./routes/userRoutes.js"
import errorHandler from "./errors/errorHandler.js"
import logger, { contextMiddleware } from "./logging/logger.js"
import container from "./config/container.js"
import config from "./config/config.js"
import * as stackTrace from "stack-trace"
import AuthMiddleware from "./middleware/authMiddleware.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(contextMiddleware)

app.use((req, res, next) => {
  const requestId = req.requestId || "N/A"

  const trace = stackTrace.get()
  const caller = trace[1]
  const filePath = caller.getFileName()
  const lineNumber = caller.getLineNumber()

  // Log incoming request
  logger.info(`Request ${req.method} ${req.url}`, {
    requestId,
    filePath,
    lineNumber,
  })

  if (req.method !== "GET") {
    logger.info(`Body: ${JSON.stringify(req.body)}`, {
      requestId,
      filePath,
      lineNumber,
    })
  }

  // Capture original send method to log response
  const originalSend = res.send.bind(res)
  res.send = function (body) {
    // Log the response
    logger.info(`Response: ${res.statusCode} ${body}`, {
      requestId,
      filePath,
      lineNumber,
    })
    res.set("X-Request-ID", requestId)
    return originalSend(body)
  }

  next()
})

const authMiddleware = new AuthMiddleware()

const adminController = container.resolve("adminController")
new AdminRoutes(adminController, authMiddleware, app, logger)
// Use container to resolve instances of services and controllers
const userController = container.resolve("userController") // Resolving from container
new UserRouter(userController, app, logger)

const orderController = container.resolve("orderController")
new OrderRouter(orderController, app, logger, authMiddleware)

app.use(errorHandler)

let environment = process.env.NODE_ENV
if (environment === "development") {
  app.listen(config[environment].port, () => {
    logger.info(`Server now listening at localhost:${config[environment].port}`)
  })
} else if (environment === "production") {
  app.listen(process.env.PORT, () => {
    logger.info(`Server now listening at localhost:${process.env.PORT}`)
  })
} else if (environment === "testing") {
  const server = app.listen(0, () => {
    const port = server.address().port
    logger.info(`Server now listening at localhost:${port}`)
  })
}

export default app
