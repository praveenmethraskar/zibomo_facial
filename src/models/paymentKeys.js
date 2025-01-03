import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  paymentBaseUrl: {
    type: String,
    required: true,
  },
  paymentUrl: {
    type: String,
    required: true,
  },
  merchantId: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  businessUnitCode: {
    type: String,
    required: true,
  },
  statusNotifyUrl: {
    type: String,
    required: true,
  },
  frontendReturnUrl: {
    type: String,
  },
  frontendBackUrl: {
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

paymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

const PaymentKeys = mongoose.model('PaymentKeys', paymentSchema)
export { paymentSchema }
export default PaymentKeys