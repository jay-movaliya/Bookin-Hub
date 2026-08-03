import dotenv from 'dotenv'
dotenv.config();
import { app } from "./app.js";
import mongoose from "mongoose"

mongoose.connect(process.env.MONGODB_URL).then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at ${process.env.PORT}`);

    })
});
