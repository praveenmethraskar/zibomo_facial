import { expect } from "chai"
import sinon from "sinon"
import UserService from "../services/userService.js"

describe("UserService", () => {
  let userRepository,
    terminalRepository,
    otpService,
    responseHandler,
    authMiddleware,
    logger,
    userService

  beforeEach(() => {
    userRepository = {
      findByPhone: sinon.stub(),
      addUser: sinon.stub(),
    }
    terminalRepository = {}
    otpService = {
      generateAndSendOTP: sinon.stub(),
      generateAndSendEmailOTP: sinon.stub(),
    }
    responseHandler = {}
    authMiddleware = {}
    logger = {
      error: sinon.stub(),
    }

    userService = new UserService(
      userRepository,
      terminalRepository,
      otpService,
      responseHandler,
      authMiddleware,
      logger
    )
  })

  afterEach(() => {
    sinon.restore()
  })

  describe("createUser", () => {
    it("should throw an error if terminalId is missing", async () => {
      try {
        await userService.createUser({
          name: "John Doe",
          phone: "1234567890",
          email: "john@example.com",
        }) // No terminalId
      } catch (error) {
        expect(error.type).to.equal("MISSING_TERMINAL_ID")
        expect(error.message).to.equal("API key (Terminal ID) is missing.")
      }
    })

    it("should throw an error if any required field is missing", async () => {
      try {
        await userService.createUser(
          { name: "John Doe", phone: "1234567890" },
          "terminal-1"
        ) // Missing email
      } catch (error) {
        expect(error.type).to.equal("REQUIRED_FIELDS")
        expect(error.message).to.equal("All fields are required")
      }
    })

    it("should throw an error for an invalid email", async () => {
      try {
        await userService.createUser(
          { name: "John Doe", phone: "1234567890", email: "invalid-email" },
          "terminal-1"
        ) // Invalid email
      } catch (error) {
        expect(error.type).to.equal("INVALID_EMAIL")
        expect(error.message).to.equal("Enter a valid email")
      }
    })

    it("should throw an error for an invalid phone number", async () => {
      try {
        await userService.createUser(
          {
            name: "John Doe",
            phone: "invalid-phone",
            email: "john@example.com",
          },
          "terminal-1"
        ) // Invalid phone number
      } catch (error) {
        expect(error.type).to.equal("INVALID_PHONE_NUMBER")
        expect(error.message).to.equal("Enter a valid phone number")
      }
    })

    it("should throw an error if phone number already exists", async () => {
      userRepository.findByPhone.resolves({ id: 1, phone: "1234567890" }) // Simulate existing user

      try {
        await userService.createUser(
          { name: "John Doe", phone: "1234567890", email: "john@example.com" },
          "terminal-1"
        )
      } catch (error) {
        expect(error.type).to.equal("DUPLICATE_PHONE_NUMBER")
        expect(error.message).to.equal("Phone number already exists")
      }
    })

    it("should create a new user and send OTPs", async () => {
      userRepository.findByPhone.resolves(null) // No existing user with this phone
      userRepository.addUser.resolves({
        id: 1,
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
      }) // Simulate successful user creation
      otpService.generateAndSendOTP.resolves() // Simulate OTP generation
      otpService.generateAndSendEmailOTP.resolves() // Simulate email OTP generation

      const result = await userService.createUser(
        { name: "John Doe", phone: "1234567890", email: "john@example.com" },
        "terminal-1"
      )

      expect(result).to.have.property("user")
      expect(result.user).to.deep.equal({
        id: 1,
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
      })
      expect(otpService.generateAndSendOTP.calledOnceWith("1234567890")).to.be
        .true
      expect(
        otpService.generateAndSendEmailOTP.calledOnceWith("john@example.com")
      ).to.be.true
    })
  })
})

// import test from 'ava'
// import sinon from 'sinon'
// import UserService from "../services/userService.js"
// import UserRepository from "../repositories/userRepository.js"
// import OTPRepository from "../repositories/otprepository.js"

// test('UserService - createUser - Success', async t => {
//   const userRepositoryMock = {
//     findByPhone: sinon.stub().returns(null), // No existing user with this phone number
//     addUser: sinon.stub().resolves({ name: 'John Doe', phone: '+919876543210', email: 'john.doe@example.com' })
//   }

//   const otpServiceMock = {
//     generateAndSendOTP: sinon.stub().resolves('123456'),
//     generateAndSendEmailOTP: sinon.stub().resolves('123456')
//   }

//   const userService = new UserService(userRepositoryMock, otpServiceMock, null)

//   const result = await userService.createUser('John Doe', '+919876543210', 'john.doe@example.com')

//   t.deepEqual(result.user, { name: 'John Doe', phone: '+919876543210', email: 'john.doe@example.com' })
//   t.true(otpServiceMock.generateAndSendOTP.calledOnce)
//   t.true(otpServiceMock.generateAndSendEmailOTP.calledOnce)
// })

// test('UserService - createUser - Missing Fields', async t => {
//     const userRepositoryMock = {}
//     const otpServiceMock = {}

//     const userService = new UserService(userRepositoryMock, otpServiceMock, null)

//     try {
//       await userService.createUser('', '', '')
//     } catch (error) {
//       t.is(error.type, 'REQUIRED_FIELDS')
//       t.is(error.message, 'All fields are required')
//     }
//   })

//   test('UserService - createUser - Invalid Email', async t => {
//     const userRepositoryMock = {
//       findByPhone: sinon.stub().returns(null)
//     }

//     const otpServiceMock = {}

//     const userService = new UserService(userRepositoryMock, otpServiceMock, null)

//     try {
//       await userService.createUser('John Doe', '+919876543210', 'invalid-email')
//     } catch (error) {
//       t.is(error.type, 'INVALID_EMAIL')
//       t.is(error.message, 'Enter a valid email')
//     }
//   })

//   test('UserService - createUser - Invalid Phone Number', async t => {
//     const userRepositoryMock = {
//       findByPhone: sinon.stub().returns(null)
//     }

//     const otpServiceMock = {}

//     const userService = new UserService(userRepositoryMock, otpServiceMock, null)

//     try {
//       await userService.createUser('John Doe', 'invalid-phone', 'john.doe@example.com')
//     } catch (error) {
//       t.is(error.type, 'INVALID_PHONE_NUMBER')
//       t.is(error.message, 'Enter a valid phone number')
//     }
//   })

//   test('UserService - createUser - Duplicate Phone Number', async t => {
//     const userRepositoryMock = {
//       findByPhone: sinon.stub().returns({ name: 'John Doe', phone: '+919876543210', email: 'john.doe@example.com' })
//     }

//     const otpServiceMock = {}

//     const userService = new UserService(userRepositoryMock, otpServiceMock, null)

//     try {
//       await userService.createUser('John Doe', '+919876543210', 'john.doe@example.com')
//     } catch (error) {
//       t.is(error.type, 'DUPLICATE_PHONE_NUMBER')
//       t.is(error.message, 'Phone number already exists')
//     }
//   })
