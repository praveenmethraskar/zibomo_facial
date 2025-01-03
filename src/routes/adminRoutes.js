import express from "express"

/**
 * Routes class for handling admin-related routes.
 * This class defines routes for creating a terminal and retrieving terminal information.
 */
export default class AdminRoutes {
  /**
   * Constructor for the AdminRoutes class.
   * Initializes routes for admin operations and connects them to the Express app.
   * 
   * @param {Object} adminController - The controller that handles the logic for admin routes.
   * @param {Object} app - The Express application instance where the routes will be mounted.
   */
  constructor(adminController, authMiddleware, app) {
    this.adminController = adminController
    this.authMiddleware = authMiddleware
    this.app = app
    this.router = express.Router()

    // Define routes
    this.router.post("/createTerminal", this.createTerminal.bind(this))
    this.router.post("/update-terminal", this.authMiddleware.authenticateToken, this.updateTerminalDetails.bind(this))
    this.router.post("/terminals/price", this.authMiddleware.authenticateToken, this.updatePricing.bind(this))
    this.router.post("/member/create", this.createMember.bind(this))
    this.router.post("/terminal/login", this.login.bind(this))
    this.router.post("/member/update", this.authMiddleware.authenticateToken, this.updateMember.bind(this))
    this.router.get("/getTerminal/:id", this.getTerminal.bind(this))

    // Mount the router on the /admin path
    this.app.use("/admin", this.router)
  }

   /**
   * Route handler for creating a terminal.
   * This method delegates the terminal creation logic to the admin controller.
   * 
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async createTerminal(req, res, next) {
    await this.adminController.createTerminal(req, res, next)
  }

  /**
 * Route handler for updating terminal details.
 * This method delegates the terminal update logic to the admin controller.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
  async updateTerminalDetails(req, res, next) {
    await this.adminController.updateTerminalDetails(req, res, next)
  }

  /**
 * Route handler for updating pricing details.
 * This method delegates the pricing update logic to the admin controller.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
  async updatePricing(req, res, next) {
    await this.adminController.updatePricing(req, res, next)
  }

  /**
 * Route handler for creating a new member.
 * This method delegates the member creation logic to the admin controller.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
  async createMember(req, res, next) {
    await this.adminController.createMember(req, res, next)
  }

  /**
 * Route handler for logging in a user.
 * This method delegates the login logic to the admin controller.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
  async login(req, res, next) {
    await this.adminController.login(req, res, next)
  }

  /**
 * Route handler for updating member details.
 * This method delegates the member update logic to the admin controller.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
  async updateMember(req, res, next) {
    await this.adminController.updateMember(req, res, next)
  }

  /**
   * Route handler for retrieving a terminal by its ID.
   * This method delegates the retrieval logic to the admin controller.
   * 
   * @param {Object} req - The Express request object, containing the terminal ID in the URL.
   * @param {Object} res - The Express response object.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async getTerminal(req, res, next) {
    await this.adminController.getTerminal(req, res, next);
  }
}
