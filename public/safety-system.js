// Phase 3 & 6: Moderation, Block, Report, and Privacy Controls
document.addEventListener("DOMContentLoaded", () => {
  // Inject Safety Action Menu in Chat Header
  const chatHeaderActions = document.querySelector(".chat-header-actions");
  if (chatHeaderActions) {
    const moreBtn = document.createElement("button");
    moreBtn.className = "chat-action-icon";
    moreBtn.id = "chat-more-options";
    moreBtn.innerHTML = "⋮";
    moreBtn.title = "Safety & Options";
    chatHeaderActions.appendChild(moreBtn);

    // Modal Sheet
    const modal = document.createElement("div");
    modal.id = "safety-modal";
    modal.className = "call-overlay hidden";
    modal.innerHTML = `
      <div style="background:#161926; border:1px solid #282f48; padding:20px; border-radius:18px; width:85%; max-width:340px; display:flex; flex-direction:column; gap:10px;">
        <h4 style="color:#ff3366; text-align:center; margin-bottom:5px;">User Safety & Controls</h4>
        <button id="btn-unfriend" class="btn" style="background:#222638; font-size:0.82rem;">❌ Remove Connection</button>
        <button id="btn-block" class="btn" style="background:#ff1744; font-size:0.82rem;">🚫 Block User</button>
        <button id="btn-report" class="btn" style="background:#374151; font-size:0.82rem;">⚠️ Report Fake / Spam</button>
        <button id="btn-close-safety" class="btn" style="background:transparent; border:1px solid #475569; font-size:0.82rem;">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);

    moreBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    document.getElementById("btn-close-safety").addEventListener("click", () => modal.classList.add("hidden"));

    document.getElementById("btn-block").addEventListener("click", () => {
      if (confirm("Are you sure you want to block this user? They won't be able to find or message you.")) {
        if (typeof activeChatTarget !== "undefined" && activeChatTarget) {
          activeChatTarget.isConnected = false;
          let blocked = JSON.parse(localStorage.getItem("blocked_users")) || [];
          blocked.push(activeChatTarget.username);
          localStorage.setItem("blocked_users", JSON.stringify(blocked));
          alert("User blocked successfully.");
          modal.classList.add("hidden");
          document.getElementById("chat-close-btn").click();
          if (typeof renderDiscoveryCard === "function") renderDiscoveryCard(0);
          if (typeof renderInboxList === "function") renderInboxList();
        }
      }
    });

    document.getElementById("btn-unfriend").addEventListener("click", () => {
      if (confirm("Disconnect with this friend?")) {
        if (typeof activeChatTarget !== "undefined" && activeChatTarget) {
          activeChatTarget.isConnected = false;
          alert("Connection removed.");
          modal.classList.add("hidden");
          document.getElementById("chat-close-btn").click();
          if (typeof renderDiscoveryCard === "function") renderDiscoveryCard(0);
          if (typeof renderInboxList === "function") renderInboxList();
        }
      }
    });

    document.getElementById("btn-report").addEventListener("click", () => {
      const reason = prompt("Please describe the issue (Fake profile, Harassment, Inappropriate behavior):");
      if (reason) {
        let reports = JSON.parse(localStorage.getItem("connectx_reports")) || [];
        reports.push({
          target: activeChatTarget ? activeChatTarget.username : "Unknown",
          reason: reason,
          time: new Date().toLocaleString()
        });
        localStorage.setItem("connectx_reports", JSON.stringify(reports));
        alert("Report submitted to Developer Moderation Board. Thank you for keeping ConnectX safe!");
        modal.classList.add("hidden");
      }
    });
  }
});
