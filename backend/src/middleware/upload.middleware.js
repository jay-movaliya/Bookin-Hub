import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/assets/uploads");
    },
    filename: function (req, file, cb) {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit per image (compression handled automatically before Cloudinary)
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
    }
});
