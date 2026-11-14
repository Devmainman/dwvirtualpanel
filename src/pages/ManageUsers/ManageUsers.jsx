// Manage Users: search, filter, bulk actions and a complete per-user drawer.
import { useEffect, useMemo, useState } from 'react';
import {
  Users, UserCheck, UserX, Wifi, UserPlus, Wallet, Search, X, Mail, Phone, ShieldCheck, MapPin, Fingerprint,
  KeyRound, LogIn, Trash2, Send, Package, Activity, ArrowDownLeft, ArrowUpRight, Lock, Unlock, Ban, CheckCircle2, Bell
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Page, Card, Stat, Button, Field, Toggle, Tabs, Table, Pager, Badge, Modal, inputCls, Loading, ErrorBox, Empty,
  useApi, useLoad, useAction, money, num, date, shortDate, confirmAction
} from '../../products/kit';

const initials = (u) => (u.fullName && u.fullName !== 'Not set' ? u.fullName : u.email || '?').split(/[\s@]/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
const displayName = (u) => (u.fullName && u.fullName !== 'Not set' ? u.fullName : u.email);

function Avatar({ u, size = 'w-9 h-9 text-xs' }) {
  return (
    <div className="relative shrink-0">
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500/40 to-fuchsia-500/40 text-white font-semibold flex items-center justify-center`}>{initials(u)}</div>
      {u.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#282F36]" title="Online now" />}
    </div>
  );
}

function VerifyChips({ v = {} }) {
  const items = [['Email', v.emailVerified, Mail], ['Phone', v.phoneVerified, Phone], ['ID', v.identityVerified, Fingerprint], ['Address', v.addressVerified, MapPin]];
  return (
    <div className="flex gap-1">
      {items.map(([label, ok, Icon]) => (
        <span key={label} title={`${label} ${ok ? 'verified' : 'not verified'}`} className={`w-5 h-5 rounded-md flex items-center justify-center ${ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-[#5B6472]'}`}>
          <Icon size={11} />
        </span>
      ))}
    </div>
  );
}

/* ================================================================== drawer */

function Section({ title, children, hint }) {
  return (
    <section className="bg-[#22282e] border border-[#2F3944] rounded-2xl p-4">
      <p className="text-xs font-semibold text-white">{title}</p>
      {hint && <p className="text-[10px] text-[#6B7280] mt-0.5">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function OverviewTab({ ov, user }) {
  const h = ov?.holdings;
  const cur = h?.currency || user.currency;
  const dep = ov?.deposits || {};
  const wd = ov?.withdrawals || {};
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat i={0} label="Net worth" value={money(h?.total ?? user.walletBalance, cur)} tone="blue" />
        <Stat i={1} label="Cash balance" value={money(user.walletBalance, user.currency)} />
        <Stat i={2} label="Deposits approved" value={money(dep.approved?.total || 0, user.currency)} hint={`${dep.approved?.count || 0} · ${dep.pending?.count || 0} pending`} tone="up" />
        <Stat i={3} label="Withdrawals" value={money((wd.approved?.total || 0) + (wd.completed?.total || 0), user.currency)} hint={`${wd.pending?.count || 0} pending`} />
      </div>
      <Section title="Holdings">
        {!h?.items?.length ? <p className="text-xs text-[#6B7280]">No holdings yet.</p> : (
          <ul className="divide-y divide-[#2F3944]">
            {h.items.map((it) => (
              <li key={`${it.group}-${it.id}`} className="flex items-center justify-between py-2 text-xs">
                <div className="min-w-0"><p className="text-white truncate">{it.name}</p><p className="text-[10px] text-[#6B7280]">{it.detail || it.symbol}</p></div>
                <div className="text-right"><p className="text-white tabular-nums">{money(it.value, cur)}</p>
                  {it.pnl != null && <p className={`text-[10px] ${it.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{it.pnl >= 0 ? '+' : ''}{money(it.pnl, cur)}</p>}</div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title="Recent transactions" hint={`${ov?.transactionCount || 0} in total`}>
        {!ov?.transactions?.length ? <p className="text-xs text-[#6B7280]">No transactions yet.</p> : (
          <ul className="divide-y divide-[#2F3944]">
            {ov.transactions.map((t) => {
              const inflow = ['deposit', 'admin_credit', 'referral_bonus'].includes(t.type) || (t.metadata?.direction === 'out');
              return (
                <li key={t._id} className="flex items-center gap-2 py-2 text-xs">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${inflow ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-[#A5AFC4]'}`}>{inflow ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}</span>
                  <div className="flex-1 min-w-0"><p className="text-white capitalize truncate">{String(t.type).replace(/_/g, ' ')}{t.metadata?.action ? ` · ${String(t.metadata.action).replace(/_/g, ' ')}` : ''}</p><p className="text-[10px] text-[#6B7280]">{date(t.createdAt)}</p></div>
                  <span className="tabular-nums text-white">{money(t.amount, t.currency)}</span>
                  <Badge>{t.status}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

function ProfileTab({ user, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', mobile: user._rawMobile || '', country: user.country === 'Not set' ? '' : user.country || '', gender: user.gender || '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = () => run('save', () => api.put(`/admin/users/${user._id}`, f).then(onSaved), 'Profile saved');
  const verify = (kind) => run(kind, () => api.post(`/admin/users/${user._id}/${kind === 'email' ? 'verify-email' : 'verify-phone-number'}`).then(onSaved), kind === 'email' ? 'Email marked verified' : 'Phone marked verified');
  return (
    <div className="space-y-3">
      <Section title="Personal details">
        <div className="grid grid-cols-2 gap-2">
          <Field label="First name"><input className={inputCls} value={f.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last name"><input className={inputCls} value={f.lastName} onChange={set('lastName')} /></Field>
        </div>
        <Field label="Email"><input type="email" className={inputCls} value={f.email} onChange={set('email')} /></Field>
        <Field label="Phone (international, digits only)" hint="Changing it resets phone verification"><input className={inputCls} value={f.mobile} onChange={set('mobile')} placeholder="15551234567" /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Country"><input className={inputCls} value={f.country} onChange={set('country')} /></Field>
          <Field label="Gender">
            <select className={inputCls} value={f.gender} onChange={set('gender')}><option value="">Not set</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
          </Field>
        </div>
        <div className="flex justify-end"><Button busy={busy === 'save'} onClick={save}>Save profile</Button></div>
      </Section>
      <Section title="Verification">
        <div className="flex items-center justify-between text-xs"><span className="text-[#A5AFC4] flex items-center gap-1.5"><Mail size={13} />Email</span>
          {user.verification?.emailVerified ? <Badge tone="green">Verified</Badge> : <Button size="sm" variant="secondary" busy={busy === 'email'} onClick={() => verify('email')}>Mark verified</Button>}</div>
        <div className="flex items-center justify-between text-xs"><span className="text-[#A5AFC4] flex items-center gap-1.5"><Phone size={13} />Phone</span>
          {user.verification?.phoneVerified ? <Badge tone="green">Verified</Badge> : <Button size="sm" variant="secondary" busy={busy === 'phone'} onClick={() => verify('phone')}>Mark verified</Button>}</div>
        <div className="flex items-center justify-between text-xs"><span className="text-[#A5AFC4] flex items-center gap-1.5"><Fingerprint size={13} />Identity</span><Badge tone={user.verification?.identityVerified ? 'green' : 'gray'}>{user.verification?.identityVerified ? 'Verified' : 'Pending / none'}</Badge></div>
        <div className="flex items-center justify-between text-xs"><span className="text-[#A5AFC4] flex items-center gap-1.5"><MapPin size={13} />Address</span><Badge tone={user.verification?.addressVerified ? 'green' : 'gray'}>{user.verification?.addressVerified ? 'Verified' : 'Pending / none'}</Badge></div>
        <p className="text-[10px] text-[#6B7280]">Review ID, face and address documents under Verification in the sidebar.</p>
      </Section>
    </div>
  );
}

function WalletTab({ user, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [adj, setAdj] = useState({ type: 'credit', amount: '', notes: '' });
  const [cur, setCur] = useState(user.currency);
  const currencies = useLoad(() => api.get('/admin/currencies', { params: { limit: 200 } }).then((r) => (r.data.currencies || []).filter((c) => c.status === 'Enabled')), []);
  const n = Number(adj.amount) || 0;
  const after = adj.type === 'credit' ? user.walletBalance + n : user.walletBalance - n;
  const apply = () => {
    if (!(n > 0)) return toast.error('Enter an amount');
    if (!confirmAction(`${adj.type === 'credit' ? 'Credit' : 'Debit'} ${money(n, user.currency)} ${adj.type === 'credit' ? 'to' : 'from'} ${displayName(user)}?`)) return undefined;
    return run('adj', () => api.patch(`/admin/users/${user._id}/wallet`, { ...adj, amount: n }).then(() => { setAdj({ type: adj.type, amount: '', notes: '' }); onSaved(); }), 'Balance updated');
  };
  const switchCur = () => cur !== user.currency && confirmAction(`Convert ${displayName(user)}'s balance from ${user.currency} to ${cur} at today's rate?`)
    && run('cur', () => api.patch(`/admin/users/${user._id}/currency`, { currency: cur }).then((r) => { onSaved(); return r; }), (r) => r.data.message || 'Currency changed');
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-blue-600/25 to-fuchsia-600/20 border border-[#2F3944] rounded-2xl p-4 pk-rise">
        <p className="text-[11px] text-[#A5AFC4]">Spendable balance</p>
        <p className="text-2xl font-semibold text-white tabular-nums">{money(user.walletBalance, user.currency)}</p>
      </div>
      <Section title="Adjust balance" hint="Logged as an admin credit/debit and the user is notified.">
        <Tabs value={adj.type} onChange={(t) => setAdj((s) => ({ ...s, type: t }))} tabs={[{ value: 'credit', label: 'Credit' }, { value: 'debit', label: 'Debit' }]} />
        <Field label={`Amount (${user.currency})`}><input type="number" min="0" step="any" className={inputCls} value={adj.amount} onChange={(e) => setAdj((s) => ({ ...s, amount: e.target.value }))} /></Field>
        <Field label="Note shown to the user (optional)"><input className={inputCls} maxLength={300} value={adj.notes} onChange={(e) => setAdj((s) => ({ ...s, notes: e.target.value }))} /></Field>
        {n > 0 && <p className={`text-[11px] ${after < 0 ? 'text-red-400' : 'text-[#8C96A8]'}`}>Balance after: {money(after, user.currency)}{after < 0 ? ' — not enough funds' : ''}</p>}
        <div className="flex justify-end"><Button variant={adj.type === 'credit' ? 'success' : 'danger'} busy={busy === 'adj'} disabled={!(n > 0) || after < 0} onClick={apply}>{adj.type === 'credit' ? 'Credit' : 'Debit'} balance</Button></div>
      </Section>
      <Section title="Account currency" hint="The balance is converted at today's market rate.">
        <div className="flex gap-2">
          <select className={inputCls} value={cur} onChange={(e) => setCur(e.target.value)}>
            {(currencies.data || [{ code: user.currency, title: user.currency }]).map((c) => <option key={c.code} value={c.code}>{c.code} · {c.title}</option>)}
          </select>
          <Button variant="secondary" busy={busy === 'cur'} disabled={cur === user.currency} onClick={switchCur}>Convert</Button>
        </div>
      </Section>
    </div>
  );
}

function ControlsTab({ user, onSaved, onDeleted }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [signal, setSignal] = useState(user.signalStrength ?? 0);
  const [pw, setPw] = useState({ newPassword: '', confirmPassword: '' });
  const [reason, setReason] = useState('');
  const [blockOpen, setBlockOpen] = useState(false);
  const [delText, setDelText] = useState('');
  const packages = useLoad(() => api.get('/packages').then((r) => r.data.packages || []), []);
  const [pkg, setPkg] = useState(user.accountType?._id || '');
  const toggle = (path, msg) => run(path, () => api.patch(`/admin/users/${user._id}/${path}`).then(onSaved), msg);
  const loginAs = () => run('as', async () => {
    const r = await api.post(`/admin/users/${user._id}/admin-access`);
    window.open(r.data.redirectUrl, '_blank', 'noopener');
  });
  return (
    <div className="space-y-3">
      <Section title="Access">
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-white">Account</p><p className="text-[10px] text-[#6B7280]">{user.status === 'Active' ? 'User can sign in and transact' : `Blocked: ${user.blockReason || 'no reason'}`}</p></div>
          {user.status === 'Active'
            ? <Button size="sm" variant="danger" onClick={() => setBlockOpen(true)}><Ban size={12} />Block</Button>
            : <Button size="sm" variant="success" busy={busy === 'status'} onClick={() => run('status', () => api.patch(`/admin/users/${user._id}/status`, {}).then(onSaved), 'Account activated')}><CheckCircle2 size={12} />Activate</Button>}
        </div>
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-white">Trading</p><p className="text-[10px] text-[#6B7280]">Live markets and bots</p></div>
          <Toggle checked={!!user.tradingEnabled} disabled={busy === 'trade-status'} onChange={() => toggle('trade-status', user.tradingEnabled ? 'Trading disabled' : 'Trading enabled')} />
        </div>
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-white">Withdrawals</p><p className="text-[10px] text-[#6B7280]">{user.withdrawalLocked ? 'Locked' : 'Allowed'}</p></div>
          <Button size="sm" variant="secondary" busy={busy === 'withdrawal-lock'} onClick={() => toggle('withdrawal-lock', user.withdrawalLocked ? 'Withdrawals unlocked' : 'Withdrawals locked')}>
            {user.withdrawalLocked ? <><Unlock size={12} />Unlock</> : <><Lock size={12} />Lock</>}
          </Button>
        </div>
      </Section>

      <Section title="Signal strength" hint="Gates trading, withdrawals and packages that require a minimum signal.">
        <div className="flex items-center gap-3">
          <input type="range" min="0" max="100" value={signal} onChange={(e) => setSignal(Number(e.target.value))} className="flex-1 accent-blue-500" />
          <span className="w-10 text-right text-xs text-white tabular-nums">{signal}%</span>
        </div>
        <div className="flex justify-end"><Button size="sm" busy={busy === 'signal'} disabled={signal === (user.signalStrength ?? 0)} onClick={() => run('signal', () => api.patch(`/admin/users/${user._id}/signal`, { strength: signal }).then(onSaved), 'Signal updated')}>Save signal</Button></div>
      </Section>

      <Section title="Account package">
        <div className="flex gap-2">
          <select className={inputCls} value={pkg} onChange={(e) => setPkg(e.target.value)}>
            <option value="">Choose a package…</option>
            {(packages.data || []).map((p) => <option key={p._id} value={p._id}>{p.name} · {money(p.amount, p.currency || 'USD')}</option>)}
          </select>
          <Button variant="secondary" busy={busy === 'pkg'} disabled={!pkg || pkg === user.accountType?._id} onClick={() => run('pkg', () => api.patch(`/admin/users/${user._id}/account-package`, { packageId: pkg }).then(onSaved), 'Package updated')}><Package size={12} />Apply</Button>
        </div>
        <p className="text-[10px] text-[#6B7280]">Current: {user.accountTypeName || 'Basic'}</p>
      </Section>

      <Section title="Password & sign-in">
        <div className="grid grid-cols-2 gap-2">
          <Field label="New password"><input type="password" autoComplete="new-password" className={inputCls} value={pw.newPassword} onChange={(e) => setPw((s) => ({ ...s, newPassword: e.target.value }))} /></Field>
          <Field label="Confirm"><input type="password" autoComplete="new-password" className={inputCls} value={pw.confirmPassword} onChange={(e) => setPw((s) => ({ ...s, confirmPassword: e.target.value }))} /></Field>
        </div>
        {pw.newPassword && pw.newPassword.length < 8 && <p className="text-[10px] text-amber-400">At least 8 characters</p>}
        {pw.confirmPassword && pw.confirmPassword !== pw.newPassword && <p className="text-[10px] text-red-400">Passwords don&apos;t match</p>}
        <div className="flex justify-between">
          <Button size="sm" variant="secondary" busy={busy === 'as'} onClick={loginAs}><LogIn size={12} />Open as user</Button>
          <Button size="sm" busy={busy === 'pw'} disabled={pw.newPassword.length < 8 || pw.newPassword !== pw.confirmPassword}
            onClick={() => run('pw', () => api.post(`/admin/users/${user._id}/reset-password`, pw).then(() => setPw({ newPassword: '', confirmPassword: '' })), 'Password reset')}><KeyRound size={12} />Reset password</Button>
        </div>
      </Section>

      <section className="border border-red-500/25 bg-red-500/5 rounded-2xl p-4">
        <p className="text-xs font-semibold text-red-300">Delete account</p>
        <p className="text-[10px] text-[#8C96A8] mt-0.5">Permanently removes the user. This cannot be undone. Type DELETE to confirm.</p>
        <div className="flex gap-2 mt-3">
          <input className={inputCls} value={delText} onChange={(e) => setDelText(e.target.value)} placeholder="DELETE" />
          <Button variant="danger" disabled={delText !== 'DELETE'} busy={busy === 'del'} onClick={() => run('del', () => api.delete(`/admin/users/${user._id}/account`, { data: { confirmation: 'DELETE' } }).then(onDeleted), 'Account deleted')}><Trash2 size={12} />Delete</Button>
        </div>
      </section>

      <Modal open={blockOpen} title={`Block ${displayName(user)}`} onClose={() => setBlockOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setBlockOpen(false)}>Cancel</Button><Button variant="danger" busy={busy === 'status'} onClick={() => run('status', () => api.patch(`/admin/users/${user._id}/status`, { reason }).then(() => { setBlockOpen(false); onSaved(); }), 'Account blocked')}>Block account</Button></>}>
        <Field label="Reason shown to the user"><textarea className={`${inputCls} h-auto py-2 min-h-[80px]`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Your account is under review." /></Field>
      </Modal>
    </div>
  );
}

function MessagesTab({ user }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [m, setM] = useState({ subject: '', message: '', sendEmail: false });
  const lists = useLoad(() => Promise.all([
    api.get('/admin/popup-invoices').then((r) => r.data.invoices || []).catch(() => []),
    api.get('/admin/popup-forms').then((r) => r.data.forms || []).catch(() => []),
    api.get('/admin/popup-messages').then((r) => r.data.messages || []).catch(() => [])
  ]).then(([invoices, forms, messages]) => ({ invoices, forms, messages })), []);
  const [assign, setAssign] = useState({ kind: 'popup-invoices', id: '' });
  const options = assign.kind === 'popup-invoices' ? lists.data?.invoices : assign.kind === 'popup-forms' ? lists.data?.forms : lists.data?.messages;
  return (
    <div className="space-y-3">
      <Section title="Send a message" hint="Appears in the user's inbox and notifications.">
        <Field label="Subject"><input className={inputCls} maxLength={140} value={m.subject} onChange={(e) => setM((s) => ({ ...s, subject: e.target.value }))} /></Field>
        <Field label="Message"><textarea className={`${inputCls} h-auto py-2 min-h-[96px]`} value={m.message} onChange={(e) => setM((s) => ({ ...s, message: e.target.value }))} /></Field>
        <div className="flex items-center justify-between">
          <Toggle checked={m.sendEmail} onChange={(v) => setM((s) => ({ ...s, sendEmail: v }))} label="Also email it" />
          <Button busy={busy === 'msg'} disabled={!m.subject || !m.message} onClick={() => run('msg', () => api.post(`/admin/users/${user._id}/send-message`, m).then(() => setM({ subject: '', message: '', sendEmail: false })), 'Message sent')}><Send size={12} />Send</Button>
        </div>
      </Section>
      <Section title="Assign a popup" hint="Shown to the user the next time they open the app.">
        <div className="grid grid-cols-[130px_1fr] gap-2">
          <select className={inputCls} value={assign.kind} onChange={(e) => setAssign({ kind: e.target.value, id: '' })}>
            <option value="popup-invoices">Invoice</option><option value="popup-forms">Form</option><option value="popup-messages">Message</option>
          </select>
          <select className={inputCls} value={assign.id} onChange={(e) => setAssign((s) => ({ ...s, id: e.target.value }))}>
            <option value="">{options?.length ? 'Choose…' : 'None created yet'}</option>
            {(options || []).map((o) => <option key={o._id} value={o._id}>{o.title || o.name || o.subject || o._id}</option>)}
          </select>
        </div>
        <div className="flex justify-end"><Button size="sm" variant="secondary" busy={busy === 'assign'} disabled={!assign.id} onClick={() => run('assign', () => api.post(`/admin/assign/${user._id}/${assign.kind}/${assign.id}`), 'Popup assigned')}>Assign</Button></div>
      </Section>
    </div>
  );
}

function UserDrawer({ userId, onClose, onChanged }) {
  const api = useApi();
  const [tab, setTab] = useState('overview');
  const [leaving, setLeaving] = useState(false);
  const ov = useLoad(() => api.get(`/admin/users/${userId}/overview`).then((r) => r.data.data), [userId]);
  const u = useLoad(() => api.get(`/admin/users/${userId}`).then((r) => r.data.user), [userId]);
  const close = () => { setLeaving(true); setTimeout(onClose, 220); };
  const refresh = () => { u.reload(); ov.reload(); onChanged(); };
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const user = u.data;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] ${leaving ? 'mu-fade-out' : 'pk-fade'}`} onClick={close} />
      <aside className={`relative w-full max-w-[560px] h-full bg-[#282F36] border-l border-[#2F3944] shadow-2xl flex flex-col ${leaving ? 'mu-drawer-out' : 'mu-drawer-in'}`}>
        {!user ? (u.error ? <div className="p-5"><ErrorBox message={u.error} onRetry={u.reload} /></div> : <Loading />) : (
          <>
            <header className="px-5 pt-5 pb-3 border-b border-[#2F3944]">
              <div className="flex items-start gap-3">
                <Avatar u={user} size="w-12 h-12 text-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">{displayName(user)}</p>
                  <p className="text-[11px] text-[#8C96A8] truncate">{user.email} · {user.accountId}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge>{user.status === 'Active' ? 'active' : 'blocked'}</Badge>
                    <Badge tone="violet">{user.accountTypeName || 'Basic'}</Badge>
                    {user.isOnline && <Badge tone="green">Online</Badge>}
                    {user.withdrawalLocked && <Badge tone="red">Withdrawals locked</Badge>}
                    {!user.tradingEnabled && <Badge tone="amber">Trading off</Badge>}
                  </div>
                </div>
                <button type="button" onClick={close} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C96A8] hover:text-white hover:bg-white/5" aria-label="Close"><X size={16} /></button>
              </div>
              <div className="flex gap-4 mt-3 text-[11px] text-[#8C96A8]">
                <span>Joined {shortDate(user.joinedDate)}</span>
                <span>Last sign-in {user.lastLogin ? date(user.lastLogin) : 'never'}</span>
                <span>{user.country !== 'Not set' ? user.country : ''}</span>
              </div>
            </header>
            <div className="px-5 pt-3">
              <Tabs value={tab} onChange={setTab} tabs={[{ value: 'overview', label: 'Overview' }, { value: 'profile', label: 'Profile' }, { value: 'wallet', label: 'Wallet' }, { value: 'controls', label: 'Controls' }, { value: 'messages', label: 'Messages' }]} />
            </div>
            <div key={tab} className="flex-1 overflow-y-auto px-5 pb-6 pk-fade">
              {tab === 'overview' && (ov.loading && !ov.data ? <Loading /> : ov.error ? <ErrorBox message={ov.error} onRetry={ov.reload} /> : <OverviewTab ov={ov.data} user={user} />)}
              {tab === 'profile' && <ProfileTab key={user._id + (user.email || '')} user={user} onSaved={refresh} />}
              {tab === 'wallet' && <WalletTab user={user} onSaved={refresh} />}
              {tab === 'controls' && <ControlsTab user={user} onSaved={refresh} onDeleted={() => { onChanged(); close(); }} />}
              {tab === 'messages' && <MessagesTab user={user} />}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ================================================================== page */

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function ManageUsers() {
  const api = useApi();
  const [q, setQ] = useState('');
  const search = useDebounced(q.trim());
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [selected, setSelected] = useState(new Set());
  const [openId, setOpenId] = useState(null);
  const [bulk, setBulk] = useState(null); // 'block' | 'delete' | 'notify'
  const [bulkInput, setBulkInput] = useState({ reason: '', confirm: '', title: '', content: '' });
  const { busy, run } = useAction();

  useEffect(() => { setPage(1); }, [search, status, limit]);
  const stats = useLoad(() => api.get('/admin/users/stats').then((r) => r.data.data), []);
  const list = useLoad(() => api.get('/admin/users', { params: { page, limit, search: search || undefined, status: status || undefined } }).then((r) => r.data), [page, limit, search, status]);
  const users = list.data?.users || [];
  const reloadAll = () => { list.reload(); stats.reload(); };
  useEffect(() => { setSelected(new Set()); }, [page, search, status]);

  const allOnPage = users.length > 0 && users.every((u) => selected.has(u._id));
  const toggleAll = () => setSelected((s) => { const n = new Set(s); if (allOnPage) users.forEach((u) => n.delete(u._id)); else users.forEach((u) => n.add(u._id)); return n; });
  const toggleOne = (id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const ids = useMemo(() => [...selected], [selected]);

  const doBulk = () => {
    if (bulk === 'block') return run('bulk', () => api.post('/admin/users/bulk-status', { ids, status: 'Inactive', reason: bulkInput.reason }).then((r) => { setBulk(null); setSelected(new Set()); reloadAll(); return r; }), (r) => r.data.message);
    if (bulk === 'delete') return run('bulk', () => api.post('/admin/users/bulk-delete', { ids, confirmation: bulkInput.confirm }).then((r) => { setBulk(null); setSelected(new Set()); reloadAll(); return r; }), (r) => r.data.message);
    if (bulk === 'notify') return run('bulk', () => api.post('/admin/users/bulk-notify', { ids, title: bulkInput.title, content: bulkInput.content }).then((r) => { setBulk(null); return r; }), (r) => r.data.message);
    return undefined;
  };
  const openBulk = (kind) => {
    setBulkInput({ reason: '', confirm: '', title: '', content: '' });
    if (kind === 'activate') run('bulk', () => api.post('/admin/users/bulk-status', { ids, status: 'Active' }).then((r) => { setSelected(new Set()); reloadAll(); return r; }), (r) => r.data.message);
    else setBulk(kind);
  };

  const s = stats.data;
  return (
    <Page title="Manage users" subtitle="Find anyone, see everything they hold, and act on their account." icon={Users}
      actions={<Button variant="secondary" onClick={reloadAll}>Refresh</Button>}>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <Stat i={0} label="Users" value={s ? num(s.total, 0) : '—'} />
        <Stat i={1} label="Active" value={s ? num(s.active, 0) : '—'} tone="up" />
        <Stat i={2} label="Blocked" value={s ? num(s.inactive, 0) : '—'} tone={s?.inactive ? 'down' : 'default'} />
        <Stat i={3} label="Online now" value={s ? num(s.online, 0) : '—'} tone="blue" />
        <Stat i={4} label="New this week" value={s ? num(s.newThisWeek, 0) : '—'} />
        <Stat i={5} label="Total balances" value={s ? money(s.totalBalance, s.currency) : '—'} />
      </div>

      <Card pad>
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input className={`${inputCls} pl-8`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, account ID or phone" />
            {q && <button type="button" onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white" aria-label="Clear"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <div className="inline-flex p-1 bg-[#22282e] border border-[#2F3944] rounded-xl">
              {[['', 'All'], ['Active', 'Active'], ['Inactive', 'Blocked']].map(([v, l]) => (
                <button key={l} type="button" onClick={() => setStatus(v)} className={`h-7 px-3 rounded-lg text-xs font-medium transition ${status === v ? 'bg-[#303943] text-white' : 'text-[#8C96A8] hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <select className={`${inputCls} w-auto`} value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {[15, 30, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/25 pk-rise">
            <span className="text-xs text-blue-200 mr-auto">{selected.size} selected</span>
            <Button size="sm" variant="success" busy={busy === 'bulk' && !bulk} onClick={() => openBulk('activate')}><UserCheck size={12} />Activate</Button>
            <Button size="sm" variant="secondary" onClick={() => openBulk('block')}><UserX size={12} />Block</Button>
            <Button size="sm" variant="secondary" onClick={() => openBulk('notify')}><Bell size={12} />Notify</Button>
            <Button size="sm" variant="danger" onClick={() => openBulk('delete')}><Trash2 size={12} />Delete</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}

        {list.error && <ErrorBox message={list.error} onRetry={list.reload} />}
        {list.loading && !list.data ? <Loading /> : (
          <>
            <Table
              rows={users}
              onRowClick={(u) => setOpenId(u._id)}
              empty={<Empty icon={Users} title={search || status ? 'No users match' : 'No users yet'} text={search ? 'Try a different name, email or account ID.' : undefined} />}
              columns={[
                { key: 'sel', label: <input type="checkbox" aria-label="Select all" checked={allOnPage} onChange={toggleAll} onClick={(e) => e.stopPropagation()} className="accent-blue-500" />, render: (u) => <input type="checkbox" aria-label={`Select ${u.email}`} checked={selected.has(u._id)} onChange={() => toggleOne(u._id)} onClick={(e) => e.stopPropagation()} className="accent-blue-500" /> },
                { key: 'user', label: 'User', render: (u) => <div className="flex items-center gap-2.5 min-w-0"><Avatar u={u} /><div className="min-w-0"><p className="text-white font-medium truncate max-w-[220px]">{displayName(u)}</p><p className="text-[10px] text-[#6B7280] truncate max-w-[220px]">{u.email}</p></div></div> },
                { key: 'id', label: 'Account', render: (u) => <span className="font-mono text-[11px] text-[#A5AFC4]">{u.accountId || '—'}</span> },
                { key: 'balance', label: 'Balance', align: 'right', render: (u) => money(u.walletBalance, u.currency) },
                { key: 'pkg', label: 'Package', render: (u) => <Badge tone="violet">{u.accountTypeName || 'Basic'}</Badge> },
                { key: 'verify', label: 'Verified', render: (u) => <VerifyChips v={u.verification} /> },
                { key: 'flags', label: 'Status', render: (u) => <div className="flex gap-1"><Badge>{u.status === 'Active' ? 'active' : 'blocked'}</Badge>{u.withdrawalLocked && <Badge tone="red">WD lock</Badge>}</div> },
                { key: 'joined', label: 'Joined', render: (u) => <span className="text-[#8C96A8]">{shortDate(u.joinedDate)}</span> },
                { key: 'go', label: '', render: () => <Activity size={13} className="text-[#5B6472]" /> }
              ]}
            />
            <Pager page={page} total={list.data?.total} limit={limit} onPage={setPage} />
          </>
        )}
      </Card>

      {openId && <UserDrawer userId={openId} onClose={() => setOpenId(null)} onChanged={reloadAll} />}

      <Modal open={bulk === 'block'} title={`Block ${ids.length} user${ids.length === 1 ? '' : 's'}`} onClose={() => setBulk(null)}
        footer={<><Button variant="secondary" onClick={() => setBulk(null)}>Cancel</Button><Button variant="danger" busy={busy === 'bulk'} onClick={doBulk}>Block</Button></>}>
        <Field label="Reason shown to them"><textarea className={`${inputCls} h-auto py-2 min-h-[80px]`} value={bulkInput.reason} onChange={(e) => setBulkInput((b) => ({ ...b, reason: e.target.value }))} /></Field>
      </Modal>
      <Modal open={bulk === 'notify'} title={`Notify ${ids.length} user${ids.length === 1 ? '' : 's'}`} onClose={() => setBulk(null)}
        footer={<><Button variant="secondary" onClick={() => setBulk(null)}>Cancel</Button><Button busy={busy === 'bulk'} disabled={!bulkInput.title} onClick={doBulk}><Send size={12} />Send</Button></>}>
        <Field label="Title"><input className={inputCls} value={bulkInput.title} onChange={(e) => setBulkInput((b) => ({ ...b, title: e.target.value }))} /></Field>
        <Field label="Message"><textarea className={`${inputCls} h-auto py-2 min-h-[80px]`} value={bulkInput.content} onChange={(e) => setBulkInput((b) => ({ ...b, content: e.target.value }))} /></Field>
      </Modal>
      <Modal open={bulk === 'delete'} title={`Delete ${ids.length} user${ids.length === 1 ? '' : 's'}`} onClose={() => setBulk(null)}
        footer={<><Button variant="secondary" onClick={() => setBulk(null)}>Cancel</Button><Button variant="danger" busy={busy === 'bulk'} disabled={bulkInput.confirm !== 'DELETE'} onClick={doBulk}><Trash2 size={12} />Delete permanently</Button></>}>
        <p className="text-xs text-[#A5AFC4]">This permanently removes the selected accounts and cannot be undone.</p>
        <Field label="Type DELETE to confirm"><input className={inputCls} value={bulkInput.confirm} onChange={(e) => setBulkInput((b) => ({ ...b, confirm: e.target.value }))} /></Field>
      </Modal>
    </Page>
  );
}
