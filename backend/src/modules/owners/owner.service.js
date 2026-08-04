import { ownerRepository } from "./owner.repository.js";

export const ownerService = {
    getOwnerById: (id) => ownerRepository.findById(id),
    getOwnerByEmail: (email) => ownerRepository.findByEmail(email),
    getAllOwners: (query) => ownerRepository.findAll(query),
};
