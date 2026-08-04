import { reviewRepository } from "./review.repository.js";

export const reviewService = {
    getReviewsByHotel: (hotelId) => reviewRepository.find({ hotel: hotelId }),
    createReview: (data) => reviewRepository.create(data),
};
