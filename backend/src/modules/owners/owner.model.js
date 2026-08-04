import mongoose from "mongoose";

const hotelOwnerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bussinessName: {
        type: String,
        required: true
    },
    bussinessRegNo: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const HotelOwner = mongoose.model("HotelOwner", hotelOwnerSchema);
