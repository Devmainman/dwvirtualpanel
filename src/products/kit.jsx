// Small UI kit for the product-management screens (real estate, staking,
// stocks, cold storage, cards, wallets, live markets, mining catalog, FX…).
// Matches the panel's palette: page #22282e, cards #282F36, inputs #303943.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { X, Loader2, Inbox, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------------------------ data */

/** Authenticated axios instance for /api. */
export function useApi() {
  const { token } = useAuth();
  return useMemo(() => {
    const t = token || localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    return axios.create({ baseURL: API_BASE_URL, headers: { Authorization: `Bearer ${t}` } });
  }, [token]);
}

export const apiError = (e) => e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong';

/** Load data with loading / error state; `reload()` refetches. */
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const seq = useRef(0);
  const run = useCallback(async () => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await fn();
      if (id === seq.current) setState({ data, loading: false, error: '' });
    } catch (e) {
      if (id === seq.current) setState((s) => ({ ...s, loading: false, error: apiError(e) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}

/** Wrap an async action with a busy flag and toasts. */
export function useAction() {
  const [busy, setBusy] = useState(null);
  const run = async (key, fn, success) => {
    setBusy(key);
    try {
      const r = await fn();
      if (success) toast.success(typeof success === 'function' ? success(r) : success);
      return r;
    } catch (e) {
      toast.error(apiError(e));
      return undefined;
    } finally {
      setBusy(null);
    }
  };
  return { busy, run };
}

/* ------------------------------------------------------------------ format */

export const money = (v, cur = 'USD') => {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${cur || ''}`;
  }
};
export const num = (v, d = 2) => Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: d });
export const date = (v) => (v ? new Date(v).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const shortDate = (v) => (v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
export const who = (u) => (u ? `${[u.firstName, u.lastName].filter(Boolean).join(' ') || 'User'}` : 'Deleted user');

/* ------------------------------------------------------------------ layout */

export function Page({ title, subtitle, icon: Icon, actions, children }) {
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto pk-fade">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[#8C96A8] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ className = '', children, title, actions, pad = true }) {
  return (
    <section className={`bg-[#282F36] border border-[#2F3944] rounded-2xl ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-1">
          {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

const TONE = {
  default: 'text-white',
  up: 'text-emerald-400',
  down: 'text-red-400',
  warn: 'text-amber-400',
  blue: 'text-blue-400'
};

export function Stat({ label, value, hint, tone = 'default', i = 0 }) {
  return (
    <div className="bg-[#282F36] border border-[#2F3944] rounded-2xl p-4 pk-rise" style={{ animationDelay: `${i * 45}ms` }}>
      <p className="text-[11px] uppercase tracking-wide text-[#8C96A8]">{label}</p>
      <p className={`text-xl font-semibold mt-1 tabular-nums ${TONE[tone]}`}>{value}</p>
      {hint && <p className="text-[11px] text-[#6B7280] mt-0.5">{hint}</p>}
    </div>
  );
}

const BADGE = {
  green: 'bg-emerald-500/15 text-emerald-400',
  red: 'bg-red-500/15 text-red-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  gray: 'bg-white/5 text-[#A5AFC4]',
  violet: 'bg-violet-500/15 text-violet-300'
};
const STATUS_TONE = {
  active: 'green', open: 'green', completed: 'blue', matured: 'blue', approved: 'green', enabled: 'green',
  pending: 'amber', unlock_requested: 'amber', frozen: 'blue', paused: 'amber', 'in-progress': 'blue', closing: 'amber',
  rejected: 'red', cancelled: 'gray', closed: 'gray', terminated: 'gray', stopped: 'gray', disabled: 'gray', liquidated: 'red'
};
export function Badge({ children, tone }) {
  const t = tone || STATUS_TONE[String(children).toLowerCase()] || 'gray';
  return <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap ${BADGE[t]}`}>{String(children).replace(/_/g, ' ')}</span>;
}

const BTN = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white',
  secondary: 'bg-[#303943] hover:bg-[#3A4451] text-[#DDE3EC]',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  ghost: 'hover:bg-white/5 text-[#A5AFC4] hover:text-white'
};
export function Button({ variant = 'primary', busy, className = '', children, size = 'md', ...rest }) {
  const sz = size === 'sm' ? 'h-7 px-2.5 text-[11px] rounded-lg' : 'h-9 px-3.5 text-xs rounded-xl';
  return (
    <button
      type="button"
      {...rest}
      disabled={busy || rest.disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${sz} ${BTN[variant]} ${className}`}
    >
      {busy && <Loader2 size={13} className="animate-spin" />}
      {children}
    </button>
  );
}

export const inputCls = 'w-full h-9 bg-[#303943] border border-[#3A4451] text-[#DDE3EC] placeholder-[#6B7280] px-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-medium text-[#8C96A8] mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-[#6B7280] mt-1">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-xs text-[#DDE3EC] disabled:opacity-50"
    >
      <span className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-[#3A4451]'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </span>
      {label}
    </button>
  );
}

export function Tabs({ value, onChange, tabs }) {
  return (
    <div className="inline-flex p-1 bg-[#22282e] border border-[#2F3944] rounded-xl mb-4 overflow-x-auto max-w-full">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`h-7 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition ${value === t.value ? 'bg-[#303943] text-white shadow' : 'text-[#8C96A8] hover:text-white'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
      <input className={`${inputCls} pl-8 w-56`} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-xs text-[#8C96A8]">
      <Loader2 size={15} className="animate-spin" />{label}
    </div>
  );
}

export function Empty({ icon: Icon = Inbox, title = 'Nothing here yet', text }) {
  return (
    <div className="flex flex-col items-center text-center py-12 pk-fade">
      <div className="w-11 h-11 rounded-2xl bg-white/5 text-[#8C96A8] flex items-center justify-center mb-3"><Icon size={18} /></div>
      <p className="text-sm font-medium text-white">{title}</p>
      {text && <p className="text-xs text-[#8C96A8] mt-1 max-w-xs">{text}</p>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl px-3 py-2.5">
      <span>{message}</span>
      {onRetry && <Button size="sm" variant="secondary" onClick={onRetry}><RefreshCw size={12} />Retry</Button>}
    </div>
  );
}

/**
 * Data table.
 * columns: [{ key, label, render?(row), className?, align? }]
 */
export function Table({ columns, rows, rowKey = (r) => r._id || r.id, empty, onRowClick }) {
  if (!rows?.length) return empty || <Empty />;
  return (
    <div className="overflow-x-auto -mx-4">
      <table className="w-full text-xs min-w-[640px]">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-[#6B7280] border-b border-[#2F3944]">
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-2.5 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={rowKey(r)}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`border-b border-[#2F3944]/60 last:border-0 text-[#DDE3EC] pk-row ${onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-2.5 align-middle ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className || ''}`}>
                  {c.render ? c.render(r) : r[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({ page, total, limit, onPage }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (limit || 20)));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 text-[11px] text-[#8C96A8]">
      <span>{total} total</span>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</Button>
        <span className="px-2">{page} / {pages}</span>
        <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pk-fade" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] flex flex-col bg-[#282F36] border border-[#2F3944] rounded-t-3xl sm:rounded-3xl shadow-2xl pk-sheet`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2F3944]">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-[#8C96A8] hover:text-white hover:bg-white/5" aria-label="Close"><X size={15} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto space-y-3">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#2F3944]">{footer}</div>}
      </div>
    </div>
  );
}

/** Ask for confirmation; resolves true/false. Uses the native dialog to stay dependency-free. */
export const confirmAction = (text) => window.confirm(text);
