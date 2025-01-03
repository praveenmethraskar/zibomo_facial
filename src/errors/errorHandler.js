/**
 * Error handling middleware for managing different types of errors.
 * This function sends a response with the appropriate status code and error message based on the error type.
 *
 * @param {Object} err - The error object thrown.
 * @param {string} err.type - The type of the error (used for determining the response message and status code).
 * @param {string} err.message - The specific error message to be returned in the response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object used to send the error response.
 * @param {Function} next - The next middleware function in the stack.
 *
 * @returns {void} - Sends the error response to the client.
 */
export default function errorHandler(err, req, res, next) {
  let code = 500
  let message = "An internal server error has occurred."

  switch (err.type) {
    case "INTERNAL_SERVER_ERROR":
      code = 500
      message = "An unexpected error occurred while processing your request."
      break
    case "USER_NOT_FOUND":
      code = 404
      message = "User not found."
      break
    case "INVALID_PHONE_NUMBER":
      code = 400
      message = "Enter a valid phone number."
      break
    case "INVALID_EMAIL":
      code = 400
      message = "Enter a valid email."
      break
    case "OTP_NOT_SENT":
      code = 500
      message = "Failed to send OTP. Please try again."
      break
    case "INVALID_OTP":
      code = 400
      message = "The provided OTP is invalid."
      break
    case "OTP_EXPIRED":
      code = 400
      message = "The OTP has expired. Please request a new one."
      break
    case "MISSING_TERMINAL_ID":
      code = 400
      message = "API key (Terminal ID) is missing."
      break
    case "TERMINAL_NOT_FOUND":
      code = 404
      message = "Terminal not found."
      break
    case "LOCKER_NOT_AVAILABLE":
      code = 400
      message = "Requested locker size is not available."
      break
    case "MISSING_FACE_ID":
      code = 400
      message = "Face ID is required."
      break
    case "MISSING_COLLECT_PIN":
      code = 400
      message = "Collect Pin is required."
      break
    case "ORDER_IN_PROGRESS":
      code = 400
      message =
        "You have an order in progress. Please complete it before placing a new one."
      break
    case "USER_NOT_VERIFIED":
      code = 401
      message = "User not verified."
      break
    case "REQUIRED_FIELDS":
      code = 400
      message = "All fields are required."
      break
    case "INVALID_FIELDS":
      code = 400
      message = "Invalid locker size or price."
      break
    case "MISSING_RECEIVER_MOBILE":
      code = 400
      message = "Receiver mobile is required."
      break
    case "LOCKERS_NOT_FOUND":
      code = 404
      message = "No lockers found in the terminal."
      break
    case "LOCKER_NOT_FOUND":
      code = 404
      message = "Locker details are missing for the available locker."
      break
    case "ORDER_NOT_FOUND":
      code = 404
      message = "Order not found."
      break
    case "ORDER_STATUS_INVALID":
      code = 400
      message = `Order status is invalid: ${err.message || "not found"}`
      break
    case "REQUIRED_COLLECT_PIN":
      code = 400
      message = "Collect Pin is required"
      break
    case "COLLECT_PIN_NOT_MATCH":
      code = 400
      message = "Collect Pin does not match."
      break
    case "PHONE_ALREADY_EXISTS":
      code = 409
      message = "Phone number already registered"
      break
    case "PHONE_ALREADY_EXISTS":
      code = 409
      message = "Email already registered"
      break
    case "PHONE_ALREADY_EXISTS":
      code = 409
      message = "Username already registered"
      break
    case "INVALID_CREDENTIALS":
      code = 400
      message = "Invalid credentials"
      break
    case "MEMBER_NOT_FOUND":
      code = 404
      message = "Member not found"
      break
    case "MEMBER_NOT_AUTHORIZED":
      code = 404
      message = "Member is not authorized"
      break
    default:
      break
  }

  if (err.message) {
    message = err.message
  }

  res.status(code).json({ error: err.type, message })
}

/**
 * Utility function to send error responses.
 * This function takes the error details and responds with the appropriate status code and message.
 *
 * @param {Function} next - The next middleware function in the stack (used for passing errors to the next handler).
 * @param {Object} res - The response object used to send the error response.
 * @returns {Function} - Returns a function that accepts an error object to send the response.
 */
export const sendError = (next, res) => (error) => {
  const { type, message } = error

  switch (type) {
    case "MISSING_FIELDS":
      res.status(400).json({ message: `Required fields missing: ${message}` })
      break
    case "MISSING_BASE_PRICE":
      res.status(400).json({ message })
      break
    case "MISSING_TERMINAL_ID":
      res.status(400).json({ message })
      break
    case "TERMINAL_NOT_FOUND":
      res.status(404).json({ message })
      break
    default:
      res.status(500).json({ message: "Internal server error" })
      break
  }
}
