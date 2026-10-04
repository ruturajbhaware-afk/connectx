const callOverlayContainer = document.getElementById('call-overlay');
if (callOverlayContainer) {
  callOverlayContainer.innerHTML = `
    <div class="call-body">
      <div class="call-avatar-wrap" id="call-avatar-box">
        <img id="call-user-img" src="" class="hidden" style="width:100%; height:100%; object-fit:cover;" />
        <span id="call-user-icon">👤</span>
      </div>
      <h3 id="call-user-name" style="margin-top: 4px;">Friend Name</h3>
      <span class="call-status-badge" id="call-status-label">Calling...</span>
      
      <div class="video-preview-box hidden" id="video-preview-box">
        <video id="local-video" autoplay playsinline muted></video>
      </div>

      <div class="call-controls-grid">
        <!-- 1. Mic Mute/Unmute -->
        <button class="call-svg-btn" id="ctrl-mute-btn" title="Mute Mic">
          <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </button>

        <!-- 2. Camera Hide / Show (Video Off/On) -->
        <button class="call-svg-btn" id="ctrl-cam-hide-btn" title="Hide/Show Camera">
          <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
        </button>

        <!-- 3. Flip Camera (Front / Back Switch) -->
        <button class="call-svg-btn" id="ctrl-flip-btn" title="Flip Camera">
          <svg viewBox="0 0 24 24"><path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3zm11-4V5h-3l-1.8-2H8.8L7 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8h-2zm-8 9c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
        </button>

        <!-- 4. Speaker Button -->
        <button class="call-svg-btn" id="ctrl-speaker-btn" title="Speaker">
          <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
        </button>

        <!-- 5. End Call -->
        <button class="call-end-danger" id="ctrl-end-btn" title="End Call">
          <svg viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
        </button>
      </div>
    </div>
  `;
}

let isAudioMuted = false;
let isCameraHidden = false;
let currentFacingMode = "user"; // 'user' = front, 'environment' = back
let isVideoCallActive = false;

window.startCall = async function(target, isVideo) {
  isVideoCallActive = isVideo;
  isCameraHidden = false;
  document.getElementById('call-user-name').innerText = target.fullName;
  
  const cImg = document.getElementById('call-user-img');
  const cIcon = document.getElementById('call-user-icon');

  if (target.dp) {
    cImg.src = target.dp;
    cImg.classList.remove('hidden');
    cIcon.classList.add('hidden');
  } else {
    cImg.classList.add('hidden');
    cIcon.classList.remove('hidden');
  }

  document.getElementById('call-overlay').classList.remove('hidden');
  const statusLabel = document.getElementById('call-status-label');
  const vBox = document.getElementById('video-preview-box');

  if (isVideo) {
    vBox.classList.remove('hidden');
    statusLabel.innerText = "Starting live video...";
    await launchCameraStream("user");
  } else {
    vBox.classList.add('hidden');
    statusLabel.innerText = "00:01 • In Voice Call";
  }
};

async function launchCameraStream(facing) {
  const vBox = document.getElementById('video-preview-box');
  const vid = document.getElementById('local-video');
  const statusLabel = document.getElementById('call-status-label');

  if (localMediaStream) {
    localMediaStream.getTracks().forEach(t => t.stop());
  }

  try {
    localMediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing },
      audio: true
    });
    vid.srcObject = localMediaStream;
    currentFacingMode = facing;
    vid.style.transform = (facing === "user") ? "scaleX(-1)" : "none";
    vBox.classList.remove('hidden');
    isVideoCallActive = true;
    statusLabel.innerText = "00:03 • Live HD Video";
  } catch (err) {
    statusLabel.innerText = "Video preview unavailable";
  }
}

// 1. Mic Toggle
document.getElementById('ctrl-mute-btn').addEventListener('click', function() {
  isAudioMuted = !isAudioMuted;
  if (localMediaStream) {
    localMediaStream.getAudioTracks().forEach(t => t.enabled = !isAudioMuted);
  }
  this.classList.toggle('active-off', isAudioMuted);
});

// 2. Camera Hide/Show Toggle (Video Mute)
document.getElementById('ctrl-cam-hide-btn').addEventListener('click', async function() {
  if (!isVideoCallActive) {
    // Voice call madhun video call chalu karne
    await launchCameraStream("user");
    return;
  }
  isCameraHidden = !isCameraHidden;
  if (localMediaStream) {
    localMediaStream.getVideoTracks().forEach(t => t.enabled = !isCameraHidden);
  }
  const vBox = document.getElementById('video-preview-box');
  if (isCameraHidden) {
    vBox.classList.add('hidden');
  } else {
    vBox.classList.remove('hidden');
  }
  this.classList.toggle('active-off', isCameraHidden);
});

// 3. Flip Camera (Front <-> Back Switch)
document.getElementById('ctrl-flip-btn').addEventListener('click', async function() {
  if (!isVideoCallActive || isCameraHidden) return alert("Please turn on camera first!");
  const nextFacing = (currentFacingMode === "user") ? "environment" : "user";
  await launchCameraStream(nextFacing);
});

// 4. Speaker Button
document.getElementById('ctrl-speaker-btn').addEventListener('click', function() {
  this.classList.toggle('active-off');
});

// 5. End Call Button
document.getElementById('ctrl-end-btn').addEventListener('click', function() {
  if (localMediaStream) {
    localMediaStream.getTracks().forEach(track => track.stop());
    localMediaStream = null;
  }
  isVideoCallActive = false;
  document.getElementById('call-overlay').classList.add('hidden');
  document.getElementById('video-preview-box').classList.add('hidden');
});
