import { api } from '../shared/api.ts';
import { onMessage, sendToTab } from '../shared/messages.ts';

// Demo: the popup asks for a toast; forward it to the content script in the active tab.
onMessage(async (message) => {
  if (message.type !== 'show-toast') return;

  const [tab] = await api.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.id === undefined) throw new Error('No active tab');
  await sendToTab(tab.id, message);
});
