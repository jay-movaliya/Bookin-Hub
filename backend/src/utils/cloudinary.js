import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME || "dizt1zuqp",
        api_key: String(process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY || "256977437527175"),
        api_secret: process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET || "mdyhsppWUjMsM9x9AknH03uZTnI",
    });
};

export const uploadOnCloudinary = async (localFilePath, folder = "bookin-hub", retries = 2) => {
    let targetPath = localFilePath;
    let compressedPath = "";

    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) return null;

        configureCloudinary();

        const stats = fs.statSync(localFilePath);
        // If file size > 3MB, compress using sharp before uploading to Cloudinary
        if (stats.size > 3 * 1024 * 1024) {
            const ext = path.extname(localFilePath);
            compressedPath = localFilePath.replace(ext, `-compressed${ext}`);
            try {
                await sharp(localFilePath)
                    .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(compressedPath);

                targetPath = compressedPath;
            } catch (sharpError) {
                console.warn("Sharp compression warning, proceeding with original file:", sharpError.message);
                compressedPath = "";
            }
        }

        const response = await cloudinary.uploader.upload(targetPath, {
            resource_type: "auto",
            folder: folder,
            timeout: 60000,
        });

        // Cleanup local files
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        if (compressedPath && fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);

        return response.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message || error);

        if (retries > 0 && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
            console.log(`Retrying upload for ${localFilePath}... (${retries} retries left)`);
            return uploadOnCloudinary(localFilePath, folder, retries - 1);
        }

        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        if (compressedPath && fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
        return null;
    }
};

export const uploadMultipleOnCloudinary = async (files, folder = "bookin-hub") => {
    if (!files || files.length === 0) return [];
    const uploadPromises = files.map((file) => uploadOnCloudinary(file.path, folder));
    const urls = await Promise.all(uploadPromises);
    return urls.filter(Boolean);
};
