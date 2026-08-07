import { Rating } from './review.model.js';
import { HotelBooking } from '../bookings/booking.model.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import Hotel from '../hotels/hotel.model.js';

const submitRating = asyncHandler(async (req, res) => {
    try {
        const { bookingId, rating, review } = req.body;

        const booking = await HotelBooking.findOne({
            _id: bookingId,
            bookingStatus: 'completed'
        }).populate('hotel');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or not eligible for rating"
            });
        }

        const existingRating = await Rating.findOne({ booking: bookingId });
        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: "You've already rated this booking"
            });
        }

        const newRating = await Rating.create({
            user: booking.user._id,
            booking: bookingId,
            hotel: booking.hotel._id,
            rating,
            review
        });

        res.status(201).json({
            success: true,
            data: {
                rating: newRating.rating,
                review: newRating.review
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const getrating = asyncHandler(async (req, res) => {
    const ownerHotels = await Hotel.find({ hotel_owner: req.hotel_owner._id }).select('_id');

    if (!ownerHotels || ownerHotels.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            message: "No hotels found for this owner"
        });
    }

    const hotelIds = ownerHotels.map(hotel => hotel._id);
    const query = { hotel: { $in: hotelIds } };
    const ratings = await Rating.find(query).populate('hotel', 'name').populate('user', 'email');

    res.status(200).json({
        success: true,
        data: ratings
    });
});

const getHotelRatingsPublic = asyncHandler(async (req, res) => {
    const { hotelId } = req.params;
    
    if (!hotelId) {
        return res.status(400).json({
            success: false,
            message: "Hotel ID is required"
        });
    }

    const ratings = await Rating.find({ hotel: hotelId })
        .populate('user', 'name email profilePic')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: ratings
    });
});

export { submitRating, getrating, getHotelRatingsPublic };
