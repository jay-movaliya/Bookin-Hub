import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    key: {
        type: Number,
    },
    otp: {
        type: Number,
    },
    isVerifiedOtp: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ["customer", "admin", "hotelOwner", "cabOwner"],
        default: "customer"
    },

    password: {
        type: String,
        required: true,
    },

}, { timestamps: true })

export const User = mongoose.model("User", userSchema)