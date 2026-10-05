const express = require('express');
const http = require('http');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'bhawareraj852@gmail.com',
    pass: 'xxfusyqxejkzwvho'
  },
  tls: {
    rejectUnauthorized: false
  }
});

const otpStore = {};

// Real Security OTP Endpoint
app.post('/api/signup-otp', async (req, res) => {
  const { fullName, username, email, password, gender, language } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email.toLowerCase()] = {
    code: otp,
    expires: Date.now() + 5 * 60 * 1000,
    userData: { fullName, username, email, password, gender, language }
  };

  try {
    await transporter.sendMail({
      from: '"ConnectX Official" <bhawareraj852@gmail.com>',
      to: email,
      subject: `${otp} is your ConnectX verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f1015; padding: 25px; border-radius: 12px; color: #ffffff; max-width: 450px;">
          <h2 style="color: #ff3366;">ConnectX Security Gateway</h2>
          <p>Your official verification code is:</p>
          <div style="margin: 20px 0; background: #1f212d; padding: 15px; border-radius: 8px; text-align: center; border: 1px dashed #ff3366;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ff3366;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 12px;">Valid for 5 minutes. Never share this code.</p>
        </div>
      `
    });
    console.log('[Real OTP Sent] to: ' + email);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.log('[Mail Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send email. Check address.' });
  }
});

// Real Verify OTP Endpoint
app.post('/api/verify-otp', (req, res) => {
  const { email, code } = req.body;
  const record = otpStore[email ? email.toLowerCase() : ''];

  if (!record) return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, message: 'OTP Expired' });
  if (record.code !== code) return res.status(400).json({ success: false, message: 'Invalid verification code' });

  delete otpStore[email.toLowerCase()];
  res.json({ success: true, user: record.userData });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('ConnectX Server running on port ' + PORT));
