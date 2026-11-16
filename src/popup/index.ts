import { api } from '../shared/api.ts';
import { sendToBackground } from '../shared/messages.ts';
import { getSettings } from '../shared/settings.ts';

const greeting = document.getElementById('greeting') as HTMLParagraphElement;
const showToast = document.getElementById('show-toast') as HTMLButtonElement;
const error = document.getElementById('error') as HTMLParagraphElement;

showToast.addEventListener('click', async () => {
  error.textContent = '';
  try {
    await sendToBackground({ type: 'show-toast', text: greeting.textContent ?? '' });
  } catch {
    // Browser-internal pages, store pages and tabs opened before install have no content script.
    error.textContent = "Can't run on this page. Try a regular website, or reload the tab.";
  }
});

document.getElementById('open-options')!.addEventListener('click', () => {
  void api.runtime.openOptionsPage();
  window.close();
});

void getSettings().then((settings) => (greeting.textContent = settings.greeting));
