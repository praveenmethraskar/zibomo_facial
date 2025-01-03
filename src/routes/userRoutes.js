import express from "express"

/**
 * UserRouter class defines routes related to user operations, such as creating users, verifying OTPs,
 * logging in, and handling OTP resend requests.
 */
export default class UserRouter {
   /**
   * Constructor for the UserRouter class.
   * Initializes the user-related routes and connects them to the Express app.
   * 
   * @param {Object} userController - The controller that handles the business logic for user-related routes.
   * @param {Object} app - The Express application instance where the routes will be mounted.
   * @param {Object} logger - The logger used for logging events related to user routes.
   */
  constructor(userController, app, logger) {
    this.userController = userController
    this.app = app
    this.logger = logger
    this.router = express.Router()

     // Define routes for user operations
    this.router.post("/createUser", this.createUser.bind(this))
    this.router.post("/registration-verify-otp", this.registrationVerifyOTP.bind(this))
    this.router.post("/login", this.userLogin.bind(this))
    this.router.post("/verify-otp", this.verifyOTP.bind(this))
    this.router.post("/resend-otp", this.resendOTP.bind(this)) 
    this.router.post("/resend-email-otp", this.resendEmailOTP.bind(this))
    this.router.post("/pickup-login", this.pickupLogin.bind(this))

    // Mount the router on the /user path
    this.app.use("/user", this.router)
  }

   /**
   * Route handler for creating a new user.
   * This method delegates the user creation logic to the user controller.
   * 
   * @param {Object} req - The Express request object, containing details for creating the user.
   * @param {Object} res - The Express response object to send back the user creation result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async createUser(req, res, next) {
    await this.userController.createUser(req, res, next)
  }

  /**
   * Route handler for verifying the OTP during user registration.
   * This method delegates the OTP verification logic to the user controller.
   * 
   * @param {Object} req - The Express request object, containing OTP verification details for registration.
   * @param {Object} res - The Express response object to send back the OTP verification result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async registrationVerifyOTP(req, res, next) {
    await this.userController.registrationVerifyOTP(req, res, next)
  }

  /**
   * Route handler for logging in a user.
   * This method delegates the login logic to the user controller.
   * 
   * @param {Object} req - The Express request object, containing login credentials.
   * @param {Object} res - The Express response object to send back the login result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async userLogin(req, res, next) {
    await this.userController.userLogin(req, res, next)
  }

  /**
   * Route handler for verifying the OTP for a user.
   * This method delegates the OTP verification logic to the user controller.
   * 
   * @param {Object} req - The Express request object, containing OTP verification details for a user.
   * @param {Object} res - The Express response object to send back the OTP verification result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async verifyOTP(req, res, next) {
    await this.userController.verifyOTP(req, res, next)
  }

  /**
   * Route handler for resending the OTP to a user.
   * This method delegates the OTP resend logic to the user controller.
   * 
   * @param {Object} req - The Express request object, containing details for resending the OTP.
   * @param {Object} res - The Express response object to send back the OTP resend result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async resendOTP(req, res, next) {
    await this.userController.resendOTP(req, res, next)
  }

  /**
   * Route handler for resending the email OTP to a user.
   * This method delegates the email OTP resend logic to the user controller.
   * 
   * @param {Object} req - The Express request object, containing details for resending the email OTP.
   * @param {Object} res - The Express response object to send back the email OTP resend result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async resendEmailOTP(req, res, next) {
    await this.userController.resendEmailOTP(req, res, next)
  }

  /**
   * Route handler for login related to pickup process.
   * This method delegates the pickup login logic to the user controller.
   * 
   * @param {Object} req - The Express request object, containing pickup login details.
   * @param {Object} res - The Express response object to send back the pickup login result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async pickupLogin(req, res, next) {
    await this.userController.pickupLogin(req, res, next)
  }
}
