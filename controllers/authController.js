const otpStore = new Map();
const transporter = require('../emailConfig');
const EMAIL_FROM ='manitejavadnala@gmail.com';

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(req, res) {
    try {
        const { email } = req.body;
        
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 300000; // 5 minutes expiration
        
        // Store OTP
        otpStore.set(email, { otp, expiresAt });
        
        // Email options
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: 'Your OTP Verification Code',
            text: `Your OTP code is: ${otp}\nThis code will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">OTP Verification</h2>
                    <p>Your one-time verification code is:</p>
                    <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #2c3e50;">${otp}</div>
                    <p>This code will expire in 5 minutes.</p>
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        console.log(`OTP sent to ${email}`);
        res.status(200).json({ message: "OTP sent successfully to your email" });
        
    } catch (error) {
        console.error("Error sending OTP email:", error);
        res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }
}

async function verifyOTP(req, res) {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const storedData = otpStore.get(email);
        
        // Check if OTP exists
        if (!storedData) {
            return res.status(400).json({ message: "OTP not found. Please request a new one." });
        }
        
        // Check if OTP expired
        if (storedData.expiresAt < Date.now()) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }
        
        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }
        
        // OTP is valid - remove it from storage
        otpStore.delete(email);
        
        res.status(200).json({ 
            message: "OTP verified successfully",
            email: email
        });
        
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Failed to verify OTP. Please try again later." });
    }
}

module.exports = {
    sendOTP,
    verifyOTP
};