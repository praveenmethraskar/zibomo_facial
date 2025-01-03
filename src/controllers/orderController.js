/**
 * Controller handling order-related operations such as creating shipments, completing orders, 
 * and handling various collection methods.
 * @module OrderController
 */
export default class OrderController {
  /**
   * Initializes the OrderController with dependencies.
   * @param {Object} orderService - The service object that handles order-related business logic.
   * @param {Object} logger - The logger used for logging information and errors.
   * @param {Object} responseHandler - The utility for handling API responses.
   */
  constructor(orderService, logger, responseHandler) {
    this.orderService = orderService,
    this.logger = logger,
    this.responseHandler = responseHandler
  }

  /**
   * Creates a shipment based on the request body and API key.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>}
   */
  async createShipment(req, res, next) {
    try {

      const result = await this.orderService.createShipment(
        req.body,
        req.headers["x-api-key"]
      )
      
      this.responseHandler.sendSuccess(res, result)(result.message, result)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Completes the drop-off process for a shipment.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>}
   */
  async completeDropOff(req, res, next) {
    try {

      const result = await this.orderService.completeDropOff(
        req.body,
        req.headers["x-api-key"]
      )

      this.responseHandler.sendSuccess(res, result)(result.message, result)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

   /**
   * Collects a shipment using Face ID verification (version 1).
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>}
   */
  async collectShipmentFaceIdV1(req, res, next) {
    try {

      const terminalId = req.headers["x-api-key"]
      
      const result = await this.orderService.collectShipmentFaceIdV1(
        req.body,
        terminalId
      )
      
      this.responseHandler.sendSuccess(res, result)(result.message, result)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Collects a shipment using a PIN code for non-Face ID verification.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>}
   */
  async collectShipmentCollectPinNonFaceId(req, res, next) {
    try {
      
      const result = await this.orderService.collectShipmentCollectPinNonFaceId(
        req.body,
        req.headers["x-api-key"],
        req.user
      )
      
      this.responseHandler.sendSuccess(res, result)(result.message, result)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }

  /**
   * Marks an order as complete after successful pickup.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>}
   */
  async completeOrder(req, res, next) {
    try {

      const result = await this.orderService.completeOrder(
        req.body,
        req.headers["x-api-key"]
      )
      
      this.responseHandler.sendSuccess(res, result)("Pickup completed.", result)
    } catch (error) {
      this.responseHandler.sendError(next, res)(error)
    }
  }
}
