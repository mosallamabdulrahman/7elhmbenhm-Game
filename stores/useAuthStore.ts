import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface AuthState {
  user: any | null;
  authLoading: boolean;
  initialized: boolean;
  setUser: (user: any | null) => void;
  setAuthLoading: (loading: boolean) => void;
  initAuth: () => () => void;
  signOut: () => Promise<void>;
}

let authSubscription: { unsubscribe: () => void } | null = null;
let listenerRefCount = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  authLoading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  initAuth: () => {
    listenerRefCount += 1;

    if (!authSubscription) {
      const restoreSession = async () => {
        const recentlyLoggedIn =
          typeof window !== "undefined" &&
          Boolean(window.sessionStorage.getItem("sovereignty_login_verified"));
        const maxAttempts = recentlyLoggedIn ? 5 : 2;
        let restoredUser = null;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            restoredUser = session.user;
            break;
          }
          if (attempt < maxAttempts - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 200));
          }
        }

        set({
          user: restoredUser,
          authLoading: false,
          initialized: true,
        });

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("sovereignty_login_verified");
        }
      };

      restoreSession();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          set({ user: session.user, authLoading: false, initialized: true });
        } else if (event === "SIGNED_OUT" || !session) {
          set({ user: null, authLoading: false, initialized: true });
        }
      });

      authSubscription = subscription;
    }

    return () => {
      listenerRefCount = Math.max(0, listenerRefCount - 1);
      if (listenerRefCount === 0 && authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }
    };
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      set({ user: null, authLoading: false });
      if (typeof window !== "undefined") {
        localStorage.removeItem("sovereignty_was_here");
        window.location.reload();
      }
    }
  },
}));
