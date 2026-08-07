import { Router } from "express";
import {
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
    getHotelById,
} from "./hotel.controller.js";

// Room Imports...
import {
    addRooms,
    updateRoomStatus,
    getRooms,
    updateRoom,
    updateRoomImages,
    deleteRoom,
    getOwnerRooms,
    getRoomByhotelId,
} from "../rooms/room.controller.js";
import { upload } from "../../middleware/upload.middleware.js";
import { verifyHotelOwner, verifyAdmin } from "../../middleware/auth.middleware.js";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";

const hotelRouter = Router();

// Hotel Routes
hotelRouter.route("/create").post(verifyHotelOwner, upload.array("images", 10), createHotel);
hotelRouter.route("/get-owner-hotels").get(verifyHotelOwner, cacheMiddleware(60), getOwnerHotels);
hotelRouter.route("/update").post(verifyHotelOwner, upload.none(), updateHotel);
hotelRouter.route("/update-status").post(verifyHotelOwner, updateHotelStatus);
hotelRouter.route("/update-images").post(upload.array("images", 10), verifyHotelOwner, updateHotelImages);
hotelRouter.route("/delete").post(verifyHotelOwner, deleteHotel);

// Room Routes
hotelRouter.route("/room/create").post(verifyHotelOwner, upload.array("images", 10), addRooms);
hotelRouter.route("/room/get-owner-rooms").get(verifyHotelOwner, cacheMiddleware(60), getOwnerRooms);
hotelRouter.route("/room/update-status").post(verifyHotelOwner, updateRoomStatus);
hotelRouter.route("/room/update-images").post(verifyHotelOwner, upload.array("images", 10), updateRoomImages);
hotelRouter.route("/room/update").post(verifyHotelOwner, upload.none(), updateRoom);
hotelRouter.route("/room/delete").post(verifyHotelOwner, deleteRoom);
hotelRouter.route("/room/get").get(verifyHotelOwner, cacheMiddleware(60), getRooms);
hotelRouter.route("/room/:hotelId").get(cacheMiddleware(120), getRoomByhotelId);

// Public / Search Routes
hotelRouter.route("/search").get(cacheMiddleware(120), searchHotels);
hotelRouter.route("/:id").get(cacheMiddleware(120), getHotelById);

// Admin Routes
hotelRouter.route("/admin/get-unapproved-hotels").get(verifyAdmin, cacheMiddleware(60), getUnapprovedHotels);
hotelRouter.route("/admin/get-approved-hotels").get(verifyAdmin, cacheMiddleware(60), getApprovedHotels);
hotelRouter.route("/admin/get-owner-hotels").post(verifyAdmin, getOwnerHotels);
hotelRouter.route("/admin/approve-hotel").post(verifyAdmin, approveHotel);
hotelRouter.route("/admin/reject-hotel").post(verifyAdmin, rejectHotel);
hotelRouter.route("/admin/toggle-block-hotel").post(verifyAdmin, toggleBlockHotel);
hotelRouter.route("/approve").post(verifyAdmin, approveHotel);

export { hotelRouter };
