const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Databases
const registeredUsers = new Map(); // Key: email -> User Object
const takenUsernames = new Set();  // Unique username check sathi
const activeOTPs = new Map();      // OTP storage

// Official ConnectX Gmail Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bhawareraj852@gmail.com',
    pass: 'xxfusyqxejkzwvho'
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on('connection', (socket) => {
  console.log(`[+] Device connected: ${socket.id}`);

  // 1. Sign Up OTP Request (Strict Unique Checks)
  socket.on('request_signup_otp', async (data) => {
    const email = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase().replace('@', '');

    // Check 1: Single Email Rule
    if (registeredUsers.has(email)) {
      socket.emit('auth_error', { message: 'An account already exists with this email. Please Login!' });
      return;
    }

    // Check 2: Unique Username Rule
    if (takenUsernames.has(cleanUsername)) {
      socket.emit('auth_error', { message: `@${cleanUsername} is already taken! Please choose another username.` });
      return;
    }

    const otp = generateOTP();
    activeOTPs.set(email, {
      code: otp,
      type: 'SIGNUP',
      userData: {
        ...data,
        username: cleanUsername,
        email: email
      },
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    sendVerificationMail(email, otp, socket);
  });

  // 2. Login OTP Request
  socket.on('request_login_otp', async (data) => {
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!registeredUsers.has(email)) {
      socket.emit('auth_error', { message: 'No ConnectX account found with this email. Please Sign Up!' });
      return;
    }

    const user = registeredUsers.get(email);
    if (user.password !== password) {
      socket.emit('auth_error', { message: 'Incorrect password! Please try again.' });
      return;
    }

    const otp = generateOTP();
    activeOTPs.set(email, {
      code: otp,
      type: 'LOGIN',
      userData: user,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    sendVerificationMail(email, otp, socket);
  });

  // Helper: Real Email Delivery
  async function sendVerificationMail(email, otp, userSocket) {
    const mailOptions = {
      from: '"ConnectX Official" <bhawareraj852@gmail.com>',
      to: email,
      subject: `${otp} is your ConnectX verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f1015; padding: 25px; border-radius: 12px; color: #ffffff; max-width: 450px;">
          <h2 style="color: #ff3366; margin-bottom: 5px;">ConnectX</h2>
          <p style="color: #cccccc; font-size: 14px;">Your official verification code is:</p>
          <div style="margin: 25px 0; background: #1f212d; padding: 15px; border-radius: 10px; text-align: center; border: 1px dashed #ff3366;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff3366;">${otp}</span>
          </div>
          <p style="color: #aaaaaa; font-size: 13px;">This code is valid for 5 minutes. Never share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #2a2d3d; margin: 20px 0;">
          <p style="color: #666666; font-size: 11px;">ConnectX Security Gateway • Verified Account Protection</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[✓] Real ConnectX verification sent to: ${email}`);
      userSocket.emit('otp_sent_success', { email: email });
    } catch (err) {
      console.log(`[X] Mail Failed:`, err.message);
      userSocket.emit('auth_error', { message: 'Failed to deliver verification email. Verify internet or email format.' });
    }
  }

  // 3. Verify OTP
  socket.on('verify_otp', (data) => {
    const email = data.email.trim().toLowerCase();
    const token = data.token.trim();
    const record = activeOTPs.get(email);

    if (!record) {
      socket.emit('verify_error', { message: 'No OTP session found. Please request a new code.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      activeOTPs.delete(email);
      socket.emit('verify_error', { message: 'OTP has expired! Please request a new code.' });
      return;
    }

    if (record.code === token) {
      if (record.type === 'SIGNUP') {
        registeredUsers.set(email, record.userData);
        takenUsernames.add(record.userData.username);
      }

      const verifiedUser = registeredUsers.get(email);
      activeOTPs.delete(email);

      console.log(`[✓] User verified & logged in: ${verifiedUser.username} (${email})`);
      socket.emit('auth_complete', { 
        user: {
          fullName: verifiedUser.fullName,
          username: verifiedUser.username,
          gender: verifiedUser.gender,
          language: verifiedUser.language,
          email: verifiedUser.email
        }
      });
    } else {
      socket.emit('verify_error', { message: 'Invalid OTP code! Please check your Gmail.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[-] Device disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[✓] ConnectX Engine running on http://localhost:${PORT}`);
});
