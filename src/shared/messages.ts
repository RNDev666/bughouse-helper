import { api } from './api.ts';

/** Every message the extension's parts send each other. Add new members to the union. */
export type Message = { type: 'show-toast'; text: string };

type Response = { ok: true } | { ok: false; error: string };

/** Turns a failed handler on the other side into a rejection on this side. */
function unwrap(response: Response | undefined): void {
  if (response && !response.ok) throw new Error(response.error);
}

/** Sends to the background script. Rejects if its handler throws. */
export async function sendToBackground(message: Message): Promise<void> {
  unwrap(await api.runtime.sendMessage<Message, Response>(message));
}

/** Sends to a tab's content script. Rejects if the tab has none (e.g. browser-internal pages). */
export async function sendToTab(tabId: number, message: Message): Promise<void> {
  unwrap(await api.tabs.sendMessage<Message, Response>(tabId, message));
}

/**
 * Registers a handler that may be async. Uses `sendResponse` + `return true` rather than
 * returning a promise, because that is the form both Chrome and Firefox support.
 */
export function onMessage(
  handler: (message: Message, sender: chrome.runtime.MessageSender) => void | Promise<void>,
): void {
  api.runtime.onMessage.addListener((message: Message, sender, sendResponse: (r: Response) => void) => {
    Promise.resolve()
      .then(() => handler(message, sender))
      .then(
        () => sendResponse({ ok: true }),
        (error: unknown) => sendResponse({ ok: false, error: String(error) }),
      );
    return true;
  });
}
