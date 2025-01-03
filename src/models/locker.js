import mongoose from 'mongoose'
import { LockerSize, LockerStatus } from './enumValue.js'

// Product Schema
const productSchema = new mongoose.Schema({
    productId: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    imageUrl: { 
        type: String, 
        required: true 
    }
})

// Locker Schema
const lockerSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: Object.values(LockerSize),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(LockerStatus),
        default: LockerStatus.AVAILABLE,
    },
    lockerNumber: {
        type: Number,
        required: true
    },
    dimensions: {
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        depth: { type: Number, required: true },
    },
    products: [productSchema],  // New field for products (multiple products allowed)
    maintenanceLogs: [{
        date: { type: Date, default: Date.now },
        description: { type: String, required: true },
        performedBy: { type: String, required: true },
    }],
    terminal: {  // Change this line
        type: String,  // Change to String to accept UUID
        required: true,
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

// Middleware to update updatedAt timestamp on save
lockerSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

// Create Locker Model
const Locker = mongoose.model('Locker', lockerSchema)

export default Locker
export { lockerSchema, LockerStatus }
