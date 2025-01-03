/**
 * Service responsible for managing user operations, including user creation, login, and retrieval.
 * @module UserService
 */
import validator from "validator"

export default class UserService {
  /**
   * Constructs a new instance of the UserService.
   * @param {Object} userRepository - Repository for user-related database operations.
   * @param {Object} terminalRepository - Repository for terminal-related database operations.
   * @param {Object} otpService - Service responsible for OTP generation and validation.
   * @param {Object} responseHandler - Utility for sanitizing responses.
   * @param {Object} authMiddleware - Middleware for handling authentication and session tokens.
   * @param {Object} logger - Logging utility for debug and error messages.
   */
  constructor(userRepository, terminalRepository, otpService, responseHandler,authMiddleware, logger) {
    this.userRepository = userRepository
    this.terminalRepository = terminalRepository
    this.otpService = otpService
    this.responseHandler = responseHandler
    this.authMiddleware = authMiddleware
    this.logger = logger
  }

  /**
   * Creates a new user with the provided name, phone, and email.
   * Validates the input data and checks for existing users with the same phone number.
   * Sends OTPs to the user's phone and email.
   * @param {string} name - The name of the user.
   * @param {string} phone - The phone number of the user.
   * @param {string} email - The email address of the user.
   * @returns {Object} - The newly created user object.
   * @throws {Object} - Throws an error if any field is missing or if validation fails.
   */
  async createUser(userData, terminalId) {

    const { name, phone, email } = userData

    if (!terminalId) {
      throw { type: "MISSING_TERMINAL_ID", message: "API key (Terminal ID) is missing." }
    }

    if (!name || !phone || !email) {
      throw { type: "REQUIRED_FIELDS", message: "All fields are required" }
    }

    if (!validator.isEmail(email)) {
      throw { type: "INVALID_EMAIL", message: "Enter a valid email" }
    }

    if (!validator.isMobilePhone(phone)) {
      throw {
        type: "INVALID_PHONE_NUMBER",
        message: "Enter a valid phone number",
      }
    }

    // Check if phone number already exists
    const existingUser = await this.userRepository.findByPhone(phone)
    if (existingUser) {
      throw {
        type: "DUPLICATE_PHONE_NUMBER",
        message: "Phone number already exists",
      }
    }
    // Create new user
    const newUser = await this.userRepository.addUser(name, phone, email)
    await this.otpService.generateAndSendOTP(phone)
    await this.otpService.generateAndSendEmailOTP(email)

    return { user: newUser }
  }

  /**
   * Logs in a user by sending OTP to the phone number and email.
   * If the user does not exist, a registration message is returned.
   * @param {string} phone - The phone number of the user attempting to log in.
   * @returns {Object} - A message indicating success or the need for registration.
   * @throws {Object} - Throws an error if phone number is missing or invalid.
   */
  async userLogin(phone, terminalId) {

    if (!terminalId) {
      throw { type: "MISSING_TERMINAL_ID", message: "API key (Terminal ID) is missing." }
    }

    if (!phone) {
      throw { type: "REQUIRED_FIELDS", message: "Phone number is required" }
    }

    if (!validator.isMobilePhone(phone)) {
      throw {
        type: "INVALID_PHONE_NUMBER",
        message: "Enter a valid phone number",
      }
    }

    const user = await this.userRepository.findByPhone(phone)
    if (user) {
      await this.otpService.generateAndSendOTP(phone)
      await this.otpService.generateAndSendEmailOTP(user.email)
      return {
        message: `OTP sent to ${this.responseHandler.sanitized(phone)}}`,
      }
    } else {
      return {
        message: "User not exists, please register.",
      }
    }
  }

  /**
   * Verifies the OTP provided by the user.
   * @param {string} phone - The phone number associated with the OTP.
   * @param {string} otp - The OTP to be verified.
   * @param {string} terminalId - API key representing the terminal.
   * @returns {Object} - A message and session token on successful verification.
   * @throws {Object} - Throws an error if OTP is invalid or user not found.
   */
  async verifyOtp(phone, otp, terminalId) {

    if (!terminalId) {
      throw { type: "MISSING_TERMINAL_ID", message: "API key (Terminal ID) is missing." }
    }

    const isValid = await this.otpService.validateOtp(phone, otp)
    if (!isValid) {
      throw { type: "INVALID_OTP", message: "Invalid OTP" }
    }

    const user = await this.userRepository.findByPhone(phone)
    if (!user) {
      throw { type: "USER_NOT_FOUND", message: "User not found" }
    }

    const token = this.authMiddleware.generateUserSession(user)
    return { message: "OTP verified successfully", token }
  }

  /**
 * Verifies the provided Email OTP for a specific phone number.
 * 
 * @param {string} phone - The phone number associated with the email OTP.
 * @param {string} emailOtp - The OTP received via email.
 * @param {string} terminalId - The API key (Terminal ID) used to authenticate the request.
 * @throws Will throw an error if the terminalId is missing or the OTP is invalid.
 */
  async verifyEmailOtp(phone, emailOtp, terminalId) {

    if (!terminalId) {
      throw { type: "MISSING_TERMINAL_ID", message: "API key (Terminal ID) is missing." }
    }

    const isValid = await this.otpService.validateEmailOtp(phone, emailOtp)
    if (!isValid) {
      throw { type: "INVALID_EMAIL_OTP", message: "Invalid Email OTP" }
    }
  }

  /**
 * Resends an OTP to the user's phone number.
 * 
 * @param {string} phone - The phone number to which the OTP will be resent.
 * @param {string} terminalId - The API key (Terminal ID) used to authenticate the request.
 * @throws Will throw an error if the terminalId or phone is missing, or if the phone number is invalid.
 * @returns {object} - A success message confirming the OTP has been resent.
 */
  async resendOtp(phone, terminalId) {

    if (!terminalId) {
      throw { type: "MISSING_TERMINAL_ID", message: "API key (Terminal ID) is missing." }
    }

    if (!phone) {
      throw { type: "REQUIRED_FIELDS", message: "Phone number is required" };
    }

    if (!validator.isMobilePhone(phone)) {
      throw { type: "INVALID_PHONE_NUMBER", message: "Enter a valid phone number" };
    }

    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      throw { type: "USER_NOT_FOUND", message: "User not found" };
    }

    // Resend OTP to the user's phone
    await this.otpService.generateAndSendOTP(phone);

    return { message: `OTP resent to ${this.responseHandler.sanitized(phone)} successfully.` }
  }

  /**
 * Resends an OTP to the user's email address.
 * 
 * @param {string} email - The email address to which the OTP will be resent.
 * @param {string} terminalId - The API key (Terminal ID) used to authenticate the request.
 * @throws Will throw an error if the terminalId or email is missing, or if the email is invalid.
 * @returns {object} - A success message confirming the email OTP has been resent.
 */
  async resendEmailOtp(email, terminalId) {

    if (!terminalId) {
      throw { type: "MISSING_TERMINAL_ID", message: "API key (Terminal ID) is missing." }
    }

    if (!email) {
      throw { type: "REQUIRED_FIELDS", message: "Email is required" };
    }

    if (!validator.isEmail(email)) {
      throw { type: "INVALID_EMAIL", message: "Enter a valid email" };
    }

    // Resend email OTP to the user's email
    await this.otpService.generateAndSendEmailOTP(email);

    return { message: `Email OTP resent to ${this.responseHandler.sanitizedEmail(email)} successfully.` };
  }

  /**
 * Handles login for users at pickup locations using their phone number.
 * 
 * @param {string} phone - The user's phone number.
 * @param {string} terminalId - The API key (Terminal ID) used to authenticate the request.
 * @throws Will throw an error if the terminalId or phone is missing, or if the phone number is invalid.
 * @returns {object} - A message indicating the next steps for login (e.g., OTP or Face ID).
 */
  async pickupLogin(phone, terminalId) {
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "API key (Terminal ID) is missing."
      }
    }

    if (!phone) {
      throw { type: "REQUIRED_FIELDS", message: "Phone number is required" }
    }

    if (!validator.isMobilePhone(phone)) {
      throw {
        type: "INVALID_PHONE_NUMBER",
        message: "Enter a valid phone number"
      }
    }

    const user = await this.userRepository.findByPhone(phone)
    if (!user) {
      throw { type: "USER_NOT_FOUND", message: "User not found" }
    }

    // Check if terminal exists and handle 'faceIdRequired' condition
    const terminal = await this.terminalRepository.findTerminalByTerminalId(terminalId)
    this.logger.debug(`Finding TerminalId: ` + terminalId)
    if (!terminal) {
      throw { type: "TERMINAL_NOT_FOUND", message: "Terminal not found" }
    }

    if (terminal.faceIdRequired === true) {
      return {
        message: "Enter faceId / collect pin",
        code: "P01",
      }
    } else {
      // Send OTP if faceId is not required
      await this.otpService.generateAndSendOTP(phone)
      return {
        message: `OTP sent to ${this.responseHandler.sanitized(phone)}}`,
      }
    }
  }
}
