const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const db = require('../db'); // adjust the path if needed

dotenv.config();
const router = express.Router();

// Temporary in-memory storage (in production, store OTPs in DB or Redis)
const otpStore = new Map(); // { mobile: { otp, expiresAt } }

// SMS configuration
const SMS_CONFIG = {
  username: process.env.SMS_USERNAME || 'friendsjewellers',
  password: process.env.SMS_PASSWORD || 'user@123',
  senderId: process.env.SMS_SENDERID || 'FRNJEW',
  entityId: process.env.SMS_ENTITYID || '1101383680000087435',
  // Template IDs based on message type
  templateIds: {
    cust_reg: process.env.SMS_REGISTRATIONTEMPLATEID || '1107175681528365074',
    app_download: process.env.SMS_ORDERTEMPLATEID || '1107175024829366753',
    default: process.env.SMS_OTPTEMPLATEID || '1107175024835612317'
  }
};

// SMS sending function
async function sendSMS(phoneNumber, message, templateType = 'default') {
  try {
    // Prepare the request payload for SMSJust API
    const smsUrl = `https://www.smsjust.com/blank/sms/user/urlsms.php?username=${SMS_CONFIG.username}&pass=${SMS_CONFIG.password}&senderid=${SMS_CONFIG.senderId}&dest_mobileno=${phoneNumber.replace(/\D/g, '')}&message=${encodeURIComponent(message)}&dltentityid=${SMS_CONFIG.entityId}&dlttempid=${SMS_CONFIG.templateIds[templateType] || SMS_CONFIG.templateIds.default}&response=Y`;

    const response = await axios.get(smsUrl);
    
    return {
      success: true,
      messageId: response.data || null
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// API endpoint to send SMS to multiple numbers
router.post('/send-sms', async (req, res) => {
  const { phoneNumbers, message, template } = req.body;

  // Validate request
  if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    return res.status(400).json({ error: 'Phone numbers array is required' });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const results = [];
    let sentCount = 0;

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      // Basic phone number validation
      if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
        results.push({
          phoneNumber,
          success: false,
          error: 'Invalid phone number'
        });
        continue;
      }

      const result = await sendSMS(phoneNumber, message, template);
      if (result.success) {
        sentCount++;
      }
      
      results.push({
        phoneNumber,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
    }

    res.json({
      success: true,
      sentCount,
      totalCount: phoneNumbers.length,
      results
    });
  } catch (error) {
    console.error('Error in send-sms endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

  // Send SMS using the sendSMS function
  const message = `Dear Customer, Your OTP number is ${otp}, Do not share it with anyone - FRIENDS JEWELLERS`;
  
  try {
    const result = await sendSMS(mobile, message, 'default');
    
    if (result.success) {
      return res.json({ message: 'OTP sent successfully' });
    } else {
      console.error('Failed to send SMS:', result.error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
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