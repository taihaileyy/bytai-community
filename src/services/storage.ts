/**
 * Persistence adapter.
 *
 * The demo keeps everything on the device with AsyncStorage so changes
 * survive an app reload. To move to Supabase, implement the same interface
 * with supabase-js (see docs/BACKEND.md) and swap it in `store/AppStore.tsx`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DemoState } from '@/data/types';

export interface StateAdapter {
  load(): Promise<DemoState | null>;
  save(state: DemoState): Promise<void>;
  clear(): Promise<void>;
}

const KEY = 'bytai-community/demo-state';

export const localAdapter: StateAdapter = {
  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as DemoState) : null;
    } catch {
      return null;
    }
  },
  async save(state) {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private browsing on web). The demo still works in memory.
    }
  },
  async clear() {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
  },
};
