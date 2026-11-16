import { DEFAULT_SETTINGS, getSettings, setSettings } from '../shared/settings.ts';

/** storage.sync caps writes per minute, so save after typing pauses rather than per key. */
const SAVE_DELAY_MS = 400;

const greeting = document.getElementById('greeting') as HTMLInputElement;
const status = document.getElementById('status') as HTMLSpanElement;

let saveTimer: number | undefined;

greeting.placeholder = DEFAULT_SETTINGS.greeting;
greeting.addEventListener('input', () => {
  clearTimeout(saveTimer);
  status.textContent = '';
  saveTimer = window.setTimeout(async () => {
    // An empty field falls back to the default rather than saving a blank greeting.
    await setSettings({ greeting: greeting.value.trim() || DEFAULT_SETTINGS.greeting });
    status.textContent = 'Saved';
  }, SAVE_DELAY_MS);
});

void getSettings().then((settings) => (greeting.value = settings.greeting));
