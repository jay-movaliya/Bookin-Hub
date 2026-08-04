import { HotelRoom } from "./room.model.js";
import Hotel from "../hotels/hotel.model.js";
import { ApiError } from "../../shared/ApiError.js";
import { ApiResponse } from "../../shared/ApiResponse.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { uploadMultipleOnCloudinary } from "../../utils/cloudinary.js";

const addRooms = asyncHandler(async (req, res) => {
    const { hotel, room_type, room_price_per_day, status, facilities, max_occupancy, room_number } = req.body;

    if (!hotel || !room_type || !room_price_per_day || !status || !facilities || !max_occupancy || !room_number) {
        return res.status(400).json({ message: "Please provide all fields", status: false });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please provide room images", status: false });
    }

    const existedHotel = await Hotel.findById(hotel);
    if (!existedHotel) {
        throw new ApiError(404, "Hotel not found");
    }

    if (!existedHotel.isApproved) {
        return res.status(403).json({
            message: "Your hotel property has not been approved by the Admin yet. You cannot add rooms until your hotel is verified and approved.",
            status: false
        });
    }

    if (existedHotel.status === "blocked") {
        return res.status(403).json({
            message: "Your hotel property operation license has been suspended or blocked. Adding rooms is disabled.",
            status: false
        });
    }

    const roomImages = await uploadMultipleOnCloudinary(req.files, "bookin-hub/rooms");
    if (roomImages.length === 0) {
        return res.status(500).json({ message: "Failed to upload room images to Cloudinary", status: false });
    }

    const newRoom = await HotelRoom.create({
        hotel: hotel,
        room_type,
        room_price_per_day,
        room_images: roomImages,
        status,
        facilities,
        max_occupancy,
        room_number
    });

    if (!newRoom) {
        throw new ApiError(500, "An error occurred while adding the room");
    }

    res.status(201).json(new ApiResponse(201, newRoom, "Room added successfully"));
});

const updateRoomStatus = asyncHandler(async (req, res) => {
    const { room_id, status } = req.body;
    if (!room_id || !status) {
        throw new ApiError(400, "Please provide all the required fields");
    }
    const room = await HotelRoom.findById(room_id);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }
    room.status = status;
    await room.save();
    res.status(200).json(new ApiResponse(200, room, "Room status updated successfully"));
});

const updateRoom = asyncHandler(async (req, res) => {
    const { id, room_type, room_price_per_day, status, facilities, max_occupancy, room_number } = req.body;

    if (!id || !room_type || !room_price_per_day || !status || !facilities || !max_occupancy || !room_number) {
        return res.status(400).json({ message: "Please provide at least one field to update", status: false });
    }

    const room = await HotelRoom.findById(id);

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    room.room_type = room_type;
    room.room_price_per_day = room_price_per_day;
    room.status = status;
    room.facilities = facilities;
    room.max_occupancy = max_occupancy;
    room.room_number = room_number;
    await room.save();

    res.status(200).json(new ApiResponse(200, room, "Room updated successfully"));
});

const updateRoomImages = asyncHandler(async (req, res) => {
    const { id, existingImages = [] } = req.body;

    if (!id) {
        throw new ApiError(400, "Please provide room information");
    }

    const room = await HotelRoom.findById(id);
    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    if (existingImages && existingImages.length > 0) {
        room.room_images = room.room_images.filter(
            img => existingImages.includes(img)
        );
    }
    if (existingImages.length == 0) {
        room.room_images = [];
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
        newImages = await uploadMultipleOnCloudinary(req.files, "bookin-hub/rooms");
    }

    room.room_images = [...room.room_images, ...newImages];
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, room, "Room images updated successfully")
    );
});

const deleteRoom = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (!id) {
        throw new ApiError(400, "Please provide room information");
    }

    const room = await HotelRoom.findById(id);

    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    await room.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Room deleted successfully "));
});

const getRoomByhotelId = asyncHandler(async (req, res) => {
    const { hotelId } = req.params;

    const hotel = await HotelRoom.find({ hotel: hotelId });
    return res.status(200).json(new ApiResponse(200, hotel, "Hotel retrived successfully"));
});

const getRooms = asyncHandler(async (req, res) => {
    const { hotel_id } = req.query;
    if (!hotel_id) {
        throw new ApiError(400, "Please provide a hotel id");
    }
    const rooms = await HotelRoom.find({ hotel: hotel_id });
    if (rooms.length === 0) {
        throw new ApiError(404, "No rooms found");
    }
    res.status(200).json(new ApiResponse(200, rooms, "Rooms retrieved successfully"));
});

const getOwnerRooms = asyncHandler(async (req, res) => {
    try {
        const hotels = await Hotel.find({ hotel_owner: req.hotel_owner._id });

        if (!hotels.length) {
            return res.status(404).json({ message: "No hotels found for this owner" });
        }

        const hotelIds = hotels.map(hotel => hotel._id);

        const rooms = await HotelRoom.find({ hotel: { $in: hotelIds } });

        res.status(200).json(new ApiResponse(200, rooms, "room retrived successfully"));
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

export {
    addRooms,
    updateRoomStatus,
    updateRoom,
    updateRoomImages,
    deleteRoom,
    getRoomByhotelId,
    getRooms,
    getOwnerRooms,
};
