import { useMessageStore } from '../components/MessageHandler';

type MaybePromise<T> = T | Promise<T>;

export class NotificationService {
  private static enabled = true;

  static async runSilenced<T>(fn: () => MaybePromise<T>): Promise<T> {
    const prev = NotificationService.enabled;
    NotificationService.enabled = false;
    try {
      return await fn();
    } finally {
      NotificationService.enabled = prev;
    }
  }

  static showSuccess(text: string, duration = 3000) {
    if (!NotificationService.enabled) return;
    const { addMessage } = useMessageStore.getState();
    addMessage({ type: 'success', text, duration });
  }

  static showError(text: string, duration = 5000) {
    if (!NotificationService.enabled) return;
    const { addMessage } = useMessageStore.getState();
    addMessage({ type: 'error', text, duration });
  }

  static showInfo(text: string, duration = 3000) {
    if (!NotificationService.enabled) return;
    const { addMessage } = useMessageStore.getState();
    addMessage({ type: 'info', text, duration });
  }
}
