import mongoose from 'mongoose'
import Locker from './locker.js'
import User from './userModel.js'
import { ActionEnum } from './enumValue.js'

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    lockerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Locker,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    action: {
        type: String,
        enum: Object.values(ActionEnum),
        required: true,
    },
    pin: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
})

// Create Transaction Model
const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction
