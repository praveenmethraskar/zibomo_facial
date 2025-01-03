import xss from "xss"

export default class ResponseHandler {
   /**
   * Sends an error to the next middleware in the chain.
   * 
   * @param {function} next - The next middleware function to call with the error.
   * @param {object} res - The Express response object (not used in this function).
   * @returns {function} - A function that takes an error and passes it to the next middleware.
   */
  sendError(next, res) {
    return (error) => {
      next(error)
    }
  }

  /**
   * Sends a success response with a message and optional data.
   * 
   * @param {object} res - The Express response object used to send the response.
   * @param {object} result - The result object (not used in this function).
   * @returns {function} - A function that takes a message and optional data to send as JSON.
   */
  sendSuccess(res, result) {
    return (message, data = {}) => {
      res.status(200).json({ message, ...data })
    }
  }

  /**
   * Sanitizes a phone number by masking all but the last four digits.
   * 
   * @param {string} phone - The phone number to sanitize.
   * @returns {string} - The sanitized phone number, with all but the last four digits replaced by asterisks.
   */
  sanitized = (phone) => {
    if (phone.length <= 4) {
      return phone // Return as-is if too short to mask
    }
    const maskedPart = phone.slice(-4)
    const maskedNumber = "*".repeat(phone.length - 4) + maskedPart
    return xss(maskedNumber)
  }

  /**
   * Sanitizes an email address by masking the local part (before the @ symbol) while leaving the domain part intact.
   * 
   * @param {string} email - The email address to sanitize.
   * @returns {string} - The sanitized email address, with the local part masked (all but the last two characters).
   */
  sanitizedEmail = (email) => {
    const [localPart, domain] = email.split("@")

    if (!domain) {
      return xss(email) // Return as-is if the email format is invalid
    }

    if (localPart.length <= 2) {
      return xss(email) // Return as-is if too short to mask
    }

    const maskedPart = localPart.slice(-2)
    const maskedEmail =
      "*".repeat(localPart.length - 2) + maskedPart + "@" + domain
    return xss(maskedEmail)
  }
}
