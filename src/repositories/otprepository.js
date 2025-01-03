import User from "../models/userModel.js"

/**
 * Repository class for handling OTP (One Time Password) related operations.
 * This class provides methods to store and retrieve OTPs (both phone and email-based) for users.
 */
export default class OTPRepository {
  /**
   * Stores the OTP for a user identified by their phone number.
   * Updates the user's OTP field with the new OTP value.
   * 
   * @param {string} phone - The phone number of the user for whom the OTP is being stored.
   * @param {string} otp - The OTP to be stored for the user.
   * 
   * @returns {Promise<Object>} - Returns a Promise that resolves to the updated user document with the OTP stored.
   * @throws {Object} - Throws an error with type "USER_NOT_FOUND" if the user with the given phone number does not exist.
   */
  async storeOtp(phone, otp) {
    const user = await User.findOneAndUpdate({ phone }, { otp }, { new: true })
    if (!user) throw { type: "USER_NOT_FOUND", message: "User not found" }
    return user
  }

  /**
   * Stores the email OTP for a user identified by their email address.
   * Updates the user's emailOtp field with the new email OTP value.
   * 
   * @param {string} email - The email address of the user for whom the email OTP is being stored.
   * @param {string} emailOtp - The email OTP to be stored for the user.
   * 
   * @returns {Promise<Object>} - Returns a Promise that resolves to the updated user document with the email OTP stored.
   * @throws {Object} - Throws an error with type "USER_NOT_FOUND" if the user with the given email address does not exist.
   */
  async storeEmailOtp(email, emailOtp) {
    const user = await User.findOneAndUpdate(
      { email },
      { emailOtp },
      { new: true }
    )
    if (!user) throw { type: "USER_NOT_FOUND", message: "User not found" }
    return user
  }

  /**
   * Retrieves the OTP stored for a user identified by their phone number.
   * 
   * @param {string} phone - The phone number of the user whose OTP is to be retrieved.
   * 
   * @returns {Promise<string|null>} - Returns a Promise that resolves to the OTP stored for the user, or null if no OTP is found.
   */
  async getOtp(phone) {
    const user = await User.findOne({ phone })
    return user?.otp
  }

  /**
   * Retrieves the email OTP stored for a user identified by their phone number.
   * This assumes that the phone number uniquely identifies the user.
   * 
   * @param {string} phone - The phone number of the user whose email OTP is to be retrieved.
   * 
   * @returns {Promise<string|null>} - Returns a Promise that resolves to the email OTP stored for the user, or null if no email OTP is found.
   */
  async getEmailOtp(phone) {
    const user = await User.findOne({ phone  })
    return user?.emailOtp
  }
}
