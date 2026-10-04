// Dedicated Click Listeners for Chat Header Voice & Video Calls
document.addEventListener("DOMContentLoaded", () => {
  const btnVoice = document.getElementById("chat-top-call");
  const btnVideo = document.getElementById("chat-top-video");

  if (btnVoice) {
    btnVoice.addEventListener("click", () => {
      const target = (typeof activeChatTarget !== "undefined" && activeChatTarget) ? activeChatTarget : discoveryUsers[currentIdx];
      if (typeof startCall === "function" && target) {
        startCall(target, false);
      }
    });
  }

  if (btnVideo) {
    btnVideo.addEventListener("click", () => {
      const target = (typeof activeChatTarget !== "undefined" && activeChatTarget) ? activeChatTarget : discoveryUsers[currentIdx];
      if (typeof startCall === "function" && target) {
        startCall(target, true);
      }
    });
  }
});
