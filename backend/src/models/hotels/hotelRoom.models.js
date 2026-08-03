import mongoose from "mongoose";

const hotelRoomSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
    },
    room_type: {
        type: String,
        required: true
    },
    room_price_per_day: {
        type: Number,
        required: true
    },
    room_images: [
        {
            type: String
        }
    ],
    status: {
        type: String,
        enum: ["available", "booked", "maintenance"],
        default: "available"
    },
    facilities: [
        {
            type: String
        }
    ],
    max_occupancy: {
        type: Number,
        required: true
    },
    room_number: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const HotelRoom = mongoose.model("HotelRoom", hotelRoomSchema);