import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
    },
    latitude: {
        type: Number
    },
    averageRating: {
        type: Number
    }
});

const hotelSchema = new mongoose.Schema({
    hotel_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HotelOwner",
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: addressSchema,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    hotelImages: [
        {
            type: String
        }
    ],
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;