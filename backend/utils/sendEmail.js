require('dotenv').config(); // Load environment variables
const nodemailer = require('nodemailer');

// ✅ Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail (from .env)
    pass: process.env.GMAIL_PASS  // Your App Password (from .env)
  }
});

/**
 * ✅ Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text message body
 */
const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER, // Sender address
    to,
    subject,
    text
  });
};

module.exports = sendEmail;
