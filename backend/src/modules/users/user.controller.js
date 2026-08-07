import { User } from "./user.model.js";
import { ApiResponse } from "../../shared/ApiResponse.js";
import nodemailer from "nodemailer";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { redisService } from "../../services/redis.service.js";
import { enqueueNotification } from "../../queues/notification.queue.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { HotelOwner } from "../owners/owner.model.js";
const registerUser = async (req, res) => {
  const { name, gender, contact, email, type, password } = req.body;

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User already exists"));
  }

  const existedContact = await User.findOne({ contact });

  if (existedContact) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Contact already exists"));
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const hashedPAssword = await bcrypt.hash(password, 10);

  // Store in Redis (expires in 10 minutes = 600s)
  const tempUser = { name, gender, contact, email, type, password: hashedPAssword, otp };
  const redisKey = `temp_user_${email}`;
  await redisService.set(redisKey, tempUser, 600);
  // Send OTP via SMS
  let phone = String(contact);
  if (!phone.startsWith('+')) {
    phone = `+91${phone}`;
  }

  await enqueueNotification({
    channel: 'sms',
    type: 'otp_sms',
    data: {
      phoneNumber: phone,
      message: `Your BookinHub verification code is: ${otp}.`
    }
  });

  // console.log(otp)
  res
    .status(201)
    .json(new ApiResponse(201, { message: "OTP  t to your mobile number" }, "OTP sent successfully"));
};

const verifyOtp = async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY;
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json(new ApiResponse(400, null, "Email and OTP are required"));
  }

  const redisKey = `temp_user_${email}`;
  const tempUser = await redisService.get(redisKey);

  if (!tempUser) {
    return res.status(404).json(new ApiResponse(404, null, "OTP expired or invalid contact"));
  }

  if (Number(tempUser.otp) !== Number(otp)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
  }

  // Check again to avoid race conditions
  const existedUser = await User.findOne({ $or: [{ email: tempUser.email }, { contact: tempUser.contact }] });
  if (existedUser) {
    return res.status(400).json(new ApiResponse(400, null, "User already exists"));
  }

  // Create user in DB
  const user = await User.create({
    name: tempUser.name,
    gender: tempUser.gender,
    contact: tempUser.contact,
    email: tempUser.email,
    type: tempUser.type,
    isVerifiedOtp: true,
    password: tempUser.password
  });

  // Enqueue Welcome email
  await enqueueNotification({
    type: 'welcome_email',
    data: {
      email: user.email,
      userName: user.name
    }
  });

  // Cleanup Redis
  await redisService.del(redisKey);

  const token = jwt.sign({ user }, SECRET_KEY);

  res
    .status(200)
    .json(new ApiResponse(200, token, "User verified successfully"));
};

const loginUser = async (req, res) => {
  const { email, contact, password } = req.body;

  if (!password || (!email && !contact)) {
    return res.status(400).json(new ApiResponse(400, null, "Email or contact and password are required"));
  }

  const query = {};
  if (email) query.email = email;
  else query.contact = contact;

  const user = await User.findOne(query);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials"));
  }

  const token = jwt.sign({ user }, process.env.SECRET_KEY, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '7d' });

  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json(new ApiResponse(200, token, "Login successful"));
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
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
    subject: "BookinHub - Password Reset Verification",
    html: `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%); padding: 32px 20px; text-align: center; }
                .logo-text { color: white; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .content { padding: 40px 30px; color: #374151; }
                .greeting { font-size: 20px; font-weight: 600; margin-bottom: 24px; color: #111827; }
                .message { font-size: 16px; line-height: 1.6; margin-bottom: 32px; color: #4b5563; }
                .otp-container { background-color: #fff1f2; border: 2px dashed #f43f5e; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0; }
                .otp-label { display: block; font-size: 14px; font-weight: 600; color: #9f1239; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .otp-code { font-size: 42px; font-weight: 800; color: #be123c; letter-spacing: 8px; font-family: 'Courier New', monospace; line-height: 1; }
                .expiry-text { font-size: 14px; color: #6b7280; text-align: center; margin-top: 24px; }
                .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
                .footer-text { font-size: 12px; color: #9ca3af; margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1 class="logo-text">BookinHub</h1>
                </div>
                <div class="content">
                    <p class="greeting">Hello,</p>
                    <p class="message">We received a request to reset your password for your BookinHub account. Please use the verification code below to proceed.</p>
                    
                    <div class="otp-container">
                        <span class="otp-label">Verification Code</span>
                        <div class="otp-code">${otp}</div>
                    </div>
                    
                    <p class="expiry-text">This code expires in 5 minutes. If you did not request a password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p class="footer-text">© ${new Date().getFullYear()} BookinHub. All rights reserved.</p>
                    <p class="footer-text">Need help? <a href="mailto:support@bookinhub.com" style="color: #ef4444; text-decoration: none;">Contact Support</a></p>
                </div>
            </div>
        </body>
        </html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json(new ApiResponse(500, error, "Error sending email"));
    } else {
      return res.status(200).json(new ApiResponse(200, null, "OTP sent successfully to your email"));
    }
  });
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  if (user.otp !== Number(otp) && String(user.otp) !== String(otp)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.isVerifiedOtp = true;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
};

const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json(new ApiResponse(400, null, "No image file provided"));
    }

    const localFilePath = req.file.path;
    const profilePicUrl = await uploadOnCloudinary(localFilePath, "bookin-hub/profiles");

    if (!profilePicUrl) {
      return res.status(500).json(new ApiResponse(500, null, "Failed to upload image to Cloudinary"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    );

    // If the user is also a hotel owner, we need to issue an owner token, otherwise a standard user token.
    let hotelOwner = null;
    if (updatedUser.type === "hotelOwner" || req.hotel_owner) {
        hotelOwner = await HotelOwner.findOne({ user: updatedUser._id }).populate("user");
    }

    const tokenPayload = hotelOwner 
      ? { _id: hotelOwner._id, user: updatedUser, hotel_owner: true }
      : { _id: updatedUser._id, user: updatedUser };

    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY);

    res.status(200).json(new ApiResponse(200, { token, user: updatedUser, profilePic: profilePicUrl }, "Profile picture updated successfully"));
  } catch (error) {
    console.error("Profile pic update error:", error);
    res.status(500).json(new ApiResponse(500, null, "Error updating profile picture"));
  }
};

export { registerUser, verifyOtp, loginUser, forgotPassword, resetPassword, updateProfilePic };
