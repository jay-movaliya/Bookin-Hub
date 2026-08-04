import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import Hotel from "./modules/hotels/hotel.model.js";
import { HotelRoom } from "./modules/rooms/room.model.js";

const PORT = process.env.PORT || 3000;

connectDB()
    .then(async () => {
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed !!! ", err);
    });
