import { HotelOwner } from "../modules/owners/owner.model.js";
import { User } from "../modules/users/user.model.js";

export const syncExistingHotelOwners = async () => {
    try {
        const owners = await HotelOwner.find({});
        for (const owner of owners) {
            // If owner already has a linked User reference, skip
            if (owner.user) {
                continue;
            }

            const rawDoc = owner.toObject();
            const email = rawDoc.email;
            const name = rawDoc.name || rawDoc.bussinessName || "Hotel Owner";
            const password = rawDoc.password || "$2a$10$dummyHashForLegacyOwnerPasswordRef";

            if (!email) {
                console.warn(`[Sync] HotelOwner ID ${owner._id} has no linked user and no legacy email.`);
                continue;
            }

            let userObj = await User.findOne({ email });
            if (!userObj) {
                userObj = await User.create({
                    name,
                    email,
                    password,
                    contact: rawDoc.contact || 0,
                    gender: rawDoc.gender || "not specified",
                    type: "hotelOwner",
                    otp: rawDoc.otp || 0,
                    isVerifiedOtp: rawDoc.isVerifiedOtp !== undefined ? rawDoc.isVerifiedOtp : true
                });
                console.log(`[Sync] Created User record for HotelOwner: ${email}`);
            } else {
                userObj.type = "hotelOwner";
                await userObj.save();
            }

            owner.user = userObj._id;
            await owner.save();
            console.log(`[Sync] Linked User ID ${userObj._id} to HotelOwner ID: ${owner._id}`);
        }
    } catch (err) {
        console.error("Error syncing existing hotel owners:", err);
    }
};
