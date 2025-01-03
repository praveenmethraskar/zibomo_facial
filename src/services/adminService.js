/**
 * Service handling admin-related operations such as terminal creation and retrieval.
 * @module AdminService
 */
import bcrypt from "bcrypt"
import validator from "validator"
import { v4 as uuidv4 } from "uuid"
import Locker from "../models/locker.js"
import Terminal from "../models/terminal.js"
import Member from "../models/member.js"
import { Role } from "../models/enumValue.js"
import jwt from "jsonwebtoken"

export default class AdminService {
  /**
   * @param {Object} terminalRepository - The repository object for interacting with the terminal data.
   * @param {Object} logger - The logger used for logging information and errors.
   */
  constructor(terminalRepository, responseFormatter, logger) {
    this.terminalRepository = terminalRepository
    this.responseFormatter = responseFormatter
    this.logger = logger
  }

  /**
   * Creates a new terminal with the provided data, validates required fields, and generates necessary data.
   *
   * @async
   * @param {string} name - The name of the terminal.
   * @param {string} status - The status of the terminal (active, inactive, etc.).
   * @param {number} latitude - The latitude of the terminal's location.
   * @param {number} longitude - The longitude of the terminal's location.
   * @param {string} address - The address of the terminal.
   * @param {number} basePrice - The base price for the terminal.
   * @param {string} password - The password for the terminal.
   * @param {Array} additionalPrices - Additional pricing information.
   * @param {Object} lockers - Details of the lockers at the terminal.
   * @param {string} bluetoothMacId - The Bluetooth MAC ID for the terminal.
   * @param {boolean} dropPaymentRequired - Whether drop payment is required for the terminal.
   * @param {boolean} faceIdRequired - Whether face ID is required for the terminal.
   * @param {Array} supportedCountries - List of countries supported by the terminal.
   * @param {Object} paymentInfo - Payment information for the terminal.
   * @param {boolean} hardwareCommunication - Whether the terminal supports hardware communication.
   *
   * @returns {Object} - The created terminal object.
   *
   * @throws {Error} - Throws an error if any required fields are missing or if base price is missing when no products are present in lockers.
   */
  async createTerminal(terminalDTO) {
    const {
    name,
    status,
    latitude,
    longitude,
    address,
    basePrice,
    password,
    additionalPrices,
    lockers,
    bluetoothMacId,
    dropPaymentRequired,
    faceIdRequired,
    supportedCountries,
    paymentInfo,
    hardwareCommunication
    } = terminalDTO 
    // Validate required fields
    const missingFields = []
    if (!name) missingFields.push("name")
    if (latitude === undefined) missingFields.push("latitude")
    if (longitude === undefined) missingFields.push("longitude")
    if (!address) missingFields.push("address")
    if (!password) missingFields.push("password")
    if (!additionalPrices || additionalPrices.length === 0)
      missingFields.push("additionalPrices")
    if (!lockers) missingFields.push("lockers")
    if (!bluetoothMacId) missingFields.push("bluetoothMacId")
    if (faceIdRequired === undefined) missingFields.push("faceIdRequired")
    if (!supportedCountries) missingFields.push("supportedCountries")
    if (hardwareCommunication === undefined)
      missingFields.push("hardwareCommunication")

    if (missingFields.length > 0) {
      throw {
        type: "MISSING_FIELDS",
        message: `Missing fields: ${missingFields.join(", ")}`,
      }
    }

    // Generate terminal ID
    const terminalId = uuidv4()

    // Check if products are present in any locker
    let productsPresent = false
    for (const [size, details] of Object.entries(lockers)) {
      if (details.products && details.products.length > 0) {
        productsPresent = true
        break
      }
    }

    // Create lockers
    const lockerArray = []
    let lockerCounter = 0

    for (const [size, details] of Object.entries(lockers)) {
      for (let count = 0; count < details.count; count++) {
        lockerCounter++
        const lockerNumber = lockerCounter

        const lockerData = {
          size: size.toUpperCase(),
          lockerNumber,
          dimensions: details.dimensions,
          terminal: terminalId,
          maintenanceLogs: [],
        }

        // Add products if available in the locker
        if (details.products && details.products.length > 0) {
          lockerData.products = details.products
        }

        const locker = new Locker(lockerData)
        lockerArray.push(locker)
      }
    }

    // Hash password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10)

    // Prepare terminal data
    const terminalData = {
      name,
      terminalId,
      status,
      latitude,
      longitude,
      address,
      password: hashedPassword,
      additionalPrices,
      lockers: lockerArray,
      bluetoothMacId,
      dropPaymentRequired,
      faceIdRequired,
      supportedCountries,
      paymentInfo,
      hardwareCommunication,
      maintenanceLogs: [
        { description: "Creating terminal", performedBy: "Admin" },
      ],
    }

    // Include basePrice if no products are in lockers
    if (!productsPresent && basePrice) {
      terminalData.basePrice = basePrice
    } else if (!productsPresent && !basePrice) {
      throw {
        type: "MISSING_BASE_PRICE",
        message:
          "basePrice is required when no products are present in lockers",
      }
    }

    // Create and save terminal
    const terminal = new Terminal(terminalData)
    await terminal.save()

    this.logger.info("Terminal created successfully Id: " + terminal.terminalId)
    return terminal
  }

  /**
   * Creates a new member and stores it in the database after validation.
   *
   * @async
   * @param {Object} memberData - Data for the new member.
   * @returns {Object} - Created member object along with associated terminals.
   * @throws {Error} - Throws error for validation failures or existing entries.
   */
  async createMember(memberData) {
    const { username, password, phone, email, role, terminals, address } =
      memberData

    if (!phone)
      throw {
        type: "REQUIRED_FIELDS",
        message: "Required phone number",
      }
    if (!validator.isMobilePhone(phone, "any"))
      throw {
        type: "INVALID_PHONE_NUMBER",
        message: "Enter a valid phone number",
      }
    if (!username)
      throw {
        type: "REQUIRED_FIELDS",
        message: "Required username",
      }
    if (!email)
      throw {
        type: "REQUIRED_FIELDS",
        message: "Required email",
      }
    if (!validator.isEmail(email))
      throw {
        type: "INVALID_EMAIL",
        message: "Enter a valid email.",
      }
    if (!role)
      throw {
        type: "REQUIRED_FIELDS",
        message: "Required role",
      }
    if (!address)
      throw {
        type: "REQUIRED_FIELDS",
        message: "Required address",
      }

    const phoneMember = await Member.findOne({ phone })
    if (phoneMember) {
      throw {
        type: "PHONE_ALREADY_EXISTS",
        message: "Phone number already registered",
      }
    }

    const emailMember = await Member.findOne({ email })
    if (emailMember) {
      throw {
        type: "EMAIL_ALREADY_EXISTS",
        message: "Email already registered",
      }
    }

    const usernameMember = await Member.findOne({ username })
    if (usernameMember) {
      throw {
        type: "USERNAME_ALREADY_EXISTS",
        message: "Username already registered",
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newMember = new Member({
      username,
      password: hashedPassword,
      email,
      phone,
      role,
      terminals,
      address,
    })

    await newMember.save()

    this.logger.debug(terminals)

    // Retrieve terminal details
    const terminalList = await this.getTerminalList(terminals)

    const response = this.responseFormatter.createMemberResponse(
      newMember,
      terminalList
    )
    return response
  }

  /**
   * Authenticates a member and generates a JWT token.
   *
   * @async
   * @param {Object} loginData - Login credentials (username and password).
   * @returns {Object} - Login response including JWT token and member details.
   * @throws {Error} - Throws error for invalid credentials or non-existent members.
   */
  async login(loginData) {
    const { username, password } = loginData

    const member = await Member.findOne({ username })

    if (!member) {
      throw { type: "MEMBER_NOT_FOUND", message: "Member not found" }
    }

    const isPasswordValid = await bcrypt.compare(password, member.password)
    if (!isPasswordValid) {
      throw { type: "INVALID_CREDENTIALS", message: "Invalid credentials" }
    }

    const token = await this.generateToken(member)
    this.logger.debug(token)
    const terminalList = await this.getTerminalList(member.terminals)
    this.logger.info(`Terminals: ${JSON.stringify(terminalList)}`)

    const response = this.responseFormatter.memberLogInResponse(token, member, terminalList)
    return response
  }

  /**
   * Updates a member's information, including resetting their password.
   *
   * @async
   * @param {Object} body - Update details (e.g., currentPassword, newPassword).
   * @param {Object} user - Authenticated user performing the update.
   * @returns {Object} - Response message after successful update.
   * @throws {Error} - Throws error for invalid inputs or mismatched passwords.
   */
  async updateMember(body, user) {
    const { id } = user
    if (!id) {
      throw {
        type: "MEMBER_NOT_FOUND",
        message: "MemberId not found",
      }
    }

    const member = await Member.findById(id)
    if (!member) {
      throw {
        type: "MEMBER_NOT_FOUND",
        message: "Member not found",
      }
    }

    if (body.currentPassword && body.newPassword) {
      const isPasswordValid = await bcrypt.compare(
        body.currentPassword,
        member.password
      )

      if (body.newPassword === body.currentPassword) {
        throw {
          type: "INVALID_FIELDS",
          message: "New Password cannot be the same as Current Password",
        }
      }

      if (!isPasswordValid) {
        throw {
          type: "INVALID_PASSWORD",
          message: "Current password is incorrect",
        }
      }

      // Hash the new password and update the member object
      member.password = await bcrypt.hash(body.newPassword, 10)
    }

    // Save the updated member
    await member.save()

    return { message: "Password reset successfully, Member Updated" }
  }

  /**
   * Updates the details of a terminal.
   *
   * @async
   * @param {Object} body - Terminal update details (e.g., terminalId, newName, newStatus).
   * @returns {Object} - Updated terminal response.
   * @throws {Error} - Throws error for missing fields or non-existent terminals.
   */
  async updateTerminalDetails(body) {
    const { terminalId, newName, newStatus } = body
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "Terminal ID is missing",
      }
    }
    
    if (!newName) {
      throw {
        type: "MISSING_NEW_NAME",
        message: "New name is missing",
      }
    }

    if (!newStatus) {
      throw {
        type: "MISSING_NEW_STATUS",
        message: "New status is missing",
      }
    }

    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )

    if (!terminal) {
      throw {
        type: "TERMINAL_NOT_FOUND",
        message: "Terminal Not Found",
      }
    }

    terminal.name = newName
    terminal.status = newStatus
    await terminal.save()
    
    const response = this.responseFormatter.formatTerminalResponse(terminal)
    return response
  } 

  /**
   * Updates the pricing configurations of a terminal.
   *
   * @async
   * @param {Object} body - Pricing update details (e.g., terminalId, newBasePricing, newAdditionalPricing).
   * @param {Object} user - Authenticated user performing the update.
   * @returns {Object} - Updated pricing details.
   * @throws {Error} - Throws error for authorization failures or missing fields.
   */
  async updatePricing(body, user) {
    const { terminalId, newBasePricing, newAdditionalPricing } = body

    const { id } = user
    if (!id) {
      throw {
        type: "MEMBER_NOT_FOUND",
        message: "Member not found",
      }
    }

    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(member.role)) {
      throw{
        type: "MEMBER_NOT_AUTHORIZED",
        message: "Member is not authorized"
      }
    }

    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )

    if (!terminal) {
      throw {
        type: "TERMINAL_NOT_FOUND",
        message: "Terminal Not Found",
      }
    }

    if (newBasePricing) {
      terminal.pricing = newBasePricing
    }

    if (newAdditionalPricing) {
      terminal.additionalPrices = [...terminal.additionalPrices, ...newAdditionalPricing]
    }

    await terminal.save()
    const response = terminal
    return response
  }

  /**
   * Retrieves a terminal by its ID.
   *
   * @async
   * @param {string} terminalId - The unique ID of the terminal to retrieve.
   *
   * @returns {Object} - The terminal object retrieved from the database.
   *
   * @throws {Error} - Throws an error if the terminal ID is missing or if the terminal is not found.
   */
  async getTerminal(terminalId) {
    if (!terminalId) {
      throw {
        type: "MISSING_TERMINAL_ID",
        message: "Terminal ID is missing",
      }
    }

    const terminal = await this.terminalRepository.findTerminalByTerminalId(
      terminalId
    )

    if (!terminal) {
      throw {
        type: "TERMINAL_NOT_FOUND",
        message: "Terminal Not Found",
      }
    }
    this.logger.debug(
      `Terminal fetched successfully: ${JSON.stringify(terminal)}`
    )
    return terminal
  }

  /**
 * Fetches a list of terminals based on the provided terminal IDs.
 * For each terminal ID, retrieves the terminal details from the database 
 * and formats them into a list with relevant information.
 *
 * @param {Array<string>} terminals - Array of terminal IDs to retrieve.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of terminal details.
 *    Each object in the array contains:
 *      - terminalId: The unique ID of the terminal.
 *      - name: The name of the terminal.
 *      - address: A formatted string combining street, city, state, and postal code.
 * @throws {Error} - Throws if a terminal ID does not exist in the database.
 */
  async getTerminalList(terminals) {
    const terminalList = []
    for (const terminalId of terminals) {
      const terminal = await Terminal.findOne({ terminalId })
      if (terminal) {
        terminalList.push({
          terminalId: terminal.terminalId,
          name: terminal.name,
          address: `${terminal.address.street}, ${terminal.address.city}, ${terminal.address.state} - ${terminal.address.postalCode}`,
        })
      }
    }
    return terminalList
  }

  /**
 * Generates a JWT token for the specified member based on their role.
 * The token includes the member's ID, role, and name, and is signed 
 * with the application's secret key. The token's expiration time 
 * depends on the member's role and configuration in the environment variables.
 *
 * @param {Object} member - The member for whom the token is being generated.
 *    Properties:
 *      - _id: The unique ID of the member.
 *      - role: The role of the member (e.g., USER, ADMIN, MANAGER, SUPER_ADMIN).
 *      - name: The name of the member.
 * @returns {string} - The generated JWT token.
 * @throws {Error} - Throws if the member's role is invalid.
 */
  async generateToken(member) {
    let expiresIn

    switch (member.role) {
      case Role.USER:
        expiresIn =
          process.env.JWT_EXPIRES_USER === "unlimited"
            ? undefined
            : process.env.JWT_EXPIRES_USER
        break
      case Role.ADMIN:
        expiresIn = process.env.JWT_EXPIRES_ADMIN
        break
      case Role.MANAGER:
        expiresIn = process.env.JWT_EXPIRES_MANAGER
        break
      case Role.SUPER_ADMIN:
        expiresIn = process.env.JWT_EXPIRES_SUPER_ADMIN
        break
      default:
        throw new Error("Invalid role")
    }

    const token = jwt.sign(
      { id: member._id, role: member.role, name: member.name },
      process.env.JWT_SECRET,
      { expiresIn }
    )

    this.logger.debug(token)
    return token
  }
}

