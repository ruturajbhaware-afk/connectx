// Complete Chat Features: Typing Indicator, Seen Status, Reactions
document.addEventListener("DOMContentLoaded", () => {
  const msgInput = document.getElementById("chat-msg-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const area = document.getElementById("chat-messages-area");

  if (!msgInput || !area) return;

  // Typing container tayar karne
  const typingBubble = document.createElement("div");
  typingBubble.id = "typing-status-indicator";
  typingBubble.className = "msg-bubble msg-received hidden";
  typingBubble.style.fontSize = "0.75rem";
  typingBubble.style.color = "#a0aec0";
  typingBubble.style.fontStyle = "italic";
  typingBubble.innerText = "Sara is typing...";
  area.parentNode.insertBefore(typingBubble, area.nextSibling);

  // Send button var click nantar typing animation trigger
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      showTypingAndSeen();
    });
  }

  msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      showTypingAndSeen();
    }
  });

  function showTypingAndSeen() {
    // 1. Seen status dakhavne
    setTimeout(() => {
      const sentMsgs = area.querySelectorAll(".msg-sent");
      if (sentMsgs.length > 0) {
        const lastSent = sentMsgs[sentMsgs.length - 1];
        let seenTag = lastSent.querySelector(".seen-indicator");
        if (!seenTag) {
          seenTag = document.createElement("span");
          seenTag.className = "seen-indicator";
          seenTag.style.display = "block";
          seenTag.style.fontSize = "0.62rem";
          seenTag.style.textAlign = "right";
          seenTag.style.marginTop = "2px";
          seenTag.style.opacity = "0.8";
          seenTag.innerText = "✓✓ Seen";
          lastSent.appendChild(seenTag);
        }
      }
    }, 600);

    // 2. Typing indicator dakhavne (replies aadhich)
    setTimeout(() => {
      typingBubble.classList.remove("hidden");
      area.scrollTop = area.scrollHeight;
    }, 400);

    // Reply aalyavar typing indicator band karne
    setTimeout(() => {
      typingBubble.classList.add("hidden");
    }, 1000);
  }

  // Double tap to react with Heart ❤️
  area.addEventListener("dblclick", (e) => {
    const bubble = e.target.closest(".msg-bubble");
    if (!bubble) return;
    let heart = bubble.querySelector(".heart-react");
    if (heart) {
      heart.remove();
    } else {
      heart = document.createElement("span");
      heart.className = "heart-react";
      heart.innerText = " ❤️";
      heart.style.fontSize = "0.85rem";
      bubble.appendChild(heart);
    }
  });
});
