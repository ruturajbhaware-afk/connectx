const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const otpStore = {};
let pendingMails = [];

// 1. App sends signup request here
app.post('/api/signup-otp', (req, res) => {
  const { fullName, username, email, password, gender, language } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email.toLowerCase()] = {
    code: otp,
    expires: Date.now() + 5 * 60 * 1000,
    userData: { fullName, username, email, password, gender, language }
  };

  // Queue mail for Termux worker
  pendingMails.push({ email, otp });
  console.log('[Queued OTP for Termux Worker]:', email, otp);
  res.json({ success: true, message: 'OTP queued successfully' });
});

// 2. Termux Worker fetches pending mails
app.get('/api/worker/pull', (req, res) => {
  const batch = [...pendingMails];
  pendingMails = [];
  res.json(batch);
});

// 3. Verify OTP
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
server.listen(PORT, () => console.log('Relay Server running on port ' + PORT));
