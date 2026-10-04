// Developer Mode & Public Glitch Reporter with Secret PIN
document.addEventListener("DOMContentLoaded", () => {
  // 1. Top Public Release Banner (Report Bug / Glitch)
  const appContainer = document.querySelector(".app-container");
  const topReportBanner = document.createElement("div");
  topReportBanner.id = "public-bug-banner";
  topReportBanner.style.cssText = "background:linear-gradient(90deg, #1e1b4b, #311042); color:#cbd5e1; font-size:0.68rem; padding:5px 10px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #4338ca; z-index:99;";
  topReportBanner.innerHTML = `
    <span>📢 <b>Beta Release:</b> Found a bug or glitch?</span>
    <button id="open-bug-report-btn" style="background:#ff3366; color:#fff; border:none; padding:3px 8px; border-radius:6px; font-size:0.65rem; font-weight:700; cursor:pointer;">Report / Send Screenshot</button>
  `;
  appContainer.insertBefore(topReportBanner, appContainer.firstChild);

  // 2. User Bug Reporting Modal
  const bugModal = document.createElement("div");
  bugModal.id = "bug-report-modal";
  bugModal.className = "call-overlay hidden";
  bugModal.innerHTML = `
    <div style="background:#131520; border:1px solid #2d334d; padding:18px; border-radius:18px; width:88%; max-width:350px; display:flex; flex-direction:column; gap:8px;">
      <h4 style="color:#ff3366; text-align:center;">Report Glitch to Developer</h4>
      <p style="font-size:0.75rem; color:#94a3b8; text-align:center;">Describe the glitch or upload a screenshot to assist Ruturaj in fixing it.</p>
      <textarea id="bug-desc" class="input-field" rows="3" placeholder="Explain what happened..."></textarea>
      <label style="font-size:0.72rem; color:#cbd5e1;">Attach Screenshot (Optional):</label>
      <input type="file" id="bug-img-input" accept="image/*" class="input-field" style="padding:4px;" />
      <button id="submit-bug-btn" class="btn">Send Bug Report</button>
      <button id="close-bug-btn" class="btn" style="background:transparent; border:1px solid #475569;">Cancel</button>
    </div>
  `;
  document.body.appendChild(bugModal);

  document.getElementById("open-bug-report-btn").addEventListener("click", () => bugModal.classList.remove("hidden"));
  document.getElementById("close-bug-btn").addEventListener("click", () => bugModal.classList.add("hidden"));

  let attachedScreenshot = "";
  document.getElementById("bug-img-input").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => attachedScreenshot = evt.target.result;
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("submit-bug-btn").addEventListener("click", () => {
    const desc = document.getElementById("bug-desc").value.trim();
    if (!desc) return alert("Please write a brief description of the glitch!");

    let reports = JSON.parse(localStorage.getItem("dev_bug_reports")) || [];
    reports.push({
      desc: desc,
      screenshot: attachedScreenshot,
      time: new Date().toLocaleString(),
      device: navigator.userAgent
    });
    localStorage.setItem("dev_bug_reports", JSON.stringify(reports));

    alert("✅ Thank you! Your report and screenshot have been delivered to the Developer Dashboard.");
    document.getElementById("bug-desc").value = "";
    attachedScreenshot = "";
    bugModal.classList.add("hidden");
  });

  // 3. Secret Developer Mode PIN Verification (Default PIN: 3580)
  const brandTitle = document.querySelector(".brand-title");
  let tapCount = 0;
  if (brandTitle) {
    brandTitle.addEventListener("click", () => {
      tapCount++;
      if (tapCount >= 5) {
        tapCount = 0;
        const enteredPin = prompt("🔒 Developer Access Required\nEnter Secret Developer PIN:");
        if (enteredPin === "3580") {
          openDeveloperDashboard();
        } else if (enteredPin !== null) {
          alert("❌ Access Denied: Incorrect Developer PIN!");
        }
      }
    });
  }

  function openDeveloperDashboard() {
    const devReports = JSON.parse(localStorage.getItem("dev_bug_reports")) || [];
    const safetyReports = JSON.parse(localStorage.getItem("connectx_reports")) || [];
    
    const devDashboard = document.createElement("div");
    devDashboard.className = "call-overlay";
    devDashboard.style.zIndex = "500";
    devDashboard.innerHTML = `
      <div style="background:#0a0c14; border:1px solid #ff3366; width:92%; max-width:390px; height:80vh; border-radius:18px; padding:16px; display:flex; flex-direction:column; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #252a3d; padding-bottom:8px;">
          <h3 style="color:#00e676; font-size:1rem;">🛠️ Dev Dashboard (Unlocked)</h3>
          <button id="close-dev-btn" style="background:transparent; border:none; color:#ff3366; font-size:1.2rem; cursor:pointer;">✖</button>
        </div>
        <div style="flex:1; overflow-y:auto; margin-top:10px; display:flex; flex-direction:column; gap:10px;">
          <h5 style="color:#ff3366;">User Glitch Reports (${devReports.length})</h5>
          ${devReports.length === 0 ? '<p style="font-size:0.75rem; color:#64748b;">No glitches reported yet.</p>' : ''}
          ${devReports.map((r) => `
            <div style="background:#141724; padding:8px; border-radius:10px; font-size:0.75rem; border:1px solid #23293d;">
              <div style="color:#a0aec0; font-size:0.65rem;">🕒 ${r.time}</div>
              <div style="color:#fff; margin-top:3px;"><b>Glitch:</b> ${r.desc}</div>${r.screenshot ? `<img src="${r.screenshot}" style="width:100%; border-radius:8px; margin-top:6px; max-height:160px; object-fit:contain; background:#000;" />` : ''}
            </div>
          `).join('')}

          <h5 style="color:#00a2ff; margin-top:10px;">User Safety Flags (${safetyReports.length})</h5>
          ${safetyReports.length === 0 ? '<p style="font-size:0.75rem; color:#64748b;">No users reported.</p>' : ''}
          ${safetyReports.map((s) => `
            <div style="background:#141724; padding:8px; border-radius:10px; font-size:0.75rem; border:1px solid #23293d;">
              <div style="color:#a0aec0; font-size:0.65rem;">🕒 ${s.time}</div>
              <div style="color:#ff1744;"><b>Reported:</b> @${s.target}</div>
              <div style="color:#cbd5e1;"><b>Reason:</b> ${s.reason}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(devDashboard);
    document.getElementById("close-dev-btn").addEventListener("click", () => devDashboard.remove());
  }
});
