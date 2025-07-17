import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';

export class SupabaseClientWrapper {
  private client: SupabaseClient;
  private authListeners: Array<(event: AuthChangeEvent, session: Session | null) => void> = [];
  private subscriptions: Array<{ unsubscribe: () => Promise<any> | void }> = [];
  private storageKey: string;

  constructor(url: string, key: string) {
    this.storageKey = 'sb-' + (url?.split('.')[0].split('//')[1] ?? '') + '-auth-token';
    this.client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: true,
      },
      global: {
        headers: { 'x-application-name': 'church-admin' },
      },
      db: { schema: 'public' },
      realtime: { params: { eventsPerSecond: 2 } },
      fetch: (fetchUrl, options) => {
        return fetch(fetchUrl, { ...options, signal: AbortSignal.timeout(30000) });
      },
    });

    const saved = window.localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const session: Session = JSON.parse(saved);
        // restore the session for subsequent requests
        this.client.auth.setSession(session);
      } catch {
        // ignore invalid session
      }
    }

    this.client.auth.onAuthStateChange((event, session) => {
      this.persistSession(session);
      this.authListeners.forEach((l) => l(event, session));
    });
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  onAuthStateChange(
    fn: (event: AuthChangeEvent, session: Session | null) => void
  ): () => void {
    this.authListeners.push(fn);
    return () => {
      this.authListeners = this.authListeners.filter((l) => l !== fn);
    };
  }

  clearAuthListeners() {
    this.authListeners = [];
  }

  addSubscription(sub: { unsubscribe: () => Promise<any> | void }) {
    this.subscriptions.push(sub);
  }

  clearSubscriptions() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }

  private persistSession(session: Session | null) {
    if (session) {
      window.localStorage.setItem(this.storageKey, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(this.storageKey);
    }
  }
}

