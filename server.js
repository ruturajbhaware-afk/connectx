const express = require('express');
const http = require('http');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bhawareraj852@gmail.com',
    pass: 'xxfusyqxejkzwvho'
  }
});

const otpStore = {};

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
      from: '"ConnectX Security" <bhawareraj852@gmail.com>',
      to: email,
      subject: `${otp} is your ConnectX verification code`,
      text: `Your ConnectX OTP is ${otp}. Valid for 5 minutes.`
    });
    console.log('[OTP Sent] to ' + email);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.log('[Mail Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, code } = req.body;
  const record = otpStore[email ? email.toLowerCase() : ''];

  if (!record) return res.status(400).json({ success: false, message: 'No OTP requested' });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, message: 'OTP Expired' });
  if (record.code !== code) return res.status(400).json({ success: false, message: 'Invalid verification code' });

  delete otpStore[email.toLowerCase()];
  res.json({ success: true, user: record.userData });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('ConnectX Server running on port ' + PORT));
