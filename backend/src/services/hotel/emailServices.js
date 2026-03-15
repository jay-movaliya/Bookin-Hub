import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendRatingEmail = async ({ email, userName, bookingId, hotelName }) => {
  const ratingLink = `${process.env.FRONTEND_URL}/rate/${bookingId}`;

  const mailOptions = {
    from: '"Bookinhub"',
    to: email,
    subject: `How was your stay at ${hotelName}?`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Hi ${userName},</h2>
        <p>We hope you enjoyed your recent stay at <strong>${hotelName}</strong>!</p>
        <p>Please take a moment to rate your experience:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${ratingLink}" 
             style="background: #d32f2f; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Rate Your Stay (1-5 Stars)
          </a>
        </div>
        
        <p style="font-size: 12px; color: #777;">
          This link will expire in 7 days. Booking ID: ${bookingId}
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendBookingConfirmation = async ({ email, userName, bookingId, hotelName, checkInDate, checkOutDate, totalAmount }) => {
  const bookingDetailsLink = `${process.env.FRONTEND_URL}/bookings/${bookingId}`;

  const mailOptions = {
    from: '"Bookinhub"',
    to: email,
    subject: `Your booking at ${hotelName} is confirmed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Your booking at <strong>${hotelName}</strong> has been successfully confirmed.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Check-in:</strong> ${new Date(checkInDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(checkOutDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹ ${totalAmount.toFixed(2)}</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${bookingDetailsLink}" 
             style="background: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Booking Details
          </a>
        </div>
        
        <p>Thank you for choosing Bookinhub. We wish you a pleasant stay!</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendBookingCancellation = async ({ email, userName, bookingId, hotelName }) => {
  const mailOptions = {
    from: '"Bookinhub"',
    to: email,
    subject: `Your booking at ${hotelName} has been cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Booking Cancelled</h2>
        <p>Hi ${userName},</p>
        <p>Your booking at <strong>${hotelName}</strong> (Booking ID: ${bookingId}) has been successfully cancelled.</p>
        
      
        
        <p>We're sorry to see you go. If there was anything we could have done better, please let us know.</p>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}" 
             style="background: #2196F3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Book Another Stay
          </a>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};