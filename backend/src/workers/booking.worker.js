import { HotelBooking } from "../modules/bookings/booking.model.js";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { sendRatingEmail } from "../services/email.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "logs");
const logFile = path.join(logDir, "bookingCompletion.log");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export const markCompletedBookings = async () => {
    const now = new Date();
    let logMessages = [];

    const bookingsToUpdate = await HotelBooking.find({
        bookingEndDate: { $lt: now },
        bookingStatus: { $ne: "completed" },
    }).populate('user hotel', 'email name');

    if (bookingsToUpdate.length === 0) {
        return { modifiedCount: 0, updatedBookings: [], logMessages };
    }

    const updateResult = await HotelBooking.updateMany(
        { _id: { $in: bookingsToUpdate.map(b => b._id) } },
        { $set: { bookingStatus: "completed", completedAt: new Date() } }
    );

    await Promise.all(
        bookingsToUpdate.map(async (booking) => {
            try {
                await sendRatingEmail({
                    email: booking.user.email,
                    userName: booking.user.name,
                    bookingId: booking._id,
                    hotelName: booking.hotel?.name
                });
                logMessages.push(`Rating email sent to ${booking.user.email}`);
            } catch (emailError) {
                logMessages.push(`Failed to send email to ${booking.user.email}: ${emailError.message}`);
            }
        })
    );

    return {
        modifiedCount: updateResult.modifiedCount,
        updatedBookings: bookingsToUpdate,
        logMessages
    };
};

export const startBookingWorker = () => {
    cron.schedule("*/30 * * * *", async () => {
        const timestamp = new Date().toISOString();
        let logContent = `[${timestamp}] Cron job started\n`;

        try {
            const { modifiedCount, updatedBookings, logMessages } = await markCompletedBookings();
            logContent += `[${timestamp}] Updated ${modifiedCount} bookings to 'completed'\n`;

            updatedBookings.forEach((booking) => {
                logContent += `[${timestamp}] ➤ Booking ${booking._id} | User: ${booking.user.email}\n`;
            });

            logMessages.forEach(message => {
                logContent += `[${timestamp}] ${message}\n`;
            });

            console.log(` Updated ${modifiedCount} bookings. Emails sent: ${updatedBookings.length}`);
        } catch (error) {
            logContent += `[${timestamp}] Error: ${error.message}\n`;
            console.error(" Cron job failed:", error);
        }

        fs.appendFile(logFile, logContent, (err) => {
            if (err) console.error(" Failed to write logs:", err);
        });
    });
};
