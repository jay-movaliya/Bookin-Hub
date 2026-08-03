import multer from "multer";
import { v4 as uuidv4 } from "uuid"; // Install this package using `npm install uuid`

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log("Uploading file to: ./public/assets/uploads"); // Debugging line
        cb(null, "./public/assets/uploads");
    },
    filename: function (req, file, cb) {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        // console.log(`Generated filename: ${uniqueName}`); // Debugging line
        cb(null, uniqueName);
    },
});

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // console.log("Multer upload function called"); // Added check to confirm function execution
        // console.log("File details:", {
        // originalName: file.originalname,
        // mimeType: file.mimetype,
        // size: file.size
        // }); // Debugging line to print file details
        cb(null, true);
    }
});

// console.log("Multer storage configured successfully"); // Debugging line
