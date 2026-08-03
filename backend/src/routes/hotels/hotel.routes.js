import { Router } from "express";
import {
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
    deleteRoom,
    getOwnerRooms,
    getHotelById,
    getRoomByhotelId,
    
} from "../../controller/hotels/hotel.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyHotelOwner } from "../../middlewares/Hotels/verifyHotelOwner.middleware.js";
import { verifyAdmin } from "../../middlewares/main/auth.middleware.js";

const hotelRouter = Router();

//---------------------------- Hotel Routes -----------------------------------------

hotelRouter.route("/create").post(verifyHotelOwner, upload.array("images", 10), createHotel);
hotelRouter.route("/get-owner-hotels").get(verifyHotelOwner, getOwnerHotels);
hotelRouter.route("/update").post(verifyHotelOwner, upload.none(), updateHotel);
hotelRouter.route("/update-images").post(upload.array("images", 10), verifyHotelOwner, updateHotelImages);
hotelRouter.route("/delete").post(verifyHotelOwner, deleteHotel);

//---------------------------- Room Routes -----------------------------------------

// ✅ Static routes should be before dynamic ones
hotelRouter.route("/room/create").post(verifyHotelOwner, upload.array("images", 10), addRooms);
hotelRouter.route("/room/get-owner-rooms").get(verifyHotelOwner, getOwnerRooms);
hotelRouter.route("/room/update-status").post(verifyHotelOwner, updateRoomStatus);
hotelRouter.route("/room/update-images").post(verifyHotelOwner, upload.array("images", 10), updateRoomImages);
hotelRouter.route("/room/update").post(verifyHotelOwner, upload.none(), updateRoom);
hotelRouter.route("/room/delete").post(verifyHotelOwner, deleteRoom);
hotelRouter.route("/room/get").get(verifyHotelOwner, getRooms);

// ✅ Dynamic route must come last
hotelRouter.route("/room/:hotelId").get(getRoomByhotelId);

//----------------------------- User Routes --------------------------------------------
hotelRouter.route("/search").get(searchHotels);
hotelRouter.route("/:id").get(getHotelById); // Add user middleware if required

//---------------------------- Admin Routes --------------------------------------------
hotelRouter.route("/admin/get-unapproved-hotels").get(verifyAdmin, getUnapprovedHotels); // Add admin check middleware
hotelRouter.route("/admin/get-owner-hotels").post(verifyAdmin, getOwnerHotels); // Add admin check middleware
hotelRouter.route("/approve").post(verifyAdmin, approveHotel); // Add admin check middleware

export { hotelRouter };
