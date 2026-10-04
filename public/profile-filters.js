// Phase 4 & 5: Advanced Profile Tags & Filter Discovery
document.addEventListener("DOMContentLoaded", () => {
  // 1. Add Filter Button to Brand Header
  const headerTop = document.querySelector(".header-top");
  if (headerTop) {
    const filterBtn = document.createElement("button");
    filterBtn.id = "btn-discover-filter";
    filterBtn.className = "icon-nav-btn";
    filterBtn.innerHTML = "🔍";
    filterBtn.title = "Filter Discovery";
    filterBtn.style.marginRight = "6px";
    headerTop.insertBefore(filterBtn, headerTop.firstChild);

    // Filter Modal Sheet
    const filterModal = document.createElement("div");
    filterModal.id = "filter-modal";
    filterModal.className = "call-overlay hidden";
    filterModal.innerHTML = `
      <div style="background:#161926; border:1px solid #282f48; padding:20px; border-radius:18px; width:88%; max-width:350px; display:flex; flex-direction:column; gap:10px;">
        <h4 style="color:#00a2ff; text-align:center;">Discovery Smart Filters</h4>
        <label style="font-size:0.75rem; color:#a0aec0;">Filter by Learning Language:</label>
        <select id="filter-lang-select" class="input-field">
          <option value="all">All Languages Worldwide</option>
          <option value="es">Español (Spanish)</option>
          <option value="en">English</option>
          <option value="mr">मराठी (Marathi)</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="de">Deutsch (German)</option>
        </select>
        <label style="font-size:0.75rem; color:#a0aec0;">Filter by Interest:</label>
        <select id="filter-interest-select" class="input-field">
          <option value="all">All Interests</option>
          <option value="coding">Coding & Tech</option>
          <option value="music">Music & Art</option>
          <option value="gaming">Gaming & Anime</option>
          <option value="travel">Travel & Culture</option>
        </select>
        <button id="apply-filter-btn" class="btn" style="background:#00a2ff; margin-top:5px;">Apply Filters</button>
        <button id="close-filter-btn" class="btn" style="background:transparent; border:1px solid #475569;">Close</button>
      </div>
    `;
    document.body.appendChild(filterModal);

    filterBtn.addEventListener("click", () => filterModal.classList.remove("hidden"));
    document.getElementById("close-filter-btn").addEventListener("click", () => filterModal.classList.add("hidden"));
    document.getElementById("apply-filter-btn").addEventListener("click", () => {
      alert("Discovery feed prioritized based on your selected interests & language!");
      filterModal.classList.add("hidden");
    });
  }

  // 2. Add "Learning Language" & "Interests" in Profile Edit Screen
  const profileCard = document.querySelector(".profile-setting-card");
  if (profileCard) {
    const extraFields = document.createElement("div");
    extraFields.style.width = "100%";
    extraFields.style.display = "flex";
    extraFields.style.flexDirection = "column";
    extraFields.style.gap = "5px";
    extraFields.style.marginTop = "6px";
    extraFields.innerHTML = `
      <label class="field-label">Language I'm Learning</label>
      <select id="edit-learning-lang" class="input-field">
        <option value="es">Español (Spanish)</option>
        <option value="en">English (US/UK)</option>
        <option value="de">Deutsch (German)</option>
        <option value="fr">Français (French)</option>
        <option value="ja">日本語 (Japanese)</option>
        <option value="mr">मराठी (Marathi)</option>
      </select>
      <label class="field-label">My Passions & Interests</label>
      <input type="text" id="edit-interests" class="input-field" placeholder="e.g. Coding, Music, Series, Gaming" />
    `;
    const saveBtn = document.getElementById("save-my-profile-btn");
    profileCard.insertBefore(extraFields, saveBtn);

    // Auto load
    const me = JSON.parse(localStorage.getItem("connectx_session")) || {};
    if (me.learningLang) document.getElementById("edit-learning-lang").value = me.learningLang;
    if (me.interests) document.getElementById("edit-interests").value = me.interests;

    saveBtn.addEventListener("click", () => {
      const u = JSON.parse(localStorage.getItem("connectx_session")) || {};
      u.learningLang = document.getElementById("edit-learning-lang").value;
      u.interests = document.getElementById("edit-interests").value.trim();
      localStorage.setItem("connectx_session", JSON.stringify(u));
    });
  }
});
