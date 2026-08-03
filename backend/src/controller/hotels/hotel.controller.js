import Hotel from "../../models/hotels/hotel.models.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HotelRoom } from "../../models/hotels/hotelRoom.models.js";


//====================== Hotel CRUD ========================
const createHotel = asyncHandler(async (req, res) => {


    //check if the hotel owner is approved
    if (!req.hotel_owner || !req.hotel_owner.isApproved) {
        return res.status(401).json({ message: "You are not authorized to create a hotel", status: false });
    }
    //get the deatails 
    const { name, area, district, pincode, longitude, latitude, description } = req.body;

    //validate
    if (!name || !area || !district || !pincode || !longitude || !latitude || !description) {
        //throw new ApiError(400, "Please provide all the required fields");
        return res.status(400).json({ message: "Please provide all the required fields", status: false });
    }

    //check the hotel images
    if (!req.files || req.files.length === 0) {
        // throw new ApiError(400, "Please provide hotel images");
        return res.status(400).json({ message: "Please provide hotel images", status: false });
    }

    //make array of images 
    const hotelImages = req.files.map(file => file.path)

    //make obj of address
    const address = { area, district, pincode, longitude, latitude };

    //created hotel
    const newHotel = await Hotel.create({
        name,
        address,
        description,
        hotelImages,
        hotel_owner: req.hotel_owner._id,
        averageRating: 0
    });

    //check for error if not created 
    if (!newHotel) {
        return res.status(500).json({ message: "An error occurred while creating the hotel", status: false });
    }

    //send the response
    res.status(201).json(new ApiResponse(201, newHotel, "Hotel created successfully"));
});

const updateHotel = asyncHandler(async (req, res) => {

    //get the deatails
    const { id, name, area, district, pincode, longitude, latitude, description } = req.body;

    //check for hotel id
    if (!id) {
        throw new ApiError(400, "Please provide a hotel id");
    }

    //validate 
    if (!name || !area || !district || !pincode || !longitude || !latitude || !description) {
        return res.status(400).json({ message: "Please provide at least one field to update", status: false })
    }


    const address = { area, district, pincode, longitude, latitude };

    //find the hotel
    const hotel = await Hotel.findById(id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    //update
    hotel.name = name;
    hotel.address = address;
    hotel.description = description;
    await hotel.save();

    res.status(200).json(new ApiResponse(200, hotel, "Hotel updated successfully"));
});

const updateHotelImages = asyncHandler(async (req, res) => {
    // Get the id and deleted images array from request
    const { id, existingImages = [] } = req.body;

    // Validate
    if (!id) {
        throw new ApiError(400, "Please provide hotel information");
    }

    // Find the hotel
    const hotel = await Hotel.findById(id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found!");
    }

    // Handle image deletions
    if (existingImages && existingImages.length > 0) {
        // Filter out the deleted images
        hotel.hotelImages = hotel.hotelImages.filter(
            img => existingImages.includes(img)
        );

    }
    if (existingImages.length == 0) {
        hotel.hotelImages = []
    }

    // Handle new image uploads
    let newImages = [];
    if (req.files && req.files.length > 0) {
        newImages = req.files.map(file => file.path);
    }

    // Update the hotel images (keep existing + add new)
    hotel.hotelImages = [...hotel.hotelImages, ...newImages];
    await hotel.save();

    return res.status(200).json(
        new ApiResponse(200, hotel, "Hotel images updated successfully")
    );
});

const deleteHotel = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Validate input
    if (!id) {
        throw new ApiError(400, "Please provide hotel information");
    }

    // Find the hotel
    const hotel = await Hotel.findById(id);
    if (!hotel) {
        throw new ApiError(404, "Hotel not found!");
    }

    // Check if any rooms exist for this hotel
    const roomsExist = await HotelRoom.exists({ hotel: id });
    if (roomsExist) {
        return res.status(400).json({ message: "Cannot delete hotel - rooms are still assigned to this hotel. Please delete all rooms first.", status: false });
    }

    // If no rooms exist, proceed with hotel deletion
    await hotel.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Hotel deleted successfully"));
});
const getOwnerHotels = asyncHandler(async (req, res) => {
    const hotel_owner_id = req.hotel_owner?._id || req.body.ownerId;

    if (!hotel_owner_id) {
        throw new ApiError(400, "Please provide a hotel owner id");
    }

    // Find all hotels owned by the owner
    const hotels = await Hotel.find({ hotel_owner: hotel_owner_id });

    // For each hotel, find its rooms and add the room count
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
    const hotels = await Hotel.find({ isApproved: false });

    res.status(200).json(new ApiResponse(200, hotels, "Hotels retrieved successfully"));
})

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

const getHotelById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);

    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    // Fetch hotel room details
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

//===========================================================


//=========================ROOM CRUD=========================

const addRooms = asyncHandler(async (req, res) => {
    //get the details
    const { hotel, room_type, room_price_per_day, status, facilities, max_occupancy, room_number } = req.body;

    //validate
    if (!hotel || !room_type || !room_price_per_day || !status || !facilities || !max_occupancy || !room_number) {
        return res.status(400).json({ message: "Please provide all fields", status: false })
    }

    //check for images
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please provide room images", status: false })
    }

    //find the hotel
    const existedHotel = await Hotel.findById(hotel);
    if (!existedHotel) {
        throw new ApiError(404, "Hotel not found");
    }


    const roomImages = req.files.map(file => file.path);

    //create room
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

    //check for error
    if (!newRoom) {
        throw new ApiError(500, "An error occurred while adding the room");
    }

    res.status(201).json(new ApiResponse(201, newRoom, "Room added successfully"));
})

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
})

const updateRoom = asyncHandler(async (req, res) => {
    //get details

    const { id, room_type, room_price_per_day, status, facilities, max_occupancy, room_number } = req.body;

    //validate
    if (!id || !room_type || !room_price_per_day || !status || !facilities || !max_occupancy || !room_number) {
        return res.status(400).json({ message: "Please provide at least one field to update", status: false })
    }

    //find the room
    const room = await HotelRoom.findById(id);

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    //update
    room.room_type = room_type;
    room.room_price_per_day = room_price_per_day;
    room.status = status;
    room.facilities = facilities;
    room.max_occupancy = max_occupancy;
    room.room_number = room_number;
    await room.save();


    res.status(200).json(new ApiResponse(200, room, "Room updated successfully"));
})


const updateRoomImages = asyncHandler(async (req, res) => {
    // Get the id and deleted images array from request
    const { id, existingImages = [] } = req.body;

    // Validate
    if (!id) {
        throw new ApiError(400, "Please provide room information");
    }

    // Find the room
    const room = await HotelRoom.findById(id);
    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    // Handle image deletions
    if (existingImages && existingImages.length > 0) {
        // Filter out the deleted images
        room.room_images = room.room_images.filter(
            img => existingImages.includes(img)
        );
    }
    if (existingImages.length == 0) {
        room.room_images = [];
    }

    // Handle new image uploads
    let newImages = [];
    if (req.files && req.files.length > 0) {
        newImages = req.files.map(file => file.path);
    }

    // Update the room images (keep existing + add new)
    room.room_images = [...room.room_images, ...newImages];
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, room, "Room images updated successfully")
    );
});
const deleteRoom = asyncHandler(async (req, res) => {
    const { id } = req.body
    if (!id) {
        throw new ApiError(400, "Please provide room information")
    }

    const room = await HotelRoom.findById(id)

    if (!room) {
        throw new ApiError(404, "Room not found!")
    }

    await room.deleteOne()

    return res.status(200).json(new ApiResponse(200, null, "Room deleted successfully "))
})
const getRoomByhotelId = asyncHandler(async (req, res) => {
    const { hotelId } = req.params

    const hotel = await HotelRoom.find({ hotel: hotelId })
    return res.status(200).json(new ApiResponse(200, hotel, "Hotel retrived successfully"))
})

//===========================================================

const searchHotels = asyncHandler(async (req, res) => {
    const { name, area, district, pincode } = req.query;

    // If no search parameters are provided, return all hotels
    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (area) filter["address.area"] = { $regex: area, $options: "i" };
    if (district) filter["address.district"] = { $regex: district, $options: "i" };
    if (pincode) filter["address.pincode"] = pincode;

    try {
        // Find hotels with the filter
        let hotels = await Hotel.find(filter).lean();

        if (hotels.length === 0) {
            return res.status(404).json({ message: "No hotels found matching your criteria", status: false });
        }

        // Fetch hotel IDs
        const hotelIds = hotels.map(hotel => hotel._id);

        // Fetch all rooms associated with the found hotels
        const rooms = await HotelRoom.find({ hotel: { $in: hotelIds } });

        // Create a mapping of hotel -> room prices
        const hotelPriceMap = rooms.reduce((acc, room) => {
            if (!acc[room.hotel]) {
                acc[room.hotel] = [];
            }
            acc[room.hotel].push(room.room_price_per_day);
            return acc;
        }, {});

        // Append minPrice & maxPrice to each hotel
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
        // Handle any potential errors
        return res.status(500).json({
            message: "An error occurred while searching for hotels",
            status: false
        });
    }
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

        // Find all hotels owned by the current owner
        const hotels = await Hotel.find({ hotel_owner: req.hotel_owner._id });

        if (!hotels.length) {
            return res.status(404).json({ message: "No hotels found for this owner" });
        }

        // Extract hotel IDs
        const hotelIds = hotels.map(hotel => hotel._id);

        // Find all rooms associated with these hotels
        const rooms = await HotelRoom.find({ hotel: { $in: hotelIds } });

        res.status(200).json(new ApiResponse(200, rooms, "room retrived successfully"));
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});




export {
    createHotel,
    getOwnerHotels,
    addRooms,
    updateRoomStatus,
    searchHotels,
    getRooms,
    updateHotel,
    updateHotelImages,
    deleteHotel,
    getUnapprovedHotels,
    approveHotel,
    updateRoom,
    updateRoomImages,
    deleteRoom, getOwnerRooms, getHotelById, getRoomByhotelId
};