import Hotel from "./hotel.model.js";
import { ApiError } from "../../shared/ApiError.js";
import { ApiResponse } from "../../shared/ApiResponse.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { HotelRoom } from "../rooms/room.model.js";
import { uploadMultipleOnCloudinary } from "../../utils/cloudinary.js";

const parseArrayField = (body, fieldName) => {
    if (!body) return [];
    if (Array.isArray(body[fieldName])) return body[fieldName];
    if (typeof body[fieldName] === "string") {
        try {
            const parsed = JSON.parse(body[fieldName]);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return [body[fieldName]];
        }
    }
    const indexed = Object.keys(body)
        .filter(key => key.startsWith(`${fieldName}[`))
        .map(key => body[key]);
    return indexed.length > 0 ? indexed : [];
};

const createHotel = asyncHandler(async (req, res) => {
    if (!req.hotel_owner || !req.hotel_owner.isApproved) {
        return res.status(401).json({ message: "You are not authorized to create a hotel", status: false });
    }
    const { name, area, district, pincode, longitude, latitude, description } = req.body;

    if (!name || !area || !district || !pincode || !longitude || !latitude || !description) {
        return res.status(400).json({ message: "Please provide all the required fields", status: false });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please provide hotel images", status: false });
    }

    const hotelImages = await uploadMultipleOnCloudinary(req.files, "bookin-hub/hotels");
    if (hotelImages.length === 0) {
        return res.status(500).json({ message: "Failed to upload images to Cloudinary", status: false });
    }
    const address = { area, district, pincode, longitude, latitude };
    const parsedAmenities = parseArrayField(req.body, "amenities");

    const newHotel = await Hotel.create({
        name,
        address,
        description,
        hotelImages,
        amenities: parsedAmenities,
        status: req.body.status || "available",
        hotel_owner: req.hotel_owner._id,
        averageRating: 0
    });

    if (!newHotel) {
        return res.status(500).json({ message: "An error occurred while creating the hotel", status: false });
    }

    res.status(201).json(new ApiResponse(201, newHotel, "Hotel created successfully"));
});

const updateHotel = asyncHandler(async (req, res) => {
    const { id, name, area, district, pincode, longitude, latitude, description, status } = req.body;

    if (!id) {
        throw new ApiError(400, "Please provide a hotel id");
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    if (name) hotel.name = name;
    if (area || district || pincode) {
        hotel.address = {
            area: area || hotel.address.area,
            district: district || hotel.address.district,
            pincode: pincode || hotel.address.pincode,
            longitude: longitude || hotel.address.longitude,
            latitude: latitude || hotel.address.latitude
        };
    }
    if (description) hotel.description = description;
    if (status) hotel.status = status;

    if (req.body.amenities !== undefined || Object.keys(req.body).some(k => k.startsWith("amenities"))) {
        hotel.amenities = parseArrayField(req.body, "amenities");
    }

    await hotel.save();

    res.status(200).json(new ApiResponse(200, hotel, "Hotel updated successfully"));
});

const updateHotelStatus = asyncHandler(async (req, res) => {
    const { id, status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ message: "Please provide hotel id and status", status: false });
    }

    if (!["available", "maintenance", "blocked"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value", status: false });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
        return res.status(404).json({ message: "Hotel not found", status: false });
    }

    hotel.status = status;
    await hotel.save();

    res.status(200).json(new ApiResponse(200, hotel, "Hotel status updated successfully"));
});

const toggleBlockHotel = asyncHandler(async (req, res) => {
    const { hotel_id, status } = req.body;
    if (!hotel_id) {
        throw new ApiError(400, "Please provide a hotel id");
    }

    const hotel = await Hotel.findById(hotel_id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    const newStatus = status || (hotel.status === "blocked" ? "available" : "blocked");
    hotel.status = newStatus;
    await hotel.save();

    res.status(200).json(new ApiResponse(200, hotel, `Hotel status updated to ${newStatus}`));
});

const updateHotelImages = asyncHandler(async (req, res) => {
    const { id, existingImages = [] } = req.body;

    if (!id) {
        throw new ApiError(400, "Please provide hotel information");
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found!");
    }

    if (existingImages && existingImages.length > 0) {
        hotel.hotelImages = hotel.hotelImages.filter(
            img => existingImages.includes(img)
        );
    }
    if (existingImages.length == 0) {
        hotel.hotelImages = [];
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
        newImages = await uploadMultipleOnCloudinary(req.files, "bookin-hub/hotels");
    }

    hotel.hotelImages = [...hotel.hotelImages, ...newImages];
    await hotel.save();

    return res.status(200).json(
        new ApiResponse(200, hotel, "Hotel images updated successfully")
    );
});

const deleteHotel = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new ApiError(400, "Please provide hotel information");
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found!");
    }

    const roomsExist = await HotelRoom.exists({ hotel: id });
    if (roomsExist) {
        return res.status(400).json({ message: "Cannot delete hotel - rooms are still assigned to this hotel. Please delete all rooms first.", status: false });
    }

    await hotel.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Hotel deleted successfully"));
});

const getOwnerHotels = asyncHandler(async (req, res) => {
    const hotel_owner_id = req.hotel_owner?._id || req.body.ownerId;

    if (!hotel_owner_id) {
        throw new ApiError(400, "Please provide a hotel owner id");
    }

    const hotels = await Hotel.find({ hotel_owner: hotel_owner_id });

    const hotelsWithRoomCount = await Promise.all(
        hotels.map(async (hotel) => {
            const rooms = await HotelRoom.find({ hotel: hotel._id });
            return {
                ...hotel.toObject(),
                totalRooms: rooms.length
            };
        })
    );

    res.status(200).json(new ApiResponse(200, hotelsWithRoomCount, "Hotels retrieved successfully"));
});

const getUnapprovedHotels = asyncHandler(async (req, res) => {
    const hotels = await Hotel.find({ isApproved: false }).populate({
        path: "hotel_owner",
        populate: {
            path: "user",
            select: "name email contact gender"
        }
    });

    const hotelsWithRoomCount = await Promise.all(
        hotels.map(async (hotel) => {
            const rooms = await HotelRoom.find({ hotel: hotel._id });
            return {
                ...hotel.toObject(),
                totalRooms: rooms.length
            };
        })
    );

    res.status(200).json(new ApiResponse(200, hotelsWithRoomCount, "Unapproved hotels retrieved successfully"));
});

const getApprovedHotels = asyncHandler(async (req, res) => {
    const hotels = await Hotel.find({ isApproved: true }).populate({
        path: "hotel_owner",
        populate: {
            path: "user",
            select: "name email contact gender"
        }
    });

    const hotelsWithRoomCount = await Promise.all(
        hotels.map(async (hotel) => {
            const rooms = await HotelRoom.find({ hotel: hotel._id });
            return {
                ...hotel.toObject(),
                totalRooms: rooms.length
            };
        })
    );

    res.status(200).json(new ApiResponse(200, hotelsWithRoomCount, "Approved hotels retrieved successfully"));
});

const approveHotel = asyncHandler(async (req, res) => {
    const { hotel_id } = req.body;
    if (!hotel_id) {
        throw new ApiError(400, "Please provide a hotel id");
    }
    const hotel = await Hotel.findById(hotel_id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    hotel.isApproved = true;
    await hotel.save();

    res.status(200).json(new ApiResponse(200, hotel, "Hotel approved successfully"));
});

const rejectHotel = asyncHandler(async (req, res) => {
    const { hotel_id } = req.body;
    if (!hotel_id) {
        throw new ApiError(400, "Please provide a hotel id");
    }
    const hotel = await Hotel.findByIdAndDelete(hotel_id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    res.status(200).json(new ApiResponse(200, {}, "Hotel rejected successfully"));
});

const getHotelById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);

    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    const rooms = await HotelRoom.find({ hotel: id });

    if (rooms.length > 0) {
        const prices = rooms.map(room => room.room_price_per_day);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        hotel._doc.minPrice = minPrice;
        hotel._doc.maxPrice = maxPrice;
    } else {
        hotel._doc.minPrice = null;
        hotel._doc.maxPrice = null;
    }

    return res.status(200).json(new ApiResponse(200, hotel, "Hotel retrieved successfully"));
});

const searchHotels = asyncHandler(async (req, res) => {
    const { name, area, district, pincode } = req.query;

    const filter = { isApproved: true };
    if (name) filter.name = { $regex: name, $options: "i" };
    if (area) filter["address.area"] = { $regex: area, $options: "i" };
    if (district) filter["address.district"] = { $regex: district, $options: "i" };
    if (pincode) filter["address.pincode"] = pincode;

    try {
        let hotels = await Hotel.find(filter).lean();

        if (hotels.length === 0) {
            return res.status(404).json({ message: "No hotels found matching your criteria", status: false });
        }

        const hotelIds = hotels.map(hotel => hotel._id);

        const rooms = await HotelRoom.find({ hotel: { $in: hotelIds } });

        const hotelPriceMap = rooms.reduce((acc, room) => {
            if (!acc[room.hotel]) {
                acc[room.hotel] = [];
            }
            acc[room.hotel].push(room.room_price_per_day);
            return acc;
        }, {});

        const hotelsWithPrices = hotels.map(hotel => {
            const prices = hotelPriceMap[hotel._id.toString()] || [];
            return {
                ...hotel,
                minPrice: prices.length ? Math.min(...prices) : null,
                maxPrice: prices.length ? Math.max(...prices) : null
            };
        });

        return res.status(200).json(
            new ApiResponse(200, hotelsWithPrices, "Hotels retrieved successfully")
        );

    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while searching for hotels",
            status: false
        });
    }
});

export {
    createHotel,
    getOwnerHotels,
    searchHotels,
    updateHotel,
    updateHotelStatus,
    updateHotelImages,
    deleteHotel,
    getUnapprovedHotels,
    getApprovedHotels,
    approveHotel,
    rejectHotel,
    toggleBlockHotel,
    getHotelById
};
