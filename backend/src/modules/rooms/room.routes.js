import { Router } from "express";
import {
    addRooms,
    updateRoomStatus,
    getRooms,
    updateRoom,
    updateRoomImages,
    deleteRoom,
    getOwnerRooms,
    getRoomByhotelId,
} from "./room.controller.js";
import { upload } from "../../middleware/upload.middleware.js";
import { verifyHotelOwner } from "../../middleware/auth.middleware.js";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";

const roomRouter = Router();

roomRouter.route("/create").post(verifyHotelOwner, upload.array("images", 10), addRooms);
roomRouter.route("/get-owner-rooms").get(verifyHotelOwner, cacheMiddleware(60), getOwnerRooms);
roomRouter.route("/update-status").post(verifyHotelOwner, updateRoomStatus);
roomRouter.route("/update-images").post(verifyHotelOwner, upload.array("images", 10), updateRoomImages);
roomRouter.route("/update").post(verifyHotelOwner, upload.none(), updateRoom);
roomRouter.route("/delete").post(verifyHotelOwner, deleteRoom);
roomRouter.route("/get").get(verifyHotelOwner, cacheMiddleware(60), getRooms);
roomRouter.route("/:hotelId").get(cacheMiddleware(120), getRoomByhotelId);

export { roomRouter };
