export interface ParentalAlertSignal {
  id: number;
  alertType: string;
  isRead: boolean;
}

const AUDIBLE_ALERT_TYPES = new Set([
  "inappropriate_content",
  "age_content_review",
  "child_safety",
  "content_blocked",
]);

export function hasAudibleParentalAlert(alerts: ParentalAlertSignal[]): boolean {
  return alerts.some((alert) => !alert.isRead && AUDIBLE_ALERT_TYPES.has(alert.alertType));
}

/** Two-tone local signal; it is enabled only after an explicit parent gesture. */
export function playParentalAlertSound(): void {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const start = context.currentTime;
  [880, 660].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start + index * 0.26);
    gain.gain.exponentialRampToValueAtTime(0.16, start + index * 0.26 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.26 + 0.21);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + index * 0.26);
    oscillator.stop(start + index * 0.26 + 0.22);
  });
  window.setTimeout(() => void context.close(), 700);
}
