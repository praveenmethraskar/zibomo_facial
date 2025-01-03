import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { lockerSchema } from "./locker.js"
import { LockerSize, TerminalStatus, TerminalCommunicationType } from "./enumValue.js"
import { paymentSchema } from "./paymentKeys.js"

// Price Schema (Base Price and Additional Price)
const priceSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: Object.values(LockerSize),
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
})

// Pricing Schema (Shared between basePrice and additionalPrices)
const pricingSchema = new mongoose.Schema({
  duration: {
    type: String,
    required: true,
    enum: ["hour", "day", "week", "month"],
  },
  time: {
    type: Number,
    required: true,
  },
  operator: {
    type: String,
    enum: ["+", "-", "*", "/"],
    required: false, // Make operator optional
  },
  prices: [priceSchema], // Array of prices for different locker sizes
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Terminal Schema
const terminalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  terminalId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },
  status: {
    type: String,
    enum: Object.values(TerminalStatus),
    default: TerminalStatus.ACTIVE,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  basePrice: {
    type: pricingSchema,
    required: false,
  },
  additionalPrices: {
    type: pricingSchema,
    required: true,
  },
  paymentInfo: {
    type: paymentSchema,
    required: false,
  },
  lockers: [lockerSchema],
  bluetoothMacId: {
    type: String,
    required: true,
  },
  dropPaymentRequired: {
    type: Boolean,
    default: false,
  },
  faceIdRequired: {
    type: Boolean,
    default: false,
  },
  allowedManualSessionsPerMonth: {
    type: Number,
    default: 20,
  },
  hardwareCommunication: {
    type: String,
    enum: Object.values(TerminalCommunicationType),
    required: true,
  },
  runners: {
    type: [String],
    default: [],
  },
  maintenanceLogs: [
    {
      date: { type: Date, default: Date.now },
      description: { type: String, required: true },
      performedBy: { type: String, required: true },
    },
  ],
  supportedCountries: [
    {
      name: { type: String, required: true },
      code: { type: String, required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Middleware to update updatedAt timestamp on save
pricingSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

terminalSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Terminal = mongoose.model("Terminal", terminalSchema)

export default Terminal
// export default TerminalPricing
