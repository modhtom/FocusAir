export const speakPilot = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Google US English')) || voices[0];
    utterance.rate = 0.9;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

export const playNotificationChime = () => {
  try {
    speakPilot("Session complete. You have arrived at your destination.");
  } catch (err) {
    console.error("Failed to play notification:", err);
  }
};