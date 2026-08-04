import { HotelOwner } from "./owner.model.js";
import { User } from "../users/user.model.js";
import { ApiError } from "../../shared/ApiError.js";
import { ApiResponse } from "../../shared/ApiResponse.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerHotelOwner = asyncHandler(async (req, res) => {
    const { name, email, password, businessName, businessRegNo, gender, contact, userId } = req.body;
    const bussinessName = businessName || req.body.bussinessName;
    const bussinessRegNo = businessRegNo || req.body.bussinessRegNo;

    if (!bussinessName || !bussinessRegNo) {
        throw new ApiError(400, "Business name and registration number are required");
    }

    let userObj = null;
    if (userId) {
        userObj = await User.findById(userId);
    } else if (email) {
        userObj = await User.findOne({ email });
    }

    if (!userObj) {
        if (!email || !password || !name) {
            throw new ApiError(400, "User details (name, email, password) are required to create account");
        }
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            userObj = existedUser;
        } else {
            const hashedPAssword = await bcrypt.hash(password, 10);
            userObj = await User.create({
                name,
                email,
                password: hashedPAssword,
                contact: contact || 0,
                gender: gender || "not specified",
                type: "hotelOwner",
                isVerifiedOtp: true
            });
        }
    }

    userObj.type = "hotelOwner";
    await userObj.save();

    let hotelOwnerObj = await HotelOwner.findOne({ user: userObj._id });
    if (hotelOwnerObj) {
        hotelOwnerObj.bussinessName = bussinessName;
        hotelOwnerObj.bussinessRegNo = bussinessRegNo;
        await hotelOwnerObj.save();
    } else {
        hotelOwnerObj = await HotelOwner.create({
            user: userObj._id,
            bussinessName,
            bussinessRegNo,
            isApproved: false
        });
    }

    const populatedOwner = await HotelOwner.findById(hotelOwnerObj._id).populate("user");
    const token = jwt.sign({ _id: hotelOwnerObj._id, hotel_owner: true, user: userObj }, process.env.SECRET_KEY);

    res
        .status(201)
        .json(new ApiResponse(201, { owner: populatedOwner, token }, "Hotel Owner business details registered successfully"));
});

const getOwnerProfile = asyncHandler(async (req, res) => {
    const owner = await HotelOwner.findById(req.hotel_owner?._id).populate("user");
    if (!owner) {
        throw new ApiError(404, "Hotel owner profile not found");
    }
    return res.status(200).json(new ApiResponse(200, owner, "Owner profile fetched successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (user.otp !== Number(otp) && String(user.otp) !== String(otp)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
    }

    user.isVerifiedOtp = true;
    await user.save();

    const hotelOwner = await HotelOwner.findOne({ user: user._id }).populate("user");

    const token = jwt.sign({ _id: hotelOwner ? hotelOwner._id : user._id, user, hotel_owner: true }, SECRET_KEY);

    res
        .status(200)
        .json(new ApiResponse(200, { token, user, owner: hotelOwner }, "User verified successfully"));
});

const logineHotelOwner = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Both email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Invalid credentials"));
    }

    if (!user.isVerifiedOtp) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "User not verified"));
    }

    const hotelOwner = await HotelOwner.findOne({ user: user._id }).populate("user");

    const token = jwt.sign({ _id: hotelOwner ? hotelOwner._id : user._id, user, hotel_owner: true }, process.env.SECRET_KEY);

    res.status(200).json(new ApiResponse(200, { token, user, owner: hotelOwner }, "Login successful"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User account not found"));
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = otp;
    await user.save();

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    const mailOptions = {
        from: smtpUser,
        to: email,
        subject: "BookinHub - Password Reset",
        html: `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
        </head>
        <body>
            <h2>BookinHub Password Reset</h2>
            <p>Hello ${user.name},</p>
            <p>Your verification code is: <strong>${otp}</strong></p>
        </body>
        </html>`,
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.status(500).json(new ApiResponse(500, error, "Error sending email"));
        }
        return res.status(200).json(new ApiResponse(200, null, "OTP sent successfully to your email"));
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (user.otp !== Number(otp) && String(user.otp) !== String(otp)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});

const getHotelOwner = asyncHandler(async (req, res) => {
    const owners = await HotelOwner.find().populate("user");

    if (!owners) {
        throw new ApiError(404, "No hotel owners found.");
    }

    return res.status(200).json(new ApiResponse(200, owners, "Hotel Owners fetched successfully."));
});

const getUnapprovedHotelOwner = asyncHandler(async (req, res) => {
    const owners = await HotelOwner.find({ isApproved: false }).populate("user");

    if (!owners) {
        throw new ApiError(404, "No unapproved hotel owners found.");
    }

    return res.status(200).json(new ApiResponse(200, owners, "Unapproved Hotel Owners fetched successfully."));
});

const getApprovedHotelOwner = asyncHandler(async (req, res) => {
    const owners = await HotelOwner.find({ isApproved: true }).populate("user");

    if (!owners) {
        throw new ApiError(404, "No approved hotel owners found.");
    }

    return res.status(200).json(new ApiResponse(200, owners, "Approved Hotel Owners fetched successfully."));
});

const approveHotelOwner = asyncHandler(async (req, res) => {
    const { hotelId } = req.body;
    if (!hotelId) {
        throw new ApiError(400, "Please provide a hotel owner id");
    }

    const hotelOwner = await HotelOwner.findById(hotelId).populate("user");

    if (!hotelOwner) {
        throw new ApiError(404, "Hotel owner not found");
    }

    hotelOwner.isApproved = true;
    await hotelOwner.save();

    const ownerEmail = hotelOwner.user?.email;
    if (ownerEmail) {
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASSWORD;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const mailOptions = {
            from: smtpUser,
            to: ownerEmail,
            subject: "Your Hotel Owner Account is Now Active - BookinHub",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #2ecc71;">Welcome to BookinHub!</h2>
                <p>Dear ${hotelOwner.user?.name || "Hotel Owner"},</p>
                <p>We're excited to inform you that your <strong>Hotel Owner Account</strong> has been approved!</p>
                <p>You now have full access to your <strong>Hotel Owner Dashboard</strong>.</p>
                <a href="http://localhost:5173/hotelowner/dashboard" style="display: inline-block; padding: 10px 15px; background: #2ecc71; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Access Hotel Owner Dashboard</a>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.log("Email error: ", error);
        });
    }

    res.status(200).json(new ApiResponse(200, hotelOwner, "Hotel owner approved successfully"));
});

const rejectHotelOwner = asyncHandler(async (req, res) => {
    const { hotelId } = req.body;
    if (!hotelId) {
        throw new ApiError(404, "Hotel owner id not found.");
    }
    const owner = await HotelOwner.findById(hotelId).populate("user");

    if (!owner) {
        throw new ApiError(404, "Hotel Owner not found");
    }

    const ownerEmail = owner.user?.email;
    if (ownerEmail) {
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASSWORD;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const mailOptions = {
            from: smtpUser,
            to: ownerEmail,
            subject: "Your Registration Was Not Approved - BookinHub",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #e74c3c;">Registration Not Approved</h2>
                <p>Dear ${owner.user?.name || "User"},</p>
                <p>We regret to inform you that your registration request was not approved.</p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.log("Email error: ", error);
        });
    }

    await owner.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Hotel Owner rejected successfully."));
});

export { logineHotelOwner, getApprovedHotelOwner, registerHotelOwner, getOwnerProfile, approveHotelOwner, rejectHotelOwner, getHotelOwner, getUnapprovedHotelOwner, verifyOtp, forgotPassword, resetPassword };
