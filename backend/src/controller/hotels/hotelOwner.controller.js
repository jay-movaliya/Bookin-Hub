import { HotelOwner } from "../../models/hotels/hotelOwner.model.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// const registerHotelOwner = asyncHandler(async (req, res) => {
//     // Get the bussinessName and bussinessRegNo from the request body
//     const { bussinessName, bussinessRegNo } = req.body;

//     if (!bussinessName || !bussinessRegNo) {
//         throw new ApiError(400, "Please provide a business name and business registration number");
//     }
//     // Check if the user exists
//     const user = await User.findById(req.user.id);
//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     // Check if the user is already a hotel owner
//     const hotelOwner = await HotelOwner.findOne({ user: req.user.id });

//     if (hotelOwner) {
//         throw new ApiError(400, "User is already a hotel owner");
//     }

//     // Create a new hotel owner
//     const newHotelOwner = await HotelOwner.create({
//         user: req.user.id,
//         bussinessName,
//         bussinessRegNo,
//         isApproved: false
//     });

//     // Send the response
//     res.status(201).json(new ApiResponser(201, newHotelOwner, "Hotel owner registered successfully"));
// });
const registerHotelOwner = asyncHandler(async (req, res) => {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const { name, email, password, businessName, businessRegNo } = req.body;
    const bussinessName = businessName;
    const bussinessRegNo = businessRegNo;
    // console.log(req.body);

    const otp = Math.floor(Math.random() * 10000);
    if (!name || !email || !password || !bussinessName || !bussinessRegNo) {
        throw new ApiError(400, "All fields are required");
    }
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
        subject: "BookMyFlight OTP", // subject line
        // text: "Hello, this is a test email sent from Nodemailer!", // plain text body
        // Alternatively, you can send HTML body
        html: `<html>
      <head>
          <style>
              body {{
                  font-family: Arial, sans-serif;
                  color: #333;
                  background-color: #f4f4f4;
                  padding: 20px;
              }}
              .container {{
                  background-color: #ffffff;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                  margin: 0 auto;
              }}
              h2 {{
                  color: #4CAF50;
              }}
              .otp-code {{
                  font-size: 24px;
                  font-weight: bold;
                  color: #333;
                  padding: 10px;
                  background-color: #f1f1f1;
                  border: 1px solid #ddd;
                  text-align: center;
                  border-radius: 5px;
                  margin: 20px 0;
              }}
              .footer {{
                  font-size: 12px;
                  color: #888;
                  text-align: center;
                  margin-top: 30px;
              }}
              .footer a {{
                  color: #4CAF50;
                  text-decoration: none;
              }}
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Welcome to BookinHub!</h2>
              <p>Thank you for registering with us! To complete your account creation process, please verify your email address by entering the One-Time Password (OTP) below:</p>
              <div class="otp-code">${otp}</div>
              <p>The OTP is valid for the next 10 minutes. Please enter it in the required field to complete your registration.</p>
              <p>If you did not request this, please disregard this email.</p>
              <div class="footer">
                  <p>For any issues, feel free to contact our <a href="mailto:support@bookinhub.com">support team</a>.</p>
                  <p>Thank you for choosing us!</p>
                  <p>Best regards, <br> The BookinHub Team</p>
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

    const hotelOwnerObj = await HotelOwner.create({
        name,
        email,
        bussinessName,
        bussinessRegNo,
        otp,
        isApproved: false,
        isVerifiedOtp: false,
        password: hashedPAssword,
    });

    res
        .status(201)
        .json(new ApiResponse(201, hotelOwnerObj, "Hotel Owner registered successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    const { email, otp } = req.body;

    const hotelOwner = await HotelOwner.findOne({ email });

    if (!hotelOwner) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (hotelOwner.isVerifiedOtp) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "User already verified"));
    }

    if (hotelOwner.otp !== otp) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
    }

    hotelOwner.isVerifiedOtp = true;
    await hotelOwner.save();

    const token = jwt.sign({ _id: hotelOwner._id, hotel_owner: true }, SECRET_KEY);

    res
        .status(200)
        .json(new ApiResponse(200, token, "Hotel owner verified successfully"));
});

const logineHotelOwner = asyncHandler(async (req, res) => {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;

    //getting data  from body
    const { email, password } = req.body;


    //validation
    if (!email || !password) {
        throw new ApiError(400, "Both email and password are required");
    }

    //find hotelOwner
    const hotelOwner = await HotelOwner.findOne({ email: email });

    //check that hotelOwner exists?
    if (!hotelOwner) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const otp = Math.floor(Math.random() * 10000);

    // check if the password is correct
    const isMatch = await bcrypt.compare(password, hotelOwner?.password);

    //if it doesn't match then return error
    if (!isMatch) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Invalid credentials"));
    }


    //if it is correct then check if is verified
    if (!hotelOwner.isVerifiedOtp) {
        // if not then send the mail and do verification 
        hotelOwner.otp = otp;
        await hotelOwner.save();


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
            subject: "BookMyFlight OTP", // subject line
            // text: "Hello, this is a test email sent from Nodemailer!", // plain text body
            // Alternatively, you can send HTML body
            html: `
            <html>
                <head>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            color: #333;
                            background-color: #f4f4f4;
                            padding: 20px;
                        }}
                        .container {{
                            background-color: #ffffff;
                            padding: 30px;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            max-width: 600px;
                            margin: 0 auto;
                        }}
                        h2 {{
                            color: #4CAF50;
                        }}
                        .otp-code {{
                            font-size: 24px;
                            font-weight: bold;
                            color: #333;
                            padding: 10px;
                            background-color: #f1f1f1;
                            border: 1px solid #ddd;
                            text-align: center;
                            border-radius: 5px;
                            margin: 20px 0;
                        }}
                        .footer {{
                            font-size: 12px;
                            color: #888;
                            text-align: center;
                            margin-top: 30px;
                        }}
                        .footer a {{
                            color: #4CAF50;
                            text-decoration: none;
                        }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Welcome to BookinHub!</h2>
                        <p>Thank you for registering with us! To complete your account creation process, please verify your email address by entering the One-Time Password (OTP) below:</p>
                        <div class="otp-code">${otp}</div>
                        <p>The OTP is valid for the next 10 minutes. Please enter it in the required field to complete your registration.</p>
                        <p>If you did not request this, please disregard this email.</p>
                        <div class="footer">
                            <p>For any issues, feel free to contact our <a href="mailto:support@bookinhub.com">support team</a>.</p>
                            <p>Thank you for choosing us!</p>
                            <p>Best regards, <br> The BookinHub Team</p>
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

        //return the respones that hotel owner is not verified
        return res
            .status(400)
            .json(new ApiResponse(400, null, "User not verified"));
    }


    //if it is verified then sign with jwt token and sent the response 
    const token = jwt.sign({ _id: hotelOwner._id, hotel_owner: true }, process.env.SECRET_KEY);

    res.status(200).json(new ApiResponse(200, { token: token }, "Login successful"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const hotelOwner = await HotelOwner.findOne({ email });

    if (!hotelOwner) {
        return res.status(404).json(new ApiResponse(404, null, "Hotel owner not found"));
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    hotelOwner.otp = otp;
    await hotelOwner.save();

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
        subject: "BookinHub - Hotel Owner Password Reset",
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
                    <p class="greeting">Hello ${hotelOwner.name},</p>
                    <p class="message">We received a request to reset your hotel owner account password. Please use the verification code below to proceed.</p>
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

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.status(500).json(new ApiResponse(500, error, "Error sending email"));
        }
        return res.status(200).json(new ApiResponse(200, null, "OTP sent successfully to your email"));
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const hotelOwner = await HotelOwner.findOne({ email });

    if (!hotelOwner) {
        return res.status(404).json(new ApiResponse(404, null, "Hotel owner not found"));
    }

    if (hotelOwner.otp !== Number(otp) && String(hotelOwner.otp) !== String(otp)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
    }

    hotelOwner.password = await bcrypt.hash(newPassword, 10);
    await hotelOwner.save();

    res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});

const getHotelOwner = asyncHandler(async (req, res) => {
    const owners = await HotelOwner.find()

    if (!owners) {
        throw new ApiError(404, "No hotel found.")
    }

    return res.status(200).json(new ApiResponse(200, owners, "Hotel Owner fetched successfully."))
});

const getUnapprovedHotelOwner = asyncHandler(async (req, res) => {
    const owners = await HotelOwner.find({ isApproved: false })

    if (!owners) {
        throw new ApiError(404, "No hotel found.")
    }

    return res.status(200).json(new ApiResponse(200, owners, "Hotel Owner fetched successfully."))
});
const getApprovedHotelOwner = asyncHandler(async (req, res) => {
    const owners = await HotelOwner.find({ isApproved: true })

    if (!owners) {
        throw new ApiError(404, "No hotel found.")
    }

    return res.status(200).json(new ApiResponse(200, owners, "Hotel Owner fetched successfully."))
});
const approveHotelOwner = asyncHandler(async (req, res) => {
    const { hotelId } = req.body;
    if (!hotelId) {
        throw new ApiError(400, "Please provide a hotel owner id");
    }
    // console.log(hotelId);

    const hotelOwner = await HotelOwner.findById(hotelId);

    if (!hotelOwner) {
        throw new ApiError(404, "Hotel owner not found");
    }

    // Update the hotel owner
    hotelOwner.isApproved = true;
    await hotelOwner.save();
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
        to: hotelOwner.email,
        subject: "Your Hotel Owner Account is Now Active - BookinHub",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #2ecc71;">Welcome to BookinHub!</h2>
            <p>Dear Hotel Owner,</p>
            <p>We're excited to inform you that your <strong>Hotel Owner Account</strong> has been approved!</p>
            
            <p>You now have full access to your <strong>Hotel Owner Dashboard</strong> where you can:</p>
            <ul style="line-height: 1.6;">
                <li>Add and manage your hotel properties</li>
                <li>Create room listings with photos and pricing</li>
                <li>View and confirm incoming bookings</li>
                <li>Track your earnings and performance</li>
            </ul>
            
            <p>Get started now by logging in to your dedicated Hotel Owner Dashboard:</p>
            <a href=http://localhost:5173/hotelowner/dashboard" style="display: inline-block; padding: 10px 15px; background: #2ecc71; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Access Hotel Owner Dashboard</a>
            
            <p>Our <strong>Support Team</strong> is available if you need help setting up your properties or have any questions.</p>
            
            <p style="margin-top: 25px; color: #555;">We look forward to helping you grow your business!<br><strong>The BookinHub Team</strong></p>
            
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                <p>Need assistance? <a href="mailto:hotelsupport@bookinhub.com" style="color: #3498db;">Email Hotel Support</a> or call +1 (800) 123-4567</p>
            </div>
            </div>
        `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error: ", error);
        } else {
            console.log("Email sent: ", info.response);
        }
    });
    res.status(200).json(new ApiResponse(200, hotelOwner, "Hotel owner approved successfully"));
});

const rejectHotelOwner = asyncHandler(async (req, res) => {
    const { hotelId } = req.body
    if (!hotelId) {
        throw new ApiError(404, "Hotel owner id not found.")
    }
    const owner = await HotelOwner.findById(hotelId)

    if (!owner) {
        throw new ApiError(404, "Hotel Owner not found")
    }
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
        to: owner.email, // Replace with recipient email
        subject: "Your Registration Was Not Approved - BookinHub",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #e74c3c;">Registration Not Approved</h2>
            <p>Dear User,</p>
            <p>We appreciate your interest in <strong>BookinHub</strong>. However, after reviewing your registration request, we regret to inform you that it has not been approved by our admin team.</p>
            <p>If you believe this is a mistake or need further clarification, please contact our support team.</p>
            <a href="mailto:support@bookinhub.com" style="display: inline-block; padding: 10px 15px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px;">Contact Support</a>
            <p style="margin-top: 20px; color: #555;">Best regards,<br><strong>BookinHub Support Team</strong></p>
            </div>
        `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error: ", error);
        } else {
            console.log("Email sent: ", info.response);
        }
    });

    await owner.deleteOne()

    return res.status(200).json(new ApiResponse(200, null, "Hotel Owner rejected successfully."))
})

export { logineHotelOwner, getApprovedHotelOwner, registerHotelOwner, approveHotelOwner, rejectHotelOwner, getHotelOwner, getUnapprovedHotelOwner, verifyOtp, forgotPassword, resetPassword };