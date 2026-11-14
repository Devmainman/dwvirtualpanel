// Same toasts as the customer app: compact capsules that spring up (bottom-right on desktop).
// Tap or swipe down to dismiss; hovering (desktop) pauses the timer.
import { useEffect, useRef, useState } from 'react';
import { Check, X, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { subscribe, dismiss } from '../../lib/toast';

const STYLE = {
  success: { icon: Check, tint: 'bg-emerald-500 text-white' },
  error: { icon: X, tint: 'bg-red-500 text-white' },
  info: { icon: Info, tint: 'bg-blue-500 text-white' },
  warning: { icon: AlertTriangle, tint: 'bg-amber-400 text-black' },
  loading: { icon: Loader2, tint: 'bg-neutral-700 text-white' }
};

function ToastItem({ t, index, total }) {
  const [paused, setPaused] = useState(false);
  const [dragY, setDragY] = useState(0);
  const start = useRef(null);
  const remaining = useRef(t.duration);
  const startedAt = useRef(Date.now());

  // Auto-dismiss with pause/resume; restarts when the same message is bumped.
  useEffect(() => {
    remaining.current = t.duration;
    startedAt.current = Date.now();
  }, [t.duration, t.bump, t.type]);

  useEffect(() => {
    if (t.leaving || !Number.isFinite(t.duration) || paused) return undefined;
    startedAt.current = Date.now();
    const id = setTimeout(() => dismiss(t.id), remaining.current);
    return () => {
      clearTimeout(id);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [t.id, t.leaving, t.duration, paused, t.bump]);

  const s = STYLE[t.type] || STYLE.info;
  const Icon = s.icon;
  // iOS-style stack: older toasts sit slightly behind and smaller.
  const depth = total - 1 - index;

  const onPointerDown = (e) => { start.current = e.clientY; setPaused(true); };
  const onPointerMove = (e) => { if (start.current !== null) setDragY(Math.max(0, e.clientY - start.current)); };
  const onPointerUp = () => {
    if (dragY > 40) dismiss(t.id);
    start.current = null;
    setDragY(0);
    setPaused(false);
  };

  return (
    <div
      role={t.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={() => { if (!dragY && !t.action) dismiss(t.id); }}
      style={{
        transform: `translateY(${dragY}px) scale(${1 - Math.min(depth, 2) * 0.03})`,
        opacity: dragY ? Math.max(0.3, 1 - dragY / 120) : 1 - Math.min(depth, 2) * 0.12,
        transition: start.current !== null ? 'none' : 'transform 300ms cubic-bezier(0.22,1,0.36,1), opacity 200ms'
      }}
      className={`pointer-events-auto touch-none select-none w-full max-w-[380px] ${t.leaving ? 'animate-[toast-out_200ms_ease-in_forwards]' : 'animate-[toast-in_420ms_cubic-bezier(0.22,1.2,0.36,1)_both]'}`}
    >
      <div key={t.bump} className="flex items-center gap-2.5 rounded-[20px] bg-[#1D1D1F]/92 backdrop-blur-xl border border-white/10 shadow-[0_10px_32px_rgba(0,0,0,0.5)] pl-2.5 pr-3 py-2 animate-[toast-bump_260ms_ease-out]">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s.tint}`}>
          <Icon className={`w-3.5 h-3.5 ${t.type === 'loading' ? 'animate-spin' : ''}`} strokeWidth={3} />
        </span>
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-[13px] font-medium text-zinc-100 leading-snug">{t.title}</p>
          {t.description && <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">{t.description}</p>}
        </div>
        {t.action && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); t.action.onClick?.(); dismiss(t.id); }}
            className="shrink-0 h-7 px-3 rounded-3xl bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-zinc-100"
          >
            {t.action.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => subscribe((list) => setItems([...list])), []);
  const visible = items.slice(-3);

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-0 md:inset-x-auto md:right-6 z-[9600] flex flex-col items-center md:items-end gap-2 px-3 md:px-0 pointer-events-none bottom-[calc(env(safe-area-inset-bottom)+20px)] md:bottom-6"
    >
      {visible.map((t, i) => <ToastItem key={t.id} t={t} index={i} total={visible.length} />)}
    </div>
  );
}
