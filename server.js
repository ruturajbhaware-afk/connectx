const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors({ origin: '*' }));
app.use(express.json());

const otpStore = {};
let pendingMails = [];

// HTTP Signup OTP
app.post('/api/signup-otp', (req, res) => {
  const { fullName, username, email, password, gender, language } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email.toLowerCase()] = {
    code: otp,
    expires: Date.now() + 5 * 60 * 1000,
    userData: { fullName, username, email, password, gender, language }
  };

  pendingMails.push({ email, otp });
  res.json({ success: true, message: 'OTP queued' });
});

// Termux Pull
app.get('/api/worker/pull', (req, res) => {
  const batch = [...pendingMails];
  pendingMails = [];
  res.json(batch);
});

// HTTP Verify
app.post('/api/verify-otp', (req, res) => {
  const { email, code } = req.body;
  const record = otpStore[email ? email.toLowerCase() : ''];

  if (!record) return res.status(400).json({ success: false, message: 'No OTP requested' });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, message: 'OTP Expired' });
  if (record.code !== code) return res.status(400).json({ success: false, message: 'Invalid code' });

  const user = record.userData;
  delete otpStore[email.toLowerCase()];
  res.json({ success: true, user });
});

// Socket.io Handlers (App listening here)
io.on('connection', (socket) => {
  // App sends verify-otp or completeSignup via socket
  socket.on('verifyOtp', (data) => {
    const { email, code } = data || {};
    const record = otpStore[email ? email.toLowerCase() : ''];
    if (record && record.code === code) {
      const user = record.userData;
      delete otpStore[email.toLowerCase()];
      socket.emit('authSuccess', { user });
      socket.emit('otpVerified', { success: true, user });
    } else {
      socket.emit('authError', { message: 'Invalid or Expired OTP' });
    }
  });

  socket.on('verify-otp', (data) => {
    const { email, code } = data || {};
    const record = otpStore[email ? email.toLowerCase() : ''];
    if (record && record.code === code) {
      const user = record.userData;
      delete otpStore[email.toLowerCase()];
      socket.emit('authSuccess', { user });
      socket.emit('otpVerified', { success: true, user });
    } else {
      socket.emit('authError', { message: 'Invalid or Expired OTP' });
    }
  });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on ' + PORT));
