import jwt from "jsonwebtoken"

/**
 * Authentication middleware for handling user authentication and session management using JWT (JSON Web Tokens).
 * This class includes methods to authenticate users via JWT and to generate user session tokens.
 */
export default class AuthMiddleware {
  /**
   * Middleware to authenticate a token from the request.
   * It checks for the token in the Authorization header and verifies it.
   * If the token is invalid or not present, it responds with an appropriate HTTP status code.
   * 
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function to pass control to.
   * 
   * @returns {void} - If the token is valid, the request proceeds to the next middleware.
   *                   If the token is invalid or missing, an HTTP status code is returned.
   */
authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]
  if (!token) return res.sendStatus(401) 

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) 
    req.user = user 
    next()
  })
}

 /**
   * Generates a JWT token for the user with a specified expiration time.
   * This token will contain the user's ID, phone, name, and email to identify the user.
   * 
   * @param {Object} user - The user object containing user details.
   * @param {string} user._id - The unique ID of the user.
   * @param {string} user.phone - The phone number of the user.
   * @param {string} user.name - The name of the user.
   * @param {string} user.email - The email address of the user.
   * 
   * @returns {string} - The generated JWT token containing the user's session information.
   */
generateUserSession = (user) => {
    const token = jwt.sign(
      { id: user._id, phone: user.phone, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_USER_SESSION }
    )
  
    return token
  }
}