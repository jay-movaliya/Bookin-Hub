import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HotelBooking',
        required: true,
        unique: true
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

ratingSchema.post('save', async function () {
    const Hotel = mongoose.model('Hotel');
    const ratings = await this.model('Rating').find({ hotel: this.hotel });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Hotel.findByIdAndUpdate(this.hotel, {
        averageRating: parseFloat(avgRating.toFixed(1))
    });
});

export const Rating = mongoose.model('Rating', ratingSchema);
