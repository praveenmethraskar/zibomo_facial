import express from "express"

/**
 * OrderRouter class handles the routing of order-related endpoints.
 * It is responsible for defining routes for creating shipments, completing drop-offs, 
 * collecting shipments (with Face ID and non-Face ID methods), and completing orders.
 */
export default class OrderRouter {
  /**
   * Constructor for the OrderRouter class.
   * Initializes the order-related routes and connects them to the Express app.
   * 
   * @param {Object} orderController - The controller that handles the business logic for order routes.
   * @param {Object} app - The Express application instance where the routes will be mounted.
   * @param {Object} logger - The logger used to log events related to order routes.
   * @param {Object} authMiddleware - Middleware to handle authentication logic for secure routes.
   */
  constructor(orderController, app, logger, authMiddleware) {
    this.orderController = orderController
    this.app = app
    this.logger = logger
    this.authMiddleware = authMiddleware
    this.router = express.Router()

    // Define routes with authentication middleware where necessary
    this.router.post("/create-shipment", this.authMiddleware.authenticateToken.bind(this.authMiddleware), this.createShipment.bind(this))
    this.router.post("/complete-dropOff", this.authMiddleware.authenticateToken.bind(this.authMiddleware), this.completeDropOff.bind(this))
    this.router.post("/collect-shipment-faceId-v1", this.collectShipmentFaceIdV1.bind(this))
    this.router.post("/collectShipment-collect-pin-non-face-id", this.authMiddleware.authenticateToken.bind(this.authMiddleware), this.collectShipmentCollectPinNonFaceId.bind(this))
    this.router.post("/complete-order", this.completeOrder.bind(this))

    // Mount the router on the /order path
    this.app.use("/order", this.router)
  }

  /**
   * Route handler for creating a shipment.
   * This method delegates the shipment creation logic to the order controller.
   * 
   * @param {Object} req - The Express request object, containing details for creating a shipment.
   * @param {Object} res - The Express response object to send back the shipment creation result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async createShipment(req, res, next) {
    await this.orderController.createShipment(req, res, next)
  }

  /**
   * Route handler for completing a drop-off.
   * This method delegates the drop-off completion logic to the order controller.
   * 
   * @param {Object} req - The Express request object, containing details for completing the drop-off.
   * @param {Object} res - The Express response object to send back the drop-off completion result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async completeDropOff(req, res, next) {
    await this.orderController.completeDropOff(req, res, next)
  }

  /**
   * Route handler for collecting a shipment using Face ID.
   * This method delegates the logic for collecting a shipment with Face ID to the order controller.
   * 
   * @param {Object} req - The Express request object, containing Face ID details for shipment collection.
   * @param {Object} res - The Express response object to send back the shipment collection result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async collectShipmentFaceIdV1(req, res, next) {
    await this.orderController.collectShipmentFaceIdV1(req, res, next)
  }

    /**
   * Route handler for collecting a shipment using a collect pin (non-Face ID method).
   * This method delegates the logic for collecting a shipment using a collect pin to the order controller.
   * 
   * @param {Object} req - The Express request object, containing collect pin details for shipment collection.
   * @param {Object} res - The Express response object to send back the shipment collection result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
    async collectShipmentCollectPinNonFaceId(req, res, next) {
      await this.orderController.collectShipmentCollectPinNonFaceId(req, res, next)
    }

  /**
   * Route handler for completing an order.
   * This method delegates the order completion logic to the order controller.
   * 
   * @param {Object} req - The Express request object, containing order completion details.
   * @param {Object} res - The Express response object to send back the order completion result.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async completeOrder(req, res, next) {
    await this.orderController.completeOrder(req, res, next)
  }
}
