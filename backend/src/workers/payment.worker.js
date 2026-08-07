import { Worker } from 'bullmq';
import { HotelBooking } from '../modules/bookings/booking.model.js';
import mongoose from 'mongoose';
import { enqueueNotification } from '../queues/notification.queue.js';
import { getRedisClient } from '../config/redis.js';

const PAYMENT_QUEUE_NAME = 'payment-queue';

export const startPaymentWorker = () => {
    const worker = new Worker(
        PAYMENT_QUEUE_NAME,
        async (job) => {
            const { event, payload } = job.data;
            const orderId = payload?.payment?.entity?.order_id;
            const paymentId = payload?.payment?.entity?.id;

            console.log(`[payment-worker] processing job ${job.id} — order: ${orderId}, event: ${event}`);

            if (!orderId) {
                throw new Error("Order ID missing in webhook payload");
            }

            if (event === "payment.captured" || event === "order.paid") {
                await handleSuccessfulPayment(orderId, paymentId);
            } else if (event === "payment.failed") {
                await handleFailedPayment(orderId, paymentId);
            }
        },
        {
            connection: getRedisClient(),
            concurrency: 5,
        }
    );

    worker.on("completed", (job) => {
        console.log(`[payment-worker] job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.error(`[payment-worker] job ${job?.id} failed:`, err.message);
    });

    worker.on("error", (err) => {
        if (err.message && !err.message.includes("ECONNREFUSED")) {
            console.error("[payment-worker] unexpected error:", err.message);
        }
    });

    console.log("[payment-worker] started — waiting for jobs...");
    return worker;
};

async function handleSuccessfulPayment(orderId, paymentId) {
    const redisClient = getRedisClient();
    
    // 1. Get tempBookingId from Redis
    const tempBookingId = await redisClient.get(`rzp_order:${orderId}`);
    if (!tempBookingId) {
        console.warn(`[payment-worker] No temporary booking found for order ${orderId} (might have expired)`);
        return;
    }

    // 2. Get booking payload from Redis
    const payloadStr = await redisClient.get(`temp_booking:${tempBookingId}`);
    if (!payloadStr) {
        console.warn(`[payment-worker] Booking payload expired for tempBookingId ${tempBookingId}`);
        return;
    }

    const payload = JSON.parse(payloadStr);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 3. Create the actual MongoDB record
        const newBooking = await HotelBooking.create([{
            ...payload,
            razorpay_order_id: orderId,
            paymentStatus: "completed",
            bookingStatus: "confirmed"
        }], { session });

        const populatedBooking = await HotelBooking.findById(newBooking[0]._id)
            .populate('user')
            .populate('hotel')
            .session(session);

        await session.commitTransaction();
        session.endSession();

        console.log(`[payment-worker] Booking ${populatedBooking._id} confirmed and saved to DB`);

        // 4. Clean up Redis keys
        const lockKey = `lock:room:${payload.room}`;
        await redisClient.del(`rzp_order:${orderId}`);
        await redisClient.del(`temp_booking:${tempBookingId}`);
        await redisClient.del(lockKey);

        // 5. Send confirmation email
        if (populatedBooking.user?.email) {
            await enqueueNotification({
                type: 'booking_confirmed_user',
                data: {
                    email: populatedBooking.user.email,
                    userName: populatedBooking.user.name,
                    hotelName: populatedBooking.hotel?.name,
                    checkInDate: populatedBooking.bookingStartDate,
                    checkOutDate: populatedBooking.bookingEndDate,
                    totalAmount: populatedBooking.totalAmount,
                    bookingId: populatedBooking._id
                }
            });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}

async function handleFailedPayment(orderId, paymentId) {
    const redisClient = getRedisClient();
    const tempBookingId = await redisClient.get(`rzp_order:${orderId}`);
    
    if (!tempBookingId) {
        console.warn(`[payment-worker] No temp booking found for failed order ${orderId}`);
        return;
    }

    const payloadStr = await redisClient.get(`temp_booking:${tempBookingId}`);
    if (payloadStr) {
        const payload = JSON.parse(payloadStr);
        const lockKey = `lock:room:${payload.room}`;
        
        // Immediately free up the room lock
        await redisClient.del(lockKey);
        await redisClient.del(`temp_booking:${tempBookingId}`);
    }
    
    await redisClient.del(`rzp_order:${orderId}`);
    
    console.log(`[payment-worker] Payment ${orderId} failed — temporary locks cleared`);
}
