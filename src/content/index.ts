import { onMessage } from '../shared/messages.ts';

const TOAST_MS = 3000;

const STYLE = `
  :host { all: initial; }
  .toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 2147483647;
    max-width: 320px;
    padding: 12px 16px;
    border-radius: 10px;
    background: #16181d;
    color: #fff;
    font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
    animation: in 160ms ease-out;
  }
  .toast:empty { display: none; }
  @keyframes in { from { opacity: 0; transform: translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
`;

let toast: HTMLElement | undefined;
let hideTimer: number | undefined;

/**
 * The toast element, created once and left in the page. It is a live region, and screen readers
 * only announce changes to live regions that already exist, so it is emptied (and hidden by CSS)
 * rather than removed.
 */
function toastElement(): HTMLElement {
  if (toast?.isConnected) return toast;

  // Shadow DOM keeps the page's CSS out of the toast, and ours out of the page.
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = STYLE;
  toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  shadow.append(style, toast);
  document.documentElement.append(host);
  return toast;
}

/** Shows one toast at a time; calling again replaces the text and restarts the timer. */
function showToast(message: string) {
  const element = toastElement();
  clearTimeout(hideTimer);
  // Next frame, so a freshly inserted live region is registered before its text arrives.
  requestAnimationFrame(() => (element.textContent = message));
  hideTimer = window.setTimeout(() => (element.textContent = ''), TOAST_MS);
}

onMessage((message) => {
  if (message.type === 'show-toast') showToast(message.text);
});
