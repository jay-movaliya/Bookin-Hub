import { Rating } from "./review.model.js";

export const reviewRepository = {
    findById: (id) => Rating.findById(id),
    find: (query = {}) => Rating.find(query),
    create: (data) => Rating.create(data),
    deleteById: (id) => Rating.findByIdAndDelete(id),
};
