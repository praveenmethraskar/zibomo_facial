import dotenv from "dotenv"
import awilix, { asClass, asValue } from "awilix"
import express from "express"

// Import dependencies
import mongoose from "./mongo.js"
import UserRouter from "../routes/userRoutes.js"
import AdminController from '../controllers/adminController.js'
import UserController from "../controllers/userController.js"
import AdminService from '../services/adminService.js'
import UserService from "../services/userService.js"
import OTPService from "../services/otpService.js"
import TerminalRepository from '../repositories/terminalRepository.js'
import UserRepository from "../repositories/userRepository.js"
import OTPRepository from "../repositories/otprepository.js"
import config from "./config.js"
import logger from "../logging/logger.js"
import AdminRoutes from '../routes/adminRoutes.js'
import OrderController from "../controllers/orderController.js"
import OrderService from "../services/orderService.js"
import OrderRepository from "../repositories/orderRepository.js"
import OrderRouter from "../routes/orderRoutes.js"
import ResponseFormatter from "../models/response.js"
import ResponseHandler from "../utils/helperUtils.js"
import AuthMiddleware from "../middleware/authMiddleware.js"
import smsHelper from "../utils/smsHelper.js"

dotenv.config()

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.CLASSIC, // Dependency injection mode
})

// Create an Express app instance
const app = express()

// Register dependencies
container.register({
  app: asValue(app),
  logger: asValue(logger),
  userRoutes: asClass(UserRouter).scoped(),
  userController: asClass(UserController).scoped(),
  userService: asClass(UserService),
  otpService: asClass(OTPService).scoped(), // Scoped registration
  userRepository: asClass(UserRepository).inject(() => ({ db: mongoose })),
  otpRepository: asClass(OTPRepository).scoped(),
  adminController: asClass(AdminController).scoped(),
  adminService: asClass(AdminService).scoped(),
  terminalRepository: asClass(TerminalRepository).scoped(),
  adminRoutes: asClass(AdminRoutes).scoped(),
  orderController: asClass(OrderController).scoped(),
  orderService: asClass(OrderService).scoped(),
  orderRepository: asClass(OrderRepository),
  orderRouter: asClass(OrderRouter).scoped(),
  responseFormatter: asClass(ResponseFormatter).scoped(),
  responseHandler: asClass(ResponseHandler).scoped(),
  authMiddleware: asClass(AuthMiddleware).scoped(),
  smsHelper: asClass(smsHelper).scoped(),
  config: asValue(config),
})

// Initialize MongoDB
mongoose.run()

export default container
