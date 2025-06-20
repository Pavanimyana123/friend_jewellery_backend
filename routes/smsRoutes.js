const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const db = require('../db'); // adjust the path if needed

dotenv.config();
const router = express.Router();

// Temporary in-memory storage (in production, store OTPs in DB or Redis)
const otpStore = new Map(); // { mobile: { otp, expiresAt } }

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  // Check if mobile is registered
  const rows = await db.query('SELECT * FROM account_details WHERE mobile = ?', [mobile]);

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Mobile number not registered' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-min expiry
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(mobile, { otp, expiresAt });

  // Send SMS
  const message = `Dear Customer, Your OTP number is ${otp}, Do not share it with anyone - FRIENDS JEWELLERS`;
  const smsUrl = `https://www.smsjust.com/blank/sms/user/urlsms.php?username=${process.env.SMS_USERNAME}&pass=${process.env.SMS_PASSWORD}&senderid=${process.env.SMS_SENDERID}&dest_mobileno=${mobile}&message=${encodeURIComponent(message)}&dltentityid=${process.env.SMS_ENTITYID}&dlttempid=${process.env.SMS_TEMPLATEID}&response=Y`;

  try {
    const smsResponse = await axios.get(smsUrl);
    // console.log('SMS Sent:', smsResponse.data);
    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Check mobile existence
router.post('/check-mobile', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ message: 'Mobile number is required' });

  const rows = await db.query('SELECT * FROM account_details WHERE mobile = ?', [mobile]);

  return res.json({ exists: rows.length > 0 });
});

// Verify OTP and return user
router.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: 'Mobile and OTP are required' });
  }

  const otpData = otpStore.get(mobile);
  if (!otpData || otpData.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(mobile);
    return res.status(400).json({ message: 'OTP expired' });
  }

  // OTP is valid – return user data
 const rows = await db.query('SELECT * FROM account_details WHERE mobile = ?', [mobile]);

  if (rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  otpStore.delete(mobile); // remove after successful verification
  const user = rows[0];
  return res.json({ message: 'OTP verified', user });
});

module.exports = router;
