/**
 * Controller handling user-related operations.
 * @module UserController
 */

export default class UserController {
  /**
   * @param {Object} userService - The service object that handles user-related business logic.
   * @param {Object} logger - The logger used for logging information and errors.
   */
  constructor(userService, logger, responseHandler) {
    this.userService = userService
    this.responseHandler = responseHandler
    this.logger = logger
  }

  /**
   * Handles the user creation process by sending an OTP to the user's phone and email.
   *
   * @async
   * @param {Object} req - The request object containing user details in `req.body`.
   * @param {Object} res - The response object used to send the response.
   * @param {Function} next - The next middleware function in the request-response cycle.
   *
   * @returns {void} - Sends a success response with a message containing the OTP request.
   *
   * @throws {Error} - If any error occurs during the process, it is caught and passed to the error handler.
   */
  async createUser(req, res, next) {
    try {

      const userData = req.body
      
      const terminalId = req.headers["x-api-key"]
      
      const result = await this.userService.createUser(
        userData,
        terminalId
      )
      
      this.responseHandler.sendSuccess(res, result)
      (
        `OTP sent successfully to  +
         ${this.responseHandler.sanitized(phone)} +
           &  +
          ${this.responseHandler.sanitizedEmail(
            email
          )}. Please validate your account.`
      )
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Handles user login by initiating a login request based on the user's phone number.
   *
   * @async
   * @param {Object} req - The request object containing the user's phone number in `req.body`.
   * @param {Object} res - The response object used to send the login result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   *
   * @returns {void} - Sends a success response with the result of the login attempt.
   *
   * @throws {Error} - If any error occurs during the login process, it is caught and passed to the error handler.
   */
  async userLogin(req, res, next) {
    try {

      const { phone } = req.body

      
      const terminalId = req.headers["x-api-key"]
      
      const result = await this.userService.userLogin(phone, terminalId)
      
      this.responseHandler.sendSuccess(res, result)(result.message)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Verifies the OTP provided by the user for login or registration.
   *
   * @async
   * @param {Object} req - The request object containing the user's phone number and OTP in `req.body`.
   * @param {Object} res - The response object used to send the OTP verification result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   *
   * @returns {void} - Sends a success response after OTP verification.
   *
   * @throws {Error} - If any error occurs during the verification process, it is caught and passed to the error handler.
   */
  async verifyOTP(req, res, next) {
    try {

      const { phone, otp } = req.body

      const terminalId = req.headers["x-api-key"]

      const result = await this.userService.verifyOtp(phone, otp, terminalId)

      this.responseHandler.sendSuccess(res)("OTP verified successfully", result)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Verifies both the phone and email OTP for user registration.
   *
   * @async
   * @param {Object} req - The request object containing the user's phone, OTP, and email OTP in `req.body`.
   * @param {Object} res - The response object used to send the OTP verification result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   *
   * @returns {void} - Sends a success response after both OTP verifications.
   *
   * @throws {Error} - If any error occurs during the verification process, it is caught and passed to the error handler.
   */
  async registrationVerifyOTP(req, res, next) {
    try {

      const { phone, otp, emailOtp } = req.body

      const terminalId = req.headers["x-api-key"]

      await this.userService.verifyOtp(phone, otp, terminalId)

      await this.userService.verifyEmailOtp(phone, emailOtp, terminalId)

      const result = await this.userService.verifyOtp(phone, otp)

      this.responseHandler.sendSuccess(res)("OTP's verified successfully.", result)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Resends the OTP to the user's phone number.
   *
   * @async
   * @param {Object} req - The request object containing the user's phone number in `req.body`.
   * @param {Object} res - The response object used to send the OTP resend result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   *
   * @returns {void} - Sends a success response after resending the OTP.
   *
   * @throws {Error} - If any error occurs during the process, it is caught and passed to the error handler.
   */
  async resendOTP(req, res, next) {
    try {

      const { phone } = req.body

      const terminalId = req.headers["x-api-key"]

      const result = await this.userService.resendOtp(phone, terminalId)

      this.responseHandler.sendSuccess(res)(
        `OTP resent to ${this.responseHandler.sanitized(phone)} successfully.`
      )
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Resends the email OTP to the user's email address.
   *
   * @async
   * @param {Object} req - The request object containing the user's email in `req.body`.
   * @param {Object} res - The response object used to send the email OTP resend result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   *
   * @returns {void} - Sends a success response after resending the email OTP.
   *
   * @throws {Error} - If any error occurs during the process, it is caught and passed to the error handler.
   */
  async resendEmailOTP(req, res, next) {
    try {

      const { email } = req.body

      const terminalId = req.headers["x-api-key"]

      const result = await this.userService.resendEmailOtp(email, terminalId)

      this.responseHandler.sendSuccess(res)(
        `Email OTP resent to ${this.responseHandler.sanitizedEmail(
          email
        )} successfully.`
      )
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Initiates a login process based on the user's phone number for pickup verification.
   *
   * @async
   * @param {Object} req - The request object containing the user's phone number in `req.body`.
   * @param {Object} res - The response object used to send the pickup login result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   *
   * @returns {void} - Sends a success response with the result of the pickup login attempt.
   *
   * @throws {Error} - If any error occurs during the login process, it is caught and passed to the error handler.
   */
  async pickupLogin(req, res, next) {
    try {

      const { phone } = req.body

      const terminalId = req.headers["x-api-key"]

      const result = await this.userService.pickupLogin(phone, terminalId)
      
      this.responseHandler.sendSuccess(res, result)(result.message)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }
}
