// Tiny toast store. Same call style as before:
//   toast.success('Saved') · toast.error('Failed', { description: 'Try again' }) · toast.promise(p, {...})
// <Toaster /> (components/toast/Toaster.jsx) renders whatever is in the store.

const listeners = new Set();
let toasts = [];
let seq = 0;

const DURATION = { success: 3200, info: 3600, warning: 4500, error: 5000, loading: Infinity };
const MAX_VISIBLE = 3;

const emit = () => listeners.forEach((fn) => fn(toasts));

export const subscribe = (fn) => {
  listeners.add(fn);
  fn(toasts);
  return () => listeners.delete(fn);
};

const toText = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (v instanceof Error) return v.message;
  return String(v);
};

function show(type, message, opts = {}) {
  const id = opts.id ?? `t${++seq}`;
  const existing = toasts.find((t) => t.id === id);
  const item = {
    id,
    type,
    title: toText(message),
    description: toText(opts.description),
    duration: opts.duration ?? DURATION[type] ?? 3500,
    action: opts.action, // { label, onClick }
    createdAt: Date.now(),
    leaving: false
  };
  if (existing) {
    toasts = toasts.map((t) => (t.id === id ? { ...item, createdAt: t.createdAt } : t));
  } else {
    // Identical message already on screen? Refresh it instead of stacking duplicates.
    const dup = toasts.find((t) => !t.leaving && t.type === type && t.title === item.title);
    if (dup) {
      toasts = toasts.map((t) => (t === dup ? { ...t, createdAt: Date.now(), bump: (t.bump || 0) + 1 } : t));
      emit();
      return dup.id;
    }
    toasts = [...toasts, item].slice(-MAX_VISIBLE - 2);
  }
  emit();
  return id;
}

export function dismiss(id) {
  toasts = toasts.map((t) => (id === undefined || t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => !t.leaving);
    emit();
  }, 220);
}

export const toast = Object.assign((message, opts) => show('info', message, opts), {
  success: (m, o) => show('success', m, o),
  error: (m, o) => show('error', m, o),
  info: (m, o) => show('info', m, o),
  warning: (m, o) => show('warning', m, o),
  warn: (m, o) => show('warning', m, o),
  loading: (m, o) => show('loading', m, o),
  dismiss,
  /** Shows a loading toast that turns into success / error when the promise settles. */
  promise(p, { loading = 'Working…', success = 'Done', error = 'Something went wrong' } = {}) {
    const id = show('loading', loading);
    Promise.resolve(p).then(
      (v) => show('success', typeof success === 'function' ? success(v) : success, { id }),
      (e) => show('error', typeof error === 'function' ? error(e) : error, { id })
    );
    return p;
  }
});

export default toast;
