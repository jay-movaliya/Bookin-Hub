import { User } from "../../models/main/user.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import nodemailer from "nodemailer";
import bcrypt from 'bcrypt';

import jwt from "jsonwebtoken";
import { booking } from "../../models/Cabs/cab_booking_model.js";

const registerUser = async (req, res) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const { name, gender, contact, email, type, password } = req.body;

  const existedUser = await User.findOne({ email })

  if (existedUser) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User already exists"));
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const key = Math.floor(Math.random() * 10000);


  const hashedPAssword = await bcrypt.hash(password, 10);

  // Create a transporter object using the default SMTP transport (Gmail in this case)
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can also use SMTP server details directly
    auth: {
      user: smtpUser, // your email address
      pass: smtpPass, // your email password (use app-specific password for Gmail)
    },
  });

  // Setup email data
  const mailOptions = {
    from: smtpUser, // sender address
    to: email, // list of recipients
    subject: "BookinHub - Verify your account", // subject line
    html: `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
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
                <p class="message">Thank you for registering with BookinHub. To complete your account creation, please verify your email address using the code below.</p>
                
                <div class="otp-container">
                    <span class="otp-label">Your Verification Code</span>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <p class="expiry-text">This code is valid for 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p class="footer-text">© ${new Date().getFullYear()} BookinHub. All rights reserved.</p>
                <p class="footer-text">Need help? <a href="mailto:support@bookinhub.com" style="color: #ef4444; text-decoration: none;">Contact Support</a></p>
            </div>
        </div>
    </body>
    </html>`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).json(new ApiResponse(500, error, "Error sending email"));
    } else {
      return true;
    }
  });

  const user = await User.create({
    name,
    gender,
    contact,
    email,
    otp,
    key,
    type,
    isVerifiedOtp: false,
    password: hashedPAssword
  });

  res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
};

const verifyOtp = async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY;
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  if (user.isVerifiedOtp) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User already verified"));
  }

  if (user.otp !== otp) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
  }

  user.isVerifiedOtp = true;
  await user.save();

  const token = jwt.sign({ user }, SECRET_KEY);

  res
    .status(200)
    .json(new ApiResponse(200, token, "User verified successfully"));
};

const loginUser = async (req, res) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const otp = Math.floor(1000 + Math.random() * 9000);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }



  const isMatch = await bcrypt.compare(password, user.password);
  // console.log(user.passowrd)
  // console.log(password)

  // console.log(isMatch)
  if (!isMatch) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials"));
  }

  if (!user.isVerifiedOtp) {
    user.otp = otp;
    await user.save();
    // Create a transporter object using the default SMTP transport (Gmail in this case)
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can also use SMTP server details directly
      auth: {
        user: smtpUser, // your email address
        pass: smtpPass, // your email password (use app-specific password for Gmail)
      },
    });

    // Setup email data
    const mailOptions = {
      from: smtpUser, // sender address
      to: email, // list of recipients
      subject: "BookinHub - Login Verification", // subject line
      html: `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Verification</title>
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
                    <p class="message">We detected a login attempt for your BookinHub account. Please use the verification code below to proceed.</p>
                    
                    <div class="otp-container">
                        <span class="otp-label">Verification Code</span>
                        <div class="otp-code">${otp}</div>
                    </div>
                    
                    <p class="expiry-text">This code expires in 10 minutes. If you did not attempt to sign in, please secure your account immediately.</p>
                </div>
                <div class="footer">
                    <p class="footer-text">© ${new Date().getFullYear()} BookinHub. All rights reserved.</p>
                    <p class="footer-text">Need help? <a href="mailto:support@bookinhub.com" style="color: #ef4444; text-decoration: none;">Contact Support</a></p>
                </div>
            </div>
        </body>
        </html>`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res
          .status(500)
          .json(new ApiResponse(500, error, "Error sending email"));
      } else {
        return true;
      }
    });

    return res
      .status(400)
      .json(new ApiResponse(400, null, "User not verified"));
  }

  const token = jwt.sign({ user }, process.env.SECRET_KEY);

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
  console.log("Otp : ", otp);
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
                    
                    <p class="expiry-text">This code expires in 10 minutes. If you did not request a password reset, please ignore this email.</p>
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

  // Ensure 'otp' comparison uses exact match; request may send it as string, db has number
  if (user.otp !== Number(otp) && String(user.otp) !== String(otp)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.isVerifiedOtp = true;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
};

export { registerUser, verifyOtp, loginUser, forgotPassword, resetPassword };
export const getbookingByid = async (req, resp) => {
  try {
    if (!req.params.id) {
      return resp.status(400).json({ message: "user ID is required" });
    }

    const bookings = await booking.find({ user_id: req.params.id })
      .populate("Rider_id")

      .populate("vehicle_id");

    if (!bookings || bookings.length === 0) {
      return resp.status(404).json({ message: "Booking not found" });
    }

    resp.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    resp.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};