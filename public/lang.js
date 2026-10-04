const alertsMap = {
  en: {
    lock_msg: "🛡️ Privacy Protection:\nPlease send a Connect Request ⚡ first. Chat and Calls will be unlocked after they accept!",
    connected_msg: "⚡ Connected! {name} accepted your request. Chat, Call & Video are now unlocked!",
    already_friends: "You and {name} are already connected friends! 🎉",
    profile_saved: "Profile updated successfully!",
    loc_detected: "Location detected!"
  },
  mr: {
    lock_msg: "🛡️ प्रायव्हसी सुरक्षा:\nकृपया आधी Connect Request ⚡ पाठवा. त्यांनी स्वीकारल्यानंतरच Chat आणि Calls सुरू होतील!",
    connected_msg: "⚡ कनेक्ट झाले! {name} ने तुमची विनंती स्वीकारली. Chat, Call आणि Video अनलॉक झाले आहेत!",
    already_friends: "तुम्ही आणि {name} आधीच मित्र आहात! 🎉",
    profile_saved: "प्रोफाइल सेव्ह झाली!",
    loc_detected: "लोकेशन मिळाले!"
  },
  hi: {
    lock_msg: "🛡️ प्राइवेसी सुरक्षा:\nकृपया पहले Connect Request ⚡ भेजें। स्वीकार करने के बाद ही Chat और Calls अनलॉक होंगे!",
    connected_msg: "⚡ कनेक्ट हो गए! {name} ने आपकी रिक्वेस्ट स्वीकार की।",
    already_friends: "आप और {name} पहले से दोस्त हैं! 🎉",
    profile_saved: "प्रोफाइल अपडेट हो गई!",
    loc_detected: "लोकेशन मिल गई!"
  },
  es: {
    lock_msg: "🛡️ Protección de privacidad:\n¡Envía Connect Request ⚡ primero!",
    connected_msg: "⚡ ¡Conectado con {name}!",
    already_friends: "¡Ya son amigos! 🎉",
    profile_saved: "¡Perfil guardado!",
    loc_detected: "¡Ubicación detectada!"
  }
};

function getMsg(key, name = "") {
  const me = JSON.parse(localStorage.getItem('connectx_session')) || {};
  const lang = me.language || 'en';
  const dict = alertsMap[lang] || alertsMap.en;
  let text = dict[key] || alertsMap.en[key] || "";
  return text.replace('{name}', name);
}
