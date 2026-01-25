const EVENT_NAME = 'global-loading';

export function loadingStart() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { delta: +1 } }));
}

export function loadingEnd() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { delta: -1 } }));
}

export function subscribeLoading(cb: (delta: number) => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const ce = e as CustomEvent<{ delta: number }>;
    cb(ce.detail.delta);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
