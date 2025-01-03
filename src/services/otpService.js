/**
 * Service responsible for handling OTP generation and validation.
 * @module OTPService
 */
export default class OTPService {
  /**
     * Initializes the OTPService class.
     * @param {Object} otpRepository - The repository object responsible for storing and retrieving OTPs.
     * @param {Object} logger - The logger object for logging messages.
     */
  constructor(otpRepository, responseHandler, logger, smsHelper) {
    this.otpRepository = otpRepository
    this.responseHandler = responseHandler
    this.smsHelper = smsHelper
    this.logger = logger
  }

  /**
   * Generates a one-time password (OTP) and sends it to the given phone number.
   * The OTP is stored in the repository for later validation.
   * In development mode, a static OTP is used.
   * @param {string} phone - The phone number to which the OTP will be sent.
   * @returns {string} - The generated OTP.
   * @throws {Object} - Throws an error if SMS sending fails or OTP generation fails.
   */
  async generateAndSendOTP(phone) {
    let otp

    // Check if the environment is development
    if (process.env.NODE_ENV === "development") {
      otp = "123456"
      this.logger.info(`Development environment: OTP is ${otp}.`)
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString()
    }

    await this.otpRepository.storeOtp(phone, otp)

    try {
      if (process.env.NODE_ENV !== "development") {
        // Send message only if it's not in development
        this.logger.info(`Sending message to phone: ${phone}`)
        //await this.smsHelper.sendMessage(phone, otp, "login")
        await this.smsHelper.sendLoginMessage(phone, otp)
        this.logger.debug(`Sending OTP + ${this.responseHandler.sanitized(phone)}`)
      } else {
        const message = `Development environment: Your OTP is ${otp}`
        this.logger.info(`Message would have been sent to ${phone}: ${message}`)
      }
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phone}: ${error.message}`)
      throw { type: "SMS_ERROR", message: "Failed to send OTP" }
    }

    return otp
  }

  /**
   * Generates a one-time password (OTP) for email verification.
   * The OTP is stored in the repository for later validation.
   * @param {string} email - The email address to which the OTP will be sent.
   * @returns {string} - The generated email OTP.
   * @throws {Object} - Throws an error if OTP generation fails.
   */
  async generateAndSendEmailOTP(email) {
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString()
    await this.otpRepository.storeEmailOtp(email, emailOtp)
    this.logger.info(`Email OTP generated for ${email}: ${emailOtp}`)
    return emailOtp
  }

  /**
   * Validates the provided OTP against the stored OTP for the given phone number.
   * @param {string} phone - The phone number associated with the OTP.
   * @param {string} otp - The OTP to validate.
   * @returns {boolean} - Returns true if the OTP matches, otherwise throws an error.
   * @throws {Object} - Throws an error if the OTP is invalid.
   */
  async validateOtp(phone, otp) {
    const storedOtp = await this.otpRepository.getOtp(phone)
    if (storedOtp !== otp) {
      throw { type: "INVALID_OTP", message: "Invalid OTP" }
    }
    return true
  }

  /**
   * Validates the provided email OTP against the stored OTP for the given phone number.
   * @param {string} phone - The phone number associated with the email OTP.
   * @param {string} emailOtp - The email OTP to validate.
   * @returns {boolean} - Returns true if the email OTP matches, otherwise throws an error.
   * @throws {Object} - Throws an error if the email OTP is invalid.
   */
  async validateEmailOtp(phone, emailOtp) {
    const storedEmailOtp = await this.otpRepository.getEmailOtp(phone)
    if (storedEmailOtp !== emailOtp) {
      throw { type: "INVALID_EMAIL_OTP", message: "Invalid Email OTP" }
    }
    return true
  }
}
