let discoveryUsers = [
  { fullName: "Sara Valenzuela", username: "sara_v", distance: "2.4 km away", status: "Online Now", bio: "Exploring tech & music.", dp: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80", isConnected: false },
  { fullName: "Aarav Deshmukh", username: "aarav_d", distance: "5.1 km away", status: "Online Now", bio: "Full stack developer nearby.", dp: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80", isConnected: false }
];
let currentIdx = 0;
let activeChatTarget = null;
let localMediaStream = null;

function renderDiscoveryCard(idx) {
  const p = discoveryUsers[idx];
  document.getElementById('card-user-name').innerText = p.fullName;
  document.getElementById('card-user-uname').innerText = `@${p.username}`;
  document.getElementById('card-user-details').innerText = `📍 ${p.distance} • ${p.status}`;
  document.getElementById('card-user-bio').innerText = p.bio;

  const avImg = document.getElementById('avatar-img');
  const avIcon = document.getElementById('avatar-icon');
  if (p.dp) { avImg.src = p.dp; avImg.classList.remove('hidden'); avIcon.classList.add('hidden'); }
  else { avImg.classList.add('hidden'); avIcon.classList.remove('hidden'); }

  const lockTags = document.querySelectorAll('.lock-tag');
  const btnConnect = document.getElementById('btn-connect');
  if (p.isConnected) {
    btnConnect.innerText = "Connected ✔";
    btnConnect.style.background = "#00e676";
    document.getElementById('action-chat').classList.add('unlocked');
    document.getElementById('action-voice').classList.add('unlocked');
    document.getElementById('action-video').classList.add('unlocked');
    lockTags.forEach(t => t.innerText = "🔓");
  } else {
    btnConnect.innerText = "Connect ⚡";
    btnConnect.style.background = "linear-gradient(135deg, #ff3366, #ff6b3d)";
    document.getElementById('action-chat').classList.remove('unlocked');
    document.getElementById('action-voice').classList.remove('unlocked');
    document.getElementById('action-video').classList.remove('unlocked');
    lockTags.forEach(t => t.innerText = "🔒");
  }
}

document.getElementById('btn-next').addEventListener('click', () => {
  currentIdx = (currentIdx + 1) % discoveryUsers.length;
  renderDiscoveryCard(currentIdx);
});

document.getElementById('btn-connect').addEventListener('click', () => {
  const target = discoveryUsers[currentIdx];
  if (target.isConnected) return alert(getMsg('already_friends', target.fullName));
  document.getElementById('btn-connect').innerText = "Sending Request...";
  setTimeout(() => {
    target.isConnected = true;
    renderDiscoveryCard(currentIdx);
    renderInboxList();
    alert(getMsg('connected_msg', target.fullName));
  }, 1000);
});

function verifySafety(t) {
  if (!t.isConnected) {
    alert(getMsg('lock_msg'));
    return false;
  }
  return true;
}

document.getElementById('action-chat').addEventListener('click', () => { if (verifySafety(discoveryUsers[currentIdx])) openChat(discoveryUsers[currentIdx]); });
document.getElementById('action-voice').addEventListener('click', () => { if (verifySafety(discoveryUsers[currentIdx])) startCall(discoveryUsers[currentIdx], false); });
document.getElementById('action-video').addEventListener('click', () => { if (verifySafety(discoveryUsers[currentIdx])) startCall(discoveryUsers[currentIdx], true); });

function openChat(target) {
  activeChatTarget = target;
  document.getElementById('chat-header-name').innerText = target.fullName;
  const cImg = document.getElementById('chat-header-img');
  const cIcon = document.getElementById('chat-header-icon');
  if (target.dp) { cImg.src = target.dp; cImg.classList.remove('hidden'); cIcon.classList.add('hidden'); }
  else { cImg.classList.add('hidden'); cIcon.classList.remove('hidden'); }

  const area = document.getElementById('chat-messages-area');
  area.innerHTML = '<div class="chat-timestamp">Connected on ConnectX</div>';
  const chatKey = `chat_${target.username}`;
  const history = JSON.parse(localStorage.getItem(chatKey)) || [{ sender: 'them', text: 'Hey! Nice to connect with you 👋' }];
  history.forEach(m => appendBubble(m.sender, m.text));

  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('inbox-screen').classList.add('hidden');
  document.getElementById('main-brand-header').classList.add('hidden');
  document.getElementById('chat-screen').classList.remove('hidden');
}

document.getElementById('chat-close-btn').addEventListener('click', () => {
  document.getElementById('chat-screen').classList.add('hidden');
  document.getElementById('main-brand-header').classList.remove('hidden');
  document.getElementById('home-screen').classList.remove('hidden');
  renderInboxList();
});

function appendBubble(sender, text) {
  const area = document.getElementById('chat-messages-area');
  const b = document.createElement('div');
  b.className = `msg-bubble ${sender === 'me' ? 'msg-sent' : 'msg-received'}`;
  b.innerText = text;
  area.appendChild(b);
  area.scrollTop = area.scrollHeight;
}

document.getElementById('chat-send-btn').addEventListener('click', sendMsg);
document.getElementById('chat-msg-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });

function sendMsg() {
  const input = document.getElementById('chat-msg-input');
  const text = input.value.trim();
  if (!text || !activeChatTarget) return;
  const chatKey = `chat_${activeChatTarget.username}`;
  appendBubble('me', text);
  input.value = '';
  let h = JSON.parse(localStorage.getItem(chatKey)) || [];
  h.push({ sender: 'me', text });
  localStorage.setItem(chatKey, JSON.stringify(h));
  setTimeout(() => {
    appendBubble('them', "Glad we connected here on ConnectX! 🔥");
    h.push({ sender: 'them', text: "Glad we connected here on ConnectX! 🔥" });
    localStorage.setItem(chatKey, JSON.stringify(h));
  }, 1000);
}

async function startCall(t, isVideo) {
  document.getElementById('call-user-name').innerText = t.fullName;
  document.getElementById('call-overlay').classList.remove('hidden');
  const status = document.getElementById('call-status-label');
  status.innerText = isVideo ? "Starting HD Video..." : "Connecting Voice Call...";
  const vBox = document.getElementById('video-preview-box');
  if (isVideo) {
    vBox.classList.remove('hidden');
    try {
      localMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      document.getElementById('local-video').srcObject = localMediaStream;
      status.innerText = "00:03 • Live HD Video";
    } catch(e) { status.innerText = "Connected (Video Preview Unavailable)"; }
  } else {
    vBox.classList.add('hidden');
    setTimeout(() => { status.innerText = "00:04 • In Voice Call"; }, 1500);
  }
}

document.getElementById('end-call-btn').addEventListener('click', () => {
  if (localMediaStream) { localMediaStream.getTracks().forEach(tr => tr.stop()); localMediaStream = null; }
  document.getElementById('call-overlay').classList.add('hidden');
  document.getElementById('video-preview-box').classList.add('hidden');
});

function renderInboxList() {
  const container = document.getElementById('inbox-list-container');
  const friends = discoveryUsers.filter(u => u.isConnected);
  document.getElementById('inbox-friends-count').innerText = `${friends.length} Friends`;
  container.innerHTML = '';
  if (friends.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:#64748b;padding:30px;">No friends yet. Connect first!</p>`;
    return;
  }
  friends.forEach(f => {
    const itm = document.createElement('div');
    itm.className = 'inbox-item';
    itm.innerHTML = `<div class="inbox-avatar">${f.dp ? `<img src="${f.dp}"/>` : '👤'}</div><div class="inbox-meta"><div class="inbox-name">${f.fullName}</div><div class="inbox-last-msg">Tap to chat</div></div><span style="color:#ff3366;">Chat ➤</span>`;
    itm.addEventListener('click', () => openChat(f));
    container.appendChild(itm);
  });
}
