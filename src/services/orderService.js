import { LockerStatus } from "../models/locker.js"
import validator from "validator"
import { OrderStatus } from "../models/enumValue.js"
import { calculateTotalAdditionalPrice } from "../utils/paymentHelper.js"
import { downloadImageFromAzure, uploadImageToAzure } from "../services/azureService.js"
import { uploadImageToS3, downloadImageFromS3, compareImageAndBase64 } from "../services/azureService.js";

export default class OrderService {
  constructor(
    orderRepository,
    userRepository,
    terminalRepository,
    logger,
    smsHelper,
    responseFormatter
  ) {
    this.orderRepository = orderRepository
    this.userRepository = userRepository
    this.terminalRepository = terminalRepository
    this.responseFormatter = responseFormatter
    this.smsHelper = smsHelper
    this.logger = logger
  }

  async createShipment(body, terminalId) {
    // Validate terminal ID
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "API key (Terminal ID) is missing.",
      }
    }

    // Extract values from body
    const {
      phone,
      lockerSize,
      lockerPrice,
      faceId,
      collectPin,
      receiverMobile,
      sameAsSender,
    } = body

    // Validate locker size and price
    if (!lockerSize || !lockerPrice) {
      throw { type: "INVALID_FIELDS", message: "Invalid locker size or price." }
    }

    // Fetch user by phone number
    const user = await this.userRepository.findByPhone(phone)
    if (!user) {
      throw { type: "USER_NOT_VERIFIED", message: "User not verified." }
    }

    // Fetch terminal by terminalId
    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )
    if (!terminal) {
      throw { type: "TERMINAL_NOT_FOUND", message: "Terminal not found." }
    }

    //this.logger.debug(terminal)

    if (!terminal.lockers || terminal.lockers.length === 0) {
      throw {
        type: "LOCKERS_NOT_FOUND",
        message: "No lockers found in the terminal.",
      }
    }

    this.logger.debug("Terminal Lockers: " + terminal.lockers)

    // Check if locker is available
    const lockerSizeUpperCased = lockerSize.toUpperCase()
    this.logger.debug(
      `Finding locker with size: ${lockerSizeUpperCased} and status: ${LockerStatus.AVAILABLE}`
    )

    const availableLocker = terminal.lockers.find(
      (locker) =>
        locker.size.toUpperCase() === lockerSizeUpperCased &&
        locker.status.toUpperCase() === LockerStatus.AVAILABLE.toUpperCase()
    )

    this.logger.debug("Available locker:" + availableLocker)

    if (!availableLocker) {
      throw {
        type: "LOCKER_NOT_AVAILABLE",
        message: `No available locker of the requested size: ${lockerSizeUpperCased}`,
      }
    }

    if (!availableLocker.lockerNumber || !availableLocker.size) {
      throw {
        type: "LOCKER_NOT_FOUND",
        message: "Locker details are missing for the available locker.",
      }
    }

    let order

    // If faceId is required, additional checks
    if (terminal.faceIdRequired) {
      const inProgressOrder = await this.orderRepository.findInProgressOrder(
        user._id,
        terminalId
      )
      if (inProgressOrder) {
        this.logger.warn(
          "User has a pending order: " + JSON.stringify(inProgressOrder)
        )
        throw {
          type: "ORDER_IN_PROGRESS",
          message:
            "You have an order in progress. Please complete it before placing a new one.",
        }
      }

      // Check for missing faceId or collectPin
      if (!faceId) {
        throw { type: "MISSING_FACE_ID", message: "Face ID is required." }
      }
      if (!collectPin) {
        throw {
          type: "MISSING_COLLECT_PIN",
          message: "Collect Pin is required.",
        }
      }

      // Create order with faceId
      order = await this.orderRepository.createShipment({
        user: user._id,
        lockerSize,
        lockerPrice,
        collectPin,
        lockerNumber: availableLocker.lockerNumber,
        locker: availableLocker,
        terminal: terminalId,
        receiverMobile: phone,
      })

      await order.save()
    } else {
      if (!receiverMobile) {
        throw {
          type: "MISSING_RECEIVER_MOBILE",
          message: "Receiver mobile is required.",
        }
      }

      order = await this.orderRepository.createShipment({
        user: user._id,
        receiverMobile,
        sameAsSender,
        lockerSize,
        lockerPrice,
        lockerNumber: availableLocker.lockerNumber,
        locker: availableLocker,
        terminal: terminalId,
      })
    }

    await order.save()
    const response = this.responseFormatter.createShipmentResponse(order)
    this.logger.info("Order created successfully:", response)

    return {message: "Order created successfully.", order: response.order}
  }

  async completeDropOff(body, terminalId) {
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "API key (Terminal ID) is missing.",
      }
    }

    const { orderId } = body

    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )
    if (!terminal) {
      throw { type: "TERMINAL_NOT_FOUND", message: "Terminal not found." }
    }

    let order = await this.orderRepository.findOrderByOrderId(orderId)
    if (!order) {
      throw { type: "ORDER_NOT_FOUND", message: "Order not found." }
    }

     if (order.status !== "pending") {
       throw {
         type: "ORDER_STATUS_INVALID",
         message: `Order ${order.status || "not found"}`,
       }
    }

    const locker = terminal.lockers.id(order.locker)
    if (!locker) {
      throw { type: "LOCKER_NOT_FOUND", message: `Locker not found` }
    }

    if (!terminal.faceIdRequired) {
      let collectPin
      let message
      if (process.env.NODE_ENV == "development") {
        collectPin = "1234"
        message = await this.smsHelper.collectPinMessage(locker.lockerNumber, collectPin)
        //let phone = order.receiverMobile
        //await this.smsHelper.sendCollectPinMessage(phone, collectPin, locker.lockerNumber)
        this.logger.info(`Development environment: ${message}`)
      } else {
        collectPin = Math.floor(1000 + Math.random() * 9000).toString()
        message = await collectPinMessage(locker.lockerNumber, collectPin)
        let phone = order.receiverMobile
        await this.smsHelper.sendCollectPinMessage(phone, collectPin, locker.lockerNumber)
      }
      // Update order with the collect pin
      order = await this.orderRepository.findOrderAndUpdateCollectPin(orderId, collectPin)
    }

    //if face Id is required
    //await findOrderAndUpdateLocker(terminalId, assignedLocker._id)
    order.lockerNumber = locker.lockerNumber

    order.status = OrderStatus.INPROGRESS

    await order.save()

    locker.status = LockerStatus.IN_USE
    await terminal.save()

    const orderResponse = {
      message: "Locker assigned and marked as in use successfully.",
      assignedLocker: locker,
      terminalId,
      order,
    }

    const response =
      this.responseFormatter.completeDropOffResponse(orderResponse)
    this.logger.info(
      "Locker assigned and marked as in use successfully.",
      response
    )

    return response
  }

  async collectShipmentFaceIdV1(body, terminalId) {
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "API key (Terminal ID) is missing.",
      }
    }

    const { phone } = body
    if (!phone) {
      throw { type: "REQUIRED_FIELDS", message: "Phone number is required" }
    }

    if (!validator.isMobilePhone(phone)) {
      throw {
        type: "INVALID_PHONE_NUMBER",
        message: "Enter a valid phone number",
      }
    }

    const user = await this.userRepository.findByPhone(phone)
    if (!user) {
      throw { type: "USER_NOT_FOUND", message: "User not found" }
    }

    let order = await this.orderRepository.findInProgressOrder(
      user._id,
      terminalId
    )
    if (!order) {
      throw { type: "ORDER_NOT_FOUND", message: "Order not found." }
    }

    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )
    const existingFace = await downloadImageFromAzure(order.fileName, "drop")

    if (!terminal.dropPaymentRequired) {
      return {
        message: "Match face",
        code: "M01",
        existingFace,
        orderId: order._id,
        collectPin: order.collectPin,
        locker: {
          size: order.lockerSize,
          lockerNumber: order.lockerNumber,
        },
        acceptableMatchPercentage: 80,
        dropOffTime: order.dropOffTime,
        pickUpTime: order.pickUpTime,
      }
    }

    let basePrice = terminal.basePrice.prices.find(
      (item) => item.size.toLowerCase() === order.lockerSize.toLowerCase()
    ).price

    const dropOffTime = order.dropOffTime
    const pickUpTime = new Date()
    order.pickUpTime = pickUpTime

    const lockerSize = order.lockerSize.toUpperCase()

    const totalAdditionalPrice = calculateTotalAdditionalPrice(
      lockerSize,
      pickUpTime,
      dropOffTime,
      terminal.additionalPrices
    )

    const totalPayments = order.payments
      .filter(
        (payment) => payment.status.toLowerCase() === "Approved".toLowerCase()
      )
      .reduce((sum, payment) => sum + payment.amount, 0)

    let totalCharges = totalAdditionalPrice + basePrice

    if (totalCharges > totalPayments) {
      order.lockerPrice = totalCharges
      await order.save()

      return {
        ...{
          message: "Payment required",
          code: "P01",
          basePrice: basePrice,
          locker: {
            size: order.lockerSize,
            lockerNumber: order.lockerNumber,
          },
          totalCharges: totalCharges,
          totalPaid: totalPayments,
          totalDue: totalCharges - totalPayments,
          orderId: order._id,
          userId: user._id,
          dropOffTime: dropOffTime,
          pickUpTime: pickUpTime,
          name: user.name,
          email: user.email,
          phone: user.phone,
          existingFace,
          acceptableMatchPercentage: 80,
        },
      }
    } else {
      return {
        message: "Match face",
        code: "M01",
        existingFace,
        orderId: order._id,
        collectPin: order.collectPin,
        locker: {
          size: order.lockerSize,
          lockerNumber: order.lockerNumber,
        },
        acceptableMatchPercentage: 80,
        dropOffTime: order.dropOffTime,
        pickUpTime: order.pickUpTime,
      }
    }
  }

  async collectShipmentCollectPinNonFaceId(body, terminalId, userFromBody) {
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "API key (Terminal ID) is missing.",
      }
    }

    const { phone } = userFromBody

    const user = await this.userRepository.findByPhone(phone)
    this.logger.debug(user)
    if (!user) {
      throw { type: "USER_NOT_FOUND", message: "User not found" }
    }

    const { collectPin } = body
    this.logger.debug(collectPin)
    if (!collectPin) {
      throw { type: "REQUIRED_COLLECT_PIN", message: "Collect Pin is required" }
    }

    const firstOrder = await this.orderRepository.findByMobileTerminal(
      phone,
      terminalId
    )
    if (!firstOrder) {
      throw { type: "ORDER_NOT_FOUND", message: "Order not found." }
    }

    const order = await this.orderRepository.findInProgressOrderByCollectPin(
      phone,
      terminalId,
      collectPin
    )
    if (!order) {
      throw { type: "COLLECT_PIN_NOT_MATCH", message: "Collect Pin not match" }
    }

    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )
    const terminalLocker = terminal.lockers.id(order.locker)

    const pickUpTime = new Date()

    // If drop payment is not required
    if (!terminal.dropPaymentRequired) {
      order.pickUpTime = pickUpTime

      const response = {
        message: "Pickup completed",
        orderId: order._id,
        locker: {
          size: order.lockerSize,
          lockerNumber: order.lockerNumber,
        },
        dropOffTime: order.dropOffTime,
        pickUpTime: order.pickUpTime
      }

      order.status = OrderStatus.COMPLETED
      await order.save()

      terminalLocker.status = LockerStatus.AVAILABLE
      await terminal.save()

      return response
    }

    let basePrice = terminal.basePrice.prices.find(
      (item) => item.size.toLowerCase() === order.lockerSize.toLowerCase()
    ).price

    this.logger.info(`BasePrice: ${basePrice}`)

    const dropOffTime = order.dropOffTime
    this.logger.info(`Drop off time ${dropOffTime} Pickup time ${pickUpTime}`)

    const lockerSize = order.lockerSize.toUpperCase()

    const totalAdditionalPrice = calculateTotalAdditionalPrice(
      lockerSize,
      pickUpTime,
      dropOffTime,
      terminal.additionalPrices
    )
    this.logger.info(
      `Total Additional Price: ${JSON.stringify(totalAdditionalPrice)}`
    )

    const totalPayments = order.payments
      .filter(
        (payment) => payment.status.toLowerCase() === "Approved".toLowerCase()
      )
      .reduce((sum, payment) => sum + payment.amount, 0)

    let totalCharges = totalAdditionalPrice + basePrice

    this.logger.info(`Total payment: ${totalPayments}`)

    if (totalCharges > totalPayments) {
      this.logger.info(
        `Total price for ${order.lockerSize} from ${dropOffTime} to ${pickUpTime}: ${totalAdditionalPrice}`
      )

      order.lockerPrice = totalCharges
      await order.save()

      return {
        message: "Payment required",
        code: "P01",
        basePrice: basePrice,
        locker: {
          id: order.locker,
          size: order.lockerSize,
          lockerNumber: order.lockerNumber,
        },
        totalCharges: totalCharges,
        totalPaid: totalPayments,
        totalDue: totalCharges - totalPayments,
        orderId: order.id,
        userId: order.user._id,
        dropOffTime: dropOffTime,
        pickUpTime: pickUpTime,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    }

    this.logger.info("Usage does not exceed the threshold for pricing.")
    order.pickUpTime = pickUpTime

    // If no due amount, send locker details for pickup completion
    const response = {
      message: "Pickup completed",
      orderId: order._id,
      locker: {
        size: order.lockerSize,
        lockerNumber: order.lockerNumber,
      },
      dropOffTime: order.dropOffTime,
      pickUpTime: order.pickUpTime,
      totalCharges: totalPayments,
    }

    order.status = OrderStatus.COMPLETED
    await order.save()

    terminalLocker.status = LockerStatus.AVAILABLE
    await terminal.save()

    return response
  }

  async completeOrder(body, terminalId) {
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "API key (Terminal ID) is missing.",
      }
    }

    let phoneNumber
    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )
    if (terminal.faceIdRequired) {
      const { phone } = body
      if (!phone) {
        throw { type: "REQUIRED_FIELDS", message: "Phone number is required" }
      }
      phoneNumber = phone
    } else {
      const { phone } = body
      if (!phone) {
        throw { type: "REQUIRED_FIELDS", message: "Phone number is required" }
      }
      phoneNumber = phone
    }

    const { orderId, matchPercentage, collectFace } = body
    const user = await this.userRepository.findByPhone(phoneNumber)
    if (!user) {
      throw { type: "USER_NOT_FOUND", message: "User not found" }
    }
    this.logger.info(
      `Processing order ${orderId}, match percentage: ${matchPercentage}`
    )
    const order = await this.orderRepository.findOrderByOrderId(orderId)

    if (collectFace) {
      const pickupImage = await uploadImageToAzure(
        collectFace,
        order._id,
        "pickup"
      )
      order.collectFace = pickupImage.imageUrl
    }

    order.pickUpTime = Date.now()
    order.matchPercentage = matchPercentage
    order.status = OrderStatus.COMPLETED

    await order.save()

    const terminalLocker = terminal.lockers.id(order.locker)
    terminalLocker.status = LockerStatus.AVAILABLE
    await terminal.save()

    const totalPayments = order.payments
      .filter(
        (payment) => payment.status.toLowerCase() === "Approved".toLowerCase()
      )
      .reduce((sum, payment) => sum + payment.amount, 0)

    const response = {
      lockerNumber: terminalLocker.lockerNumber,
      dropOffTime: order.dropOffTime,
      pickUpTime: order.pickUpTime,
      totalCharges: totalPayments,
    }
    return response
  }
}
