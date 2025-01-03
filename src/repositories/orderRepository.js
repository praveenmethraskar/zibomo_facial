import mongoose from "mongoose"
import Order from "../models/orderModel.js"

/**
 * Repository class for handling operations related to orders in the system.
 * This class interacts with the Order model to perform CRUD operations related to orders.
 */
export default class OrderRepository {
  constructor() {}

  /**
   * Creates a new shipment/order and saves it to the database.
   * 
   * @param {Object} data - The order data to be saved, typically includes information such as user, terminal, collectPin, and other relevant order details.
   * 
   * @returns {Promise<Object>} - Returns a Promise that resolves to the created order document.
   */
  async createShipment(data) {
    const order = new Order(data)
    await order.save()
    return order
  }

  /**
   * Finds an order that is in-progress for a specific user and terminal.
   * 
   * @param {string} userId - The unique ID of the user placing the order.
   * @param {string} terminalId - The unique ID of the terminal where the order is associated.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the order document if found, or null if no matching order is found.
   */
  async findInProgressOrder(userId, terminalId) {
    return await Order.findOne({
      user: new mongoose.Types.ObjectId(userId),
      terminal: terminalId,
      status: "in-progress",
    })
  }

  /**
   * Finds an order by its unique order ID.
   * 
   * @param {string} _id - The unique ID of the order to be found.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the order document if found, or null if no matching order is found.
   */
  async findOrderByOrderId(_id) {
    return await Order.findOne({ _id })
  }

   /**
   * Finds an order by its unique order ID and updates the collectPin.
   * 
   * @param {string} _id - The unique ID of the order to be updated.
   * @param {string} collectPin - The new collect pin to be updated for the order.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the updated order document if found, or null if no matching order is found.
   */
  async findOrderAndUpdateCollectPin(_id, collectPin) {
    return await Order.findOneAndUpdate({ _id }, { collectPin })
  }

  /**
   * Finds an order by the receiver's mobile number, terminal ID, and collectPin.
   * 
   * @param {string} phone - The phone number of the receiver.
   * @param {string} terminal - The terminal ID where the order is associated.
   * @param {string} collectPin - The collect pin for the order.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the order document if found, or null if no matching order is found.
   */
  async findByMobileTerminal(phone, terminal, collectPin) {
    return await Order.findOne({ receiverMobile: phone, terminal })
  }

  /**
   * Finds an order that is in-progress for a specific receiver's mobile number, terminal, and collectPin.
   * 
   * @param {string} phone - The phone number of the receiver.
   * @param {string} terminal - The terminal ID where the order is associated.
   * @param {string} collectPin - The collect pin for the order.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the order document if found and in-progress, or null if no matching order is found.
   */
  async findInProgressOrderByCollectPin(phone, terminal, collectPin) {
    return await Order.findOne({ receiverMobile: phone, terminal, collectPin, status: "in-progress" })
  }
}
