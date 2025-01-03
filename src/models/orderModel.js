import { Schema, model } from 'mongoose'
import { OrderStatus } from './enumValue.js'

const orderSchema = new Schema({
  locker: {
    type: Schema.Types.ObjectId,
    ref: 'Locker',
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  },
  terminal: {
    type: String,
  },
  fileName: {
    type: String,
  },
  dropFace: {
    type: String
  },
  collectFace: {
    type: String
  },
  matchPercentage: {
    type: String
  },
  collectPin: {
    type: String,
    required: false
  },
  lockerNumber: {
    type: Number,
    required: true
  },
  lockerPrice: {
    type: Number,
    required: true
  },
  lockerSize: {
    type: String,
    required: true
  },
  dropOffTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  pickUpTime: {
    type: Date
  },
  receiverMobile: {
    type: String
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      default: false
    },
    transactionId: {
      type: String
    }
  }],
  orderTotal: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

const Order = model('Order', orderSchema)

export default Order