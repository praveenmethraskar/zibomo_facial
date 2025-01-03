import { Schema, model } from 'mongoose'
import { Role } from './enumValue.js'

const memberSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: Number,
        enum: Object.values(Role),
        required: true,
    },
    terminals: [{
        type: String,
    }],
    address: {
        type: String,
        required: true
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

// Middleware to update `updatedAt` on each save
memberSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

const Member = model('Member', memberSchema)

export default Member
