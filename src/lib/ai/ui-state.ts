import { useSyncExternalStore } from "react";
import { SAMPLE_PROFILES } from "./knowledge";

// Small shared UI state for Sprint 2: which synthetic profile the matching and chat use,
// and whether the chat panel is open. Kept outside the IPP data store on purpose.
const PROFILE_KEY = "ipp-ai-profile";

interface State {
  profileId: string;
  chatOpen: boolean;
  pendingQuestion: string | null;
}

let state: State = {
  profileId: SAMPLE_PROFILES[0]!.student_id,
  chatOpen: false,
  pendingQuestion: null,
};
let loaded = false;
const listeners = new Set<() => void>();

function get(): State {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const saved = window.localStorage.getItem(PROFILE_KEY);
      if (saved && SAMPLE_PROFILES.some((p) => p.student_id === saved))
        state = { ...state, profileId: saved };
    } catch {
      // Storage can be blocked; the default profile still works.
    }
  }
  return state;
}

function set(patch: Partial<State>) {
  state = { ...get(), ...patch };
  if (patch.profileId) {
    try {
      window.localStorage.setItem(PROFILE_KEY, patch.profileId);
    } catch {
      // Ignore blocked storage.
    }
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const SERVER_STATE: State = {
  profileId: SAMPLE_PROFILES[0]!.student_id,
  chatOpen: false,
  pendingQuestion: null,
};

export function useAiState(): State {
  return useSyncExternalStore(subscribe, get, () => SERVER_STATE);
}

export const setProfileId = (profileId: string) => set({ profileId });
export const setChatOpen = (chatOpen: boolean) => set({ chatOpen });
/** Opens the chat panel and asks a question straight away. */
export const askInChat = (question: string) => set({ chatOpen: true, pendingQuestion: question });
export const clearPendingQuestion = () => set({ pendingQuestion: null });
