import { api } from './api.ts';

/** Everything the user can configure. Add fields here and give each a default below. */
export interface Settings {
  greeting: string;
}

export const DEFAULT_SETTINGS: Settings = {
  greeting: 'Hello from My Extension!',
};

/** All settings live under one `storage.sync` key, so they sync across the user's browsers. */
const SETTINGS_KEY = 'settings';

function withDefaults(stored: unknown): Settings {
  return { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings> | undefined) };
}

export async function getSettings(): Promise<Settings> {
  return withDefaults((await api.storage.sync.get(SETTINGS_KEY))[SETTINGS_KEY]);
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  await api.storage.sync.set({ [SETTINGS_KEY]: { ...(await getSettings()), ...patch } });
}

export function onSettingsChanged(listener: (settings: Settings) => void): void {
  api.storage.onChanged.addListener((changes, area) => {
    const change = changes[SETTINGS_KEY];
    if (area === 'sync' && change) listener(withDefaults(change.newValue));
  });
}
