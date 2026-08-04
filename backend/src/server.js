import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { syncExistingHotelOwners } from "./utils/syncHotelOwners.js";

const PORT = process.env.PORT || 3000;

connectDB()
    .then(async () => {
        await syncExistingHotelOwners();
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed !!! ", err);
    });
