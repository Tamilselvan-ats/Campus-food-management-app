import confetti from 'canvas-confetti';

// Play pleasant web audio chime without needing external mp3 files
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: 880 Hz (A5) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch {
    // AudioContext might be muted or not allowed prior to user interaction
  }
}

// Request native browser notification permission
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

// Display push notification (Browser native + In-app custom event)
export function triggerPushNotification(title: string, body: string, icon = '🍱') {
  playNotificationSound();

  // If native notifications are supported and granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=128&auto=format&fit=crop&q=80',
        badge: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=64&auto=format&fit=crop&q=80',
      });
    } catch {
      // Notification constructor might be restricted in some iframe sandboxes
    }
  }

  // Dispatch custom in-app banner toast event
  window.dispatchEvent(
    new CustomEvent('app-push-notification', {
      detail: { title, body, icon, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    })
  );
}

// Trigger celebration confetti
export function fireEcoConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#3b82f6'],
    });
  } catch {
    // fallback if canvas not available
  }
}
