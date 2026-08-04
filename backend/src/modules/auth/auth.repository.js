import { User } from "../users/user.model.js";
import { HotelOwner } from "../owners/owner.model.js";

export const authRepository = {
    findUserByEmail: (email) => User.findOne({ email }),
    findOwnerByEmail: (email) => HotelOwner.findOne({ email }),
};
