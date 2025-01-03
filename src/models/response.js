/**
 * A utility class to format responses for various entities such as terminals, members, shipments, and drop-offs.
 */
export default class ResponseFormatter {
  /**
   * Formats the response for a terminal, including its pricing, lockers, and other details.
   * 
   * @param {Object} terminal - The terminal object containing all necessary details.
   * @returns {Object} - A formatted terminal response object.
   */
formatTerminalResponse = (terminal) => {
  const { basePrice, additionalPrices } = terminal

  // Safely destructure basePrice or set defaults if undefined
  const { prices = [], duration = null, time = null } = basePrice || {}

  // Safely destructure additionalPrices or set defaults if undefined
  const {
    prices: additionalPricesData = [],
    duration: additionalDuration = null,
    time: additionalTime = null,
    operator = null,
  } = additionalPrices || {}

  // Prepare the response object
  const response = {
    name: terminal.name,
    terminalId: terminal.terminalId,
    status: terminal.status,
    address: terminal.address,
    latitude: terminal.latitude,
    longitude: terminal.longitude,
    faceIdRequired: terminal.faceIdRequired,
    supportedCountries: terminal.supportedCountries.map((country) => ({
      name: country.name,
      code: country.code,
    })),
  }

  // Conditionally add basePrice first if it is defined
  if (basePrice && prices.length > 0) {
    response.basePrice = { prices, duration, time }
  }

  // Conditionally add additionalPrices if it is defined
  if (additionalPrices && additionalPricesData.length > 0) {
    response.additionalPrices = {
      prices: additionalPricesData,
      duration: additionalDuration,
      time: additionalTime,
      operator,
    }
  }

  // Add the rest of the properties to the response
  response.lockers = terminal.lockers.map(
    ({ size, status, lockerNumber, dimensions }) => ({
      size,
      status,
      lockerNumber,
      dimensions,
    })
  )
  response.bluetoothMacId = terminal.bluetoothMacId
  response.dropPaymentRequired = terminal.dropPaymentRequired
  response.hardwareCommunication = terminal.hardwareCommunication
  response.runners = terminal.runners
  response.maintenanceLogs = terminal.maintenanceLogs.map(
    ({ description, performedBy }) => ({
      description,
      performedBy,
    })
  )
  response.paymentInfo = this.formatPaymentInfo(terminal.paymentInfo)

  return response
}

/**
   * Formats the payment information for a terminal.
   * 
   * @param {Object} payment - The payment object containing payment details.
   * @returns {Object|null} - A formatted payment information object or null if payment is not provided.
   */
formatPaymentInfo = (payment) => {
  if (!payment) {
    return null
  }
  return {
    id: payment._id,
    paymentBaseUrl: payment.paymentBaseUrl,
    paymentUrl: payment.paymentUrl,
    merchantId: payment.merchantId,
    apiKey: payment.apiKey,
    businessUnitCode: payment.businessUnitCode,
    statusNotifyUrl: payment.statusNotifyUrl,
    frontendReturnUrl: payment.frontendReturnUrl,
    frontendBackUrl: payment.frontendBackUrl,
  }
}

/**
   * Creates a formatted response for a member, including associated terminals.
   * 
   * @param {Object} member - The member object containing details about the member.
   * @param {Array} terminals - A list of terminal details associated with the member.
   * @returns {Object} - A formatted member response object.
   */
createMemberResponse = (member, terminals) => {
  return {
    username: member.username,
    phone: member.phone,
    email: member.email,
    terminals: terminals,
    role: member.role,
    id: member._id,
    address: member.address
  }
}

/**
   * Creates a formatted login response for a member, including their token and terminals.
   * 
   * @param {string} token - The JWT token for the logged-in member.
   * @param {Object} member - The member object containing member details.
   * @param {Array} terminals - A list of terminal details associated with the member.
   * @returns {Object} - A formatted login response object.
   */
memberLogInResponse = (token, member, terminals) => {
  return {
    token: token,
    username: member.username,
    phone: member.phone,
    email: member.email,
    terminals: terminals,
    role: member.role,
  }
}

/**
   * Creates a formatted response for a shipment, including order and locker details.
   * 
   * @param {Object} response - The response object containing shipment details.
   * @returns {Object} - A formatted shipment response object.
   */
createShipmentResponse = (response) => {
  return {
    message: response.message,
    senderMobile: response.senderMobile,
    order: {
      locker: response.locker,
      user: response.user,
      status: response.status,
      terminal: response.terminal,
      collectPin: response.collectPin,
      lockerPrice: response.lockerPrice,
      lockerSize: response.lockerSize,
      receiverMobile: response.receiverMobile,
      dropOffTime: response.dropoffTime,
      lockerNumber: response.lockerNumber,
      loockerStatus: response.locker.status,
      id: response._id,
      dropFace: response.dropFace
    }
  }
}

/**
   * Creates a formatted response for completing a drop-off, including locker and terminal details.
   * 
   * @param {Object} response - The response object containing drop-off details.
   * @returns {Object} - A formatted drop-off response object.
   */
completeDropOffResponse = (response) => {
  return {
    message: response.message,
    assignedLocker: {
      id: response.assignedLocker._id,
      size: response.assignedLocker.size,
      lockerNumber: response.assignedLocker.lockerNumber,
      status: response.assignedLocker.status
    },
    terminal: response.terminalId,
    orderId: response.order._id,
    dropOffTime: response.order.dropOffTime
  }
}
}