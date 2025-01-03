import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false
  },
  otp: {
    type: String,
    required: false
  },
  emailOtp: {
    type: String,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false,
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

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

const User = mongoose.model('User', userSchema)
export default User