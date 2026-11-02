/**
 * Web Push Notifications & Audio Alert Service for EduControl
 * Supports Native Web Notification API + Web Audio Synthesizer
 */

export class NotificationService {
  /**
   * Request native browser permission for Push Notifications
   */
  public static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones de escritorio.');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error('Error al solicitar permiso de notificaciones:', e);
      return 'denied';
    }
  }

  /**
   * Check current status
   */
  public static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  /**
   * Plays a pleasant synthesized notification sound via Web Audio API
   */
  public static playChime(type: 'critical' | 'info' | 'success' = 'info'): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'critical') {
        // High urgency two-tone alert
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(660, ctx.currentTime);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } else {
        // Sweet pleasant chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'success' ? 523.25 : 659.25, ctx.currentTime); // C5 or E5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.2); // C6

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio autoplay policy or unavailable context
    }
  }

  /**
   * Sends a native Web Push notification to user's OS / Phone
   */
  public static sendNativePush(title: string, body: string, isCritical: boolean = false): void {
    this.playChime(isCritical ? 'critical' : 'info');

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: isCritical ? 'educontrol-critical' : 'educontrol-general',
          requireInteraction: isCritical,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
  }
}
