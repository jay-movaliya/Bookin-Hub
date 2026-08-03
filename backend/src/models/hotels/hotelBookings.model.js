import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HotelRoom",
        required: true,
    },
    bookingStartDate: {
        type: Date,
        required: true,
    },
    bookingEndDate: {
        type: Date,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
    },
    bookingStatus: {
        type: String,
        enum: ["confirmed", "cancelled", "completed"],
        default: "confirmed",
    },
    personDetails: [{
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        aadhar: {
            type: String,
            required: true,
        },
    }],
}, { timestamps: true });

export const HotelBooking = mongoose.model("HotelBooking", hotelBookingSchema);
