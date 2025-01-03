import TerminalDTO from "../dto/terminalDTO.js"
/**
 * Controller handling admin-related operations such as managing terminals.
 * @module AdminController
 */
export default class AdminController {
    /**
   * @param {Object} adminService - The service object that handles admin-related business logic.
   * @param {Object} logger - The logger used for logging information and errors.
   */
  constructor(adminService, logger, responseHandler, responseFormatter) {
    this.adminService = adminService
    this.responseFormatter = responseFormatter
    this.responseHandler = responseHandler
    this.logger = logger
  }

  /**
   * Creates a new terminal by collecting details from the request body and calling the adminService to persist the data.
   * 
   * @async
   * @param {Object} req - The request object containing terminal details in `req.body`.
   * @param {Object} res - The response object used to send the success response with the created terminal data.
   * @param {Function} next - The next middleware function in the request-response cycle.
   * 
   * @returns {void} - Sends a success response with the created terminal data.
   * 
   * @throws {Error} - If any error occurs during terminal creation, it is caught and passed to the error handler.
   */
  async createTerminal(req, res, next) {
    try {
      const { terminalData } = new TerminalDTO(req.body)

      // Call service method to create terminal
      const result = await this.adminService.createTerminal(terminalData)
      
      this.responseHandler.sendSuccess(res)("Terminal created successfully", { terminal: result })
    } catch (error) {
      // Send error response
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Creates a new member based on the data provided in the request body.
   * 
   * @async
   * @param {Object} req - The request object containing member details in `req.body`.
   * @param {Object} res - The response object used to send the success response.
   * @param {Function} next - The next middleware function.
   * 
   * @returns {void}
   * @throws {Error} If any error occurs during member creation.
   */
  async createMember(req, res, next) {
    try {

      const memberData = req.body

      const newMember = await this.adminService.createMember(memberData)

      this.responseHandler.sendSuccess(res)("Member created successfully", newMember)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

   /**
   * Handles member login by validating credentials and generating a token.
   * 
   * @async
   * @param {Object} req - The request object containing login details in `req.body`.
   * @param {Object} res - The response object used to send the success response with the login token.
   * @param {Function} next - The next middleware function.
   * 
   * @returns {void}
   * @throws {Error} If any error occurs during login.
   */
  async login(req, res, next) {
    try {

      const loginData = req.body

      const response = await this.adminService.login(loginData)

      this.responseHandler.sendSuccess(res)("Login successful", response)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Updates member details based on the provided request body and authenticated user.
   * 
   * @async
   * @param {Object} req - The request object containing update data in `req.body`.
   * @param {Object} res - The response object used to send the success response.
   * @param {Function} next - The next middleware function.
   * 
   * @returns {void}
   * @throws {Error} If any error occurs during member update.
   */
  async updateMember(req, res, next) {
    try {

      const updatedMember = await this.adminService.updateMember(req.body, req.user)

      this.responseHandler.sendSuccess(res)("Password reset successfully, Member Updated", updatedMember)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Updates terminal details based on the provided data and authenticated user.
   * 
   * @async
   * @param {Object} req - The request object containing terminal details in `req.body`.
   * @param {Object} res - The response object used to send the success response.
   * @param {Function} next - The next middleware function.
   * 
   * @returns {void}
   * @throws {Error} If any error occurs during terminal update.
   */
  async updateTerminalDetails(req, res, next) {
    try {

      const response = await this.adminService.updateTerminalDetails(req.body, req.user)

      this.responseHandler.sendSuccess(res)("Terminal Details Updated Successfully", response)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Updates pricing information for terminals.
   * 
   * @async
   * @param {Object} req - The request object containing pricing details in `req.body`.
   * @param {Object} res - The response object used to send the success response.
   * @param {Function} next - The next middleware function.
   * 
   * @returns {void}
   * @throws {Error} If any error occurs during pricing update.
   */
  async updatePricing(req, res, next) {
    try {

      const response = await this.adminService.updatePricing(req.body)
      
      this.responseHandler.sendSuccess(res)("Terminal pricing updated successfully", response)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Fetches the terminal details based on the terminal ID, formats the response, and sends the data.
   * 
   * @async
   * @param {Object} req - The request object containing the terminal ID in `req.params`.
   * @param {Object} res - The response object used to send the success response with the terminal data.
   * @param {Function} next - The next middleware function in the request-response cycle.
   * 
   * @returns {void} - Sends a success response with the formatted terminal data.
   * 
   * @throws {Error} - If any error occurs during the fetching process, it is caught and passed to the error handler.
   */
  async getTerminal(req, res, next) {
    try {
      const terminalId = req.params.id

      const terminal = await this.adminService.getTerminal(terminalId)

      const formattedTerminal = this.responseFormatter.formatTerminalResponse(terminal)

      this.responseHandler.sendSuccess(res)("Terminal fetched successfully", { terminal: formattedTerminal })
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }
}

