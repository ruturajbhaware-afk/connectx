const socket = io('https://connectx-ej5p.onrender.com', {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  timeout: 20000
});
socket.on('connect', () => {
  alert('Connected to Render Server successfully!');
});
socket.on('connect_error', (err) => {
  alert('Socket Connection Error: ' + err.message);
});
socket.on('auth_error', (data) => {
  alert('Auth Error: ' + data.message);
});
socket.on('otp_sent', () => {
  alert('OTP sent successfully to your email!');
});


let n1 = Math.floor(Math.random() * 8) + 1;
let n2 = Math.floor(Math.random() * 8) + 1;
let captchaAns = n1 + n2;
const capEl = document.getElementById('captcha-code');
if (capEl) capEl.innerText = `${n1} + ${n2}`;

let activeSessionEmail = "";

// Auth Elements
const authScreen = document.getElementById('auth-screen');
const otpScreen = document.getElementById('otp-screen');
const homeScreen = document.getElementById('home-screen');
const inboxScreen = document.getElementById('inbox-screen');
const profileEditScreen = document.getElementById('profile-edit-screen');
const bottomNav = document.getElementById('bottom-nav');

const tabSignup = document.getElementById('tab-signup');
const tabLogin = document.getElementById('tab-login');
const signupFields = document.getElementById('signup-fields');
const loginFields = document.getElementById('login-fields');

// Tab Switching Fix (SignUp <-> Login)
if (tabSignup && tabLogin) {
  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupFields.classList.remove('hidden');
    loginFields.classList.add('hidden');
  });

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginFields.classList.remove('hidden');
    signupFields.classList.add('hidden');
  });
}

function togglePass(id, btn) {
  const f = document.getElementById(id);
  if (!f) return;
  f.type = (f.type === 'password') ? 'text' : 'password';
  btn.innerText = (f.type === 'password') ? '👁️' : '🙈';
}

// SignUp Button Event
document.getElementById('signup-btn').addEventListener('click', () => {
  const name = document.getElementById('su-name').value.trim();
  const username = document.getElementById('su-username').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const password = document.getElementById('su-password').value.trim();
  const gender = document.getElementById('su-gender').value;
  const language = document.getElementById('su-language').value;
  const ans = parseInt(document.getElementById('captcha-input').value.trim());

  if (!name || !username || !email || !password || !gender || !language) {
    return alert('Please fill all fields!');
  }
  if (ans !== captchaAns) {
    return alert('Math captcha incorrect!');
  }

  activeSessionEmail = email;
  socket.emit('request_signup_otp', { fullName: name, username, email, password, gender, language });
});

// Login Button Event
document.getElementById('login-btn').addEventListener('click', () => {
  const email = document.getElementById('li-email').value.trim();
  const password = document.getElementById('li-password').value.trim();
  if (!email || !password) return alert('Enter email and password!');
  activeSessionEmail = email;
  socket.emit('request_login_otp', { email, password });
});

socket.on('otp_sent_success', (res) => {
  authScreen.classList.add('hidden');
  otpScreen.classList.remove('hidden');
  document.getElementById('otp-hint').innerText = `Verification code sent to ${res.email}`;
});

socket.on('auth_error', (res) => alert(res.message));

document.getElementById('back-btn').addEventListener('click', () => {
  otpScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
});

document.getElementById('verify-btn').addEventListener('click', () => {
  const token = document.getElementById('otp-input').value.trim();
  if (!token) return alert('Please enter code');
  socket.emit('verify_otp', { email: activeSessionEmail, token });
});

socket.on('verify_error', (res) => alert(res.message));

socket.on('auth_complete', (res) => {
  localStorage.setItem('connectx_session', JSON.stringify(res.user));
  initApp(res.user);
});

function initApp(me) {
  authScreen.classList.add('hidden');
  otpScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  profileEditScreen.classList.add('hidden');
  inboxScreen.classList.add('hidden');
  bottomNav.classList.remove('hidden');

  renderDiscoveryCard(0);
  renderInboxList();
  loadProfileData();
}

// Navigation Tabs
document.getElementById('nav-discover').addEventListener('click', () => {
  document.getElementById('nav-discover').classList.add('active');
  document.getElementById('nav-chats').classList.remove('active');
  document.getElementById('nav-profile').classList.remove('active');
  homeScreen.classList.remove('hidden');
  inboxScreen.classList.add('hidden');
  profileEditScreen.classList.add('hidden');
});

document.getElementById('nav-chats').addEventListener('click', () => {
  document.getElementById('nav-chats').classList.add('active');
  document.getElementById('nav-discover').classList.remove('active');
  document.getElementById('nav-profile').classList.remove('active');
  inboxScreen.classList.remove('hidden');
  homeScreen.classList.add('hidden');
  profileEditScreen.classList.add('hidden');
  renderInboxList();
});

document.getElementById('nav-profile').addEventListener('click', () => {
  document.getElementById('nav-profile').classList.add('active');
  document.getElementById('nav-discover').classList.remove('active');
  document.getElementById('nav-chats').classList.remove('active');
  profileEditScreen.classList.remove('hidden');
  homeScreen.classList.add('hidden');
  inboxScreen.classList.add('hidden');
  loadProfileData();
});

function loadProfileData() {
  const me = JSON.parse(localStorage.getItem('connectx_session')) || {};
  document.getElementById('my-profile-name').innerText = me.fullName || 'User';
  document.getElementById('my-profile-uname').innerText = `@${me.username || 'username'}`;
  document.getElementById('my-account-email').innerText = me.email || 'Registered Email';
  document.getElementById('edit-fullname').value = me.fullName || '';
  document.getElementById('edit-uname-input').value = me.username || '';
  document.getElementById('edit-bio').value = me.bio || '';
  if (me.language) document.getElementById('edit-language').value = me.language;
  if (me.location) document.getElementById('location-text').innerText = `📍 ${me.location}`;
  if (me.dp) {
    document.getElementById('my-dp-img').src = me.dp;
    document.getElementById('my-dp-img').classList.remove('hidden');
    document.getElementById('my-dp-icon').classList.add('hidden');
  }
}

// DP Upload
document.getElementById('my-dp-box').addEventListener('click', () => document.getElementById('my-dp-input').click());
document.getElementById('my-dp-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 500;
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h *= maxDim / w; w = maxDim; }
      else if (h > maxDim) { w *= maxDim / h; h = maxDim; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.82);
      const me = JSON.parse(localStorage.getItem('connectx_session')) || {};
      me.dp = compressed;
      localStorage.setItem('connectx_session', JSON.stringify(me));
      document.getElementById('my-dp-img').src = compressed;
      document.getElementById('my-dp-img').classList.remove('hidden');
      document.getElementById('my-dp-icon').classList.add('hidden');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

// Save Profile
document.getElementById('save-my-profile-btn').addEventListener('click', () => {
  const me = JSON.parse(localStorage.getItem('connectx_session')) || {};
  me.fullName = document.getElementById('edit-fullname').value.trim() || me.fullName;
  me.username = document.getElementById('edit-uname-input').value.trim().replace('@', '') || me.username;
  me.bio = document.getElementById('edit-bio').value.trim();
  me.language = document.getElementById('edit-language').value;
  localStorage.setItem('connectx_session', JSON.stringify(me));
  document.getElementById('my-profile-name').innerText = me.fullName;
  document.getElementById('my-profile-uname').innerText = `@${me.username}`;
  alert(getMsg('profile_saved'));
});

// GPS Auto-detect
document.getElementById('detect-loc-btn').addEventListener('click', () => {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  document.getElementById('location-text').innerText = "📍 Detecting coordinates...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const locStr = `GPS: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)} (Nearby Enabled)`;
      document.getElementById('location-text').innerText = `📍 ${locStr}`;
      const me = JSON.parse(localStorage.getItem('connectx_session')) || {};
      me.location = locStr;
      localStorage.setItem('connectx_session', JSON.stringify(me));
      alert(getMsg('loc_detected'));
    },
    () => { document.getElementById('location-text').innerText = "📍 Permission denied"; }
  );
});

document.getElementById('toggle-acc-btn').addEventListener('click', () => {
  document.getElementById('acc-details-box').classList.toggle('hidden');
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('connectx_session');
  location.reload();
});

const saved = localStorage.getItem('connectx_session');
if (saved) {
  initApp(JSON.parse(saved));
}
