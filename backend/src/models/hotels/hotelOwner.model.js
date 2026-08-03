import mongoose from "mongoose";

const hotelOwnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, email: {
        type: String,
        unique: true,
        required: true
    }, password: {
        type: String,
        requird: true
    }, bussinessName: {
        type: String,
        required: true
    }, bussinessRegNo: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }, otp: {
        type: Number
    },
    isVerifiedOtp: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const HotelOwner = mongoose.model("HotelOwner", hotelOwnerSchema);
