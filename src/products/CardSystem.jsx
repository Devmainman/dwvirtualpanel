// Card Settings (create / edit / disable the cards users can buy) and
// Card Invoices (every user card request with its purchase and activation payments).
import { useState } from 'react';
import { CreditCard, Plus, Pencil, Check, X, Eye, EyeOff, Receipt, ImagePlus, Ban, RotateCcw, Copy as CopyIcon, KeyRound, Wand2, Snowflake } from 'lucide-react';
import {
  useApi, useLoad, useAction, money, date, shortDate, who, Page, Card, Badge, Button, Field, inputCls,
  Tabs, SearchBox, Loading, Empty, ErrorBox, Table, Pager, Modal
} from './kit';
import { STATIC_BASE_URL } from '../api/config';

const fileUrl = (p) => (p ? (/^https?:/.test(p) ? p : `${STATIC_BASE_URL}${p}`) : '');
const PRESET_BG = {
  midnight: 'from-slate-700 to-slate-950',
  aurora: 'from-teal-500 to-indigo-700',
  gold: 'from-amber-300 to-amber-700',
  rose: 'from-rose-400 to-fuchsia-700',
  silver: 'from-zinc-200 to-zinc-500',
  emerald: 'from-emerald-400 to-emerald-800'
};
const NETWORK_LABEL = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover', unionpay: 'UnionPay', verve: 'Verve', jcb: 'JCB', other: 'Other' };

/** The card picture: uploaded design, or a built-in look with the network name. */
export function CardArt({ product, className = 'h-32' }) {
  const p = product || {};
  if (p.design) {
    return <img src={fileUrl(p.design)} alt={p.name || 'Card design'} className={`w-full object-cover rounded-xl shadow-lg ${className}`} />;
  }
  const dark = p.designPreset !== 'silver' && p.designPreset !== 'gold';
  return (
    <div className={`relative w-full rounded-xl bg-gradient-to-br ${PRESET_BG[p.designPreset] || PRESET_BG.midnight} p-4 overflow-hidden shadow-lg ${dark ? 'text-white' : 'text-zinc-900'} ${className}`}>
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="flex justify-between text-[10px] uppercase tracking-wider opacity-80"><span>{p.type || 'card'}</span><span>{p.name}</span></div>
      <p className="font-mono text-sm tracking-widest mt-6 opacity-90">•••• •••• •••• ····</p>
      <p className="absolute bottom-3 right-4 text-sm font-bold italic">{NETWORK_LABEL[p.network] || ''}</p>
    </div>
  );
}

/* ============================== Card Settings ============================== */

const EMPTY = { name: '', type: 'virtual', network: 'visa', purchasePrice: '', activationFee: '', designPreset: 'midnight', description: '', status: 'available' };

function CardForm({ initial, currency, networks, presets, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(initial ? { ...EMPTY, ...initial, purchasePrice: String(initial.purchasePrice ?? ''), activationFee: String(initial.activationFee ?? '') } : EMPTY);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const preview = { ...f, design: file ? URL.createObjectURL(file) : f.design };

  const save = () => {
    setError('');
    if (!f.name.trim()) return setError('Give the card a name');
    if (f.purchasePrice === '' || f.activationFee === '') return setError('Set the purchase price and the activation fee');
    const fd = new FormData();
    ['name', 'type', 'network', 'purchasePrice', 'activationFee', 'designPreset', 'description', 'status'].forEach((k) => fd.append(k, f[k]));
    if (file) fd.append('design', file);
    if (!file && initial?.design && !f.design) fd.append('removeDesign', 'true');
    run('save', () => (initial ? api.put(`/admin/card-settings/${initial._id}`, fd) : api.post('/admin/card-settings', fd)), initial ? 'Card updated' : 'Card created')
      .then((r) => { if (r) { onSaved(); onClose(); } });
  };

  return (
    <Modal open wide title={initial ? `Edit ${initial.name}` : 'Create a card'} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}><Check size={13} />{initial ? 'Save changes' : 'Create card'}</Button></>}>
      <div className="grid md:grid-cols-[1fr_260px] gap-5">
        <div className="space-y-3">
          <Field label="Card name"><input className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. Classic Virtual" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Card type">
              <select className={inputCls} value={f.type} onChange={set('type')}><option value="virtual">Virtual</option><option value="physical">Physical</option></select>
            </Field>
            <Field label="Card network">
              <select className={inputCls} value={f.network} onChange={set('network')}>{networks.map((n) => <option key={n} value={n}>{NETWORK_LABEL[n] || n}</option>)}</select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Purchase price (${currency})`} hint="What users pay to request the card"><input className={inputCls} inputMode="decimal" value={f.purchasePrice} onChange={set('purchasePrice')} placeholder="e.g. 25" /></Field>
            <Field label={`Activation fee (${currency})`} hint="What users pay to activate it"><input className={inputCls} inputMode="decimal" value={f.activationFee} onChange={set('activationFee')} placeholder="e.g. 10" /></Field>
          </div>
          <Field label="Status">
            <select className={inputCls} value={f.status} onChange={set('status')}><option value="available">Available</option><option value="unavailable">Unavailable (hidden from users)</option></select>
          </Field>
          <Field label="Short description (optional)"><input className={inputCls} value={f.description} onChange={set('description')} placeholder="e.g. Shop online worldwide" /></Field>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="space-y-3">
          <p className="text-[11px] text-[#8C96A8]">Card design</p>
          <CardArt product={preview} />
          <label className="flex items-center justify-center gap-2 h-9 rounded-xl bg-[#303943] hover:bg-[#3A4451] text-xs text-[#DDE3EC] cursor-pointer">
            <ImagePlus size={14} />{f.design || file ? 'Replace image' : 'Upload image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          {(f.design || file) && <button type="button" className="w-full text-[11px] text-[#8C96A8] hover:text-white" onClick={() => { setFile(null); setF((s) => ({ ...s, design: '' })); }}>Use a built-in look instead</button>}
          {!(f.design || file) && (
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button key={p} type="button" onClick={() => setF((s) => ({ ...s, designPreset: p }))}
                  className={`h-9 rounded-lg bg-gradient-to-br ${PRESET_BG[p]} ring-2 ${f.designPreset === p ? 'ring-blue-500' : 'ring-transparent'}`} title={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function CardSettings() {
  const api = useApi();
  const [type, setType] = useState('');
  const [edit, setEdit] = useState(null); // null | 'new' | product
  const { busy, run } = useAction();
  const c = useLoad(() => api.get('/admin/card-settings').then((r) => r.data.data), []);
  const items = (c.data?.items || []).filter((p) => !type || p.type === type);
  const toggle = (p) => {
    const fd = new FormData();
    fd.append('status', p.status === 'available' ? 'unavailable' : 'available');
    run(p._id, () => api.put(`/admin/card-settings/${p._id}`, fd).then(c.reload), p.status === 'available' ? 'Card disabled' : 'Card enabled');
  };

  return (
    <Page title="Card Settings" subtitle="Create the cards users can request, with their design, network, purchase price and activation fee." icon={CreditCard}
      actions={<Button onClick={() => setEdit('new')}><Plus size={13} />Create card</Button>}>
      <Tabs value={type} onChange={setType} tabs={[{ value: '', label: 'All cards' }, { value: 'virtual', label: 'Virtual' }, { value: 'physical', label: 'Physical' }]} />
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : !items.length ? (
        <Card><Empty icon={CreditCard} title="No cards yet" text="Create a card and it shows up on the users' Cards page." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((p, i) => (
            <article key={p._id} className={`bg-[#282F36] border border-[#2F3944] rounded-2xl p-3 pk-rise ${p.status === 'unavailable' ? 'opacity-60' : ''}`} style={{ animationDelay: `${i * 40}ms` }}>
              <CardArt product={p} />
              <div className="flex items-start justify-between mt-3 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-[#8C96A8] capitalize">{p.type} · {NETWORK_LABEL[p.network] || p.network}</p>
                </div>
                <Badge tone={p.status === 'available' ? 'green' : 'gray'}>{p.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] mt-3">
                <div><p className="text-[#6B7280]">Purchase</p><p className="text-white">{money(p.purchasePrice, c.data.currency)}</p></div>
                <div><p className="text-[#6B7280]">Activation</p><p className="text-white">{money(p.activationFee, c.data.currency)}</p></div>
                <div><p className="text-[#6B7280]">Requests</p><p className="text-white">{p.requests} ({p.activeCards} active)</p></div>
              </div>
              <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#2F3944]">
                <Button size="sm" variant="secondary" onClick={() => setEdit(p)}><Pencil size={12} />Edit</Button>
                <Button size="sm" variant={p.status === 'available' ? 'danger' : 'success'} busy={busy === p._id} onClick={() => toggle(p)}>
                  {p.status === 'available' ? <><Ban size={12} />Disable</> : <><RotateCcw size={12} />Enable</>}
                </Button>
                <span className="ml-auto text-[10px] text-[#6B7280] self-center">{shortDate(p.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {edit && (
        <CardForm initial={edit === 'new' ? null : edit} currency={c.data?.currency || 'USD'} networks={c.data?.networks || ['visa', 'mastercard']}
          presets={c.data?.presets || ['midnight']} onClose={() => setEdit(null)} onSaved={c.reload} />
      )}
    </Page>
  );
}

/* ============================== Card Invoices ============================== */

const STAGE_LABEL = {
  purchase_unpaid: 'Awaiting purchase payment',
  purchase_review: 'Purchase to review',
  activation_unpaid: 'Awaiting activation payment',
  activation_review: 'Activation to review',
  active: 'Active',
  frozen: 'Frozen',
  terminated: 'Terminated',
  rejected: 'Rejected',
  cancelled: 'Cancelled'
};
const STAGE_TONE = { purchase_review: 'amber', activation_review: 'amber', active: 'green', frozen: 'blue', terminated: 'red', rejected: 'red', cancelled: 'gray', purchase_unpaid: 'gray', activation_unpaid: 'blue' };
const ISSUABLE = ['activation_unpaid', 'activation_review', 'active', 'frozen'];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/* Same checks the server runs, so the admin sees problems while typing. */
const luhn = (s) => {
  let sum = 0;
  for (let i = 0; i < s.length; i += 1) { let d = Number(s[s.length - 1 - i]); if (i % 2) { d *= 2; if (d > 9) d -= 9; } sum += d; }
  return s.length > 0 && sum % 10 === 0;
};
const groupPan = (p) => (p.length === 15 ? `${p.slice(0, 4)} ${p.slice(4, 10)} ${p.slice(10)}`.trim() : p.replace(/(.{4})/g, '$1 ').trim());
const panHint = (pan, rule) => {
  if (!pan) return '';
  if (rule?.lengths && !rule.lengths.includes(pan.length)) return `${rule.label} numbers have ${rule.lengths.join(' or ')} digits (now ${pan.length})`;
  if (!luhn(pan)) return 'Check digit fails (not Luhn-valid)';
  return '';
};

function Copy({ value }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="text-[#8C96A8] hover:text-white" title="Copy"
      onClick={() => navigator.clipboard?.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1200); })}>
      {done ? <Check size={12} className="text-emerald-400" /> : <CopyIcon size={12} />}
    </button>
  );
}

/** Card details: issue / edit (number, expiry, CVV, holder) and freeze / unfreeze / terminate. */
function CardDetailsBlock({ r, onChanged }) {
  const api = useApi();
  const { busy, run } = useAction();
  const c = r.card || {};
  const rule = r.cardRule;
  const cvvLen = rule?.cvv || 3;
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState(null);
  const [error, setError] = useState('');
  const [shown, setShown] = useState(null);
  const [terminate, setTerminate] = useState(false);
  const [note, setNote] = useState('');
  const canEdit = ISSUABLE.includes(r.stage);

  const start = () => {
    setError('');
    setF({ pan: '', cvv: '', expiryMonth: c.expiryMonth || '', expiryYear: c.expiryYear || '', holderName: c.holderName || (r.holder?.fullName || '').toUpperCase() });
    setEditing(true);
  };
  const generate = () => run('gen', () => api.post(`/admin/card-invoices/${r._id}/card/generate`).then((x) => x.data.data))
    .then((g) => { if (g) { setError(''); setF((s) => ({ ...s, pan: g.pan, cvv: g.cvv, expiryMonth: g.expiryMonth, expiryYear: g.expiryYear, holderName: s?.holderName || g.holderName })); } });
  const save = () => {
    setError('');
    const pan = f.pan.replace(/\D/g, '');
    if (!c.issued || pan) { const h = pan ? panHint(pan, rule) : 'Enter the card number or generate one'; if (h) return setError(h); }
    if ((!c.issued || f.cvv) && !new RegExp(`^\\d{${cvvLen}}$`).test(f.cvv)) return setError(`The CVV must be ${cvvLen} digits`);
    if (!f.expiryMonth || !/^\d{4}$/.test(String(f.expiryYear))) return setError('Choose the expiry month and enter a 4-digit year');
    if (f.holderName.trim().length < 3) return setError('Enter the cardholder name');
    run('save', () => api.put(`/admin/card-invoices/${r._id}/card`, { ...f, pan }), c.issued ? 'Card details updated' : 'Card details issued')
      .then((x) => { if (x) { setEditing(false); setShown(null); onChanged(); } });
  };
  const reveal = () => (shown ? setShown(null) : run('reveal', () => api.get(`/admin/card-invoices/${r._id}/card/reveal`).then((x) => x.data.data)).then((d) => d && setShown(d)));
  const status = (action, body = {}) => run(action, () => api.patch(`/admin/card-invoices/${r._id}/card/status`, { action, ...body }),
    { freeze: 'Card frozen', unfreeze: 'Card unfrozen', terminate: 'Card terminated' }[action])
    .then((x) => { if (x) { setTerminate(false); setNote(''); onChanged(); } });

  if (!canEdit && r.stage !== 'terminated') {
    return (
      <div className="rounded-2xl border border-dashed border-[#2F3944] p-3 text-[11px] text-[#8C96A8]">
        <p className="text-xs font-semibold text-white mb-1">Card details</p>
        You can issue the card number, expiry and CVV once the purchase payment is approved.
      </div>
    );
  }

  const panDigits = f?.pan.replace(/\D/g, '') || '';
  const liveHint = editing ? panHint(panDigits, rule) : '';

  return (
    <div className="rounded-2xl border border-[#2F3944] p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-white flex items-center gap-1.5"><KeyRound size={13} />Card details</p>
        <Badge tone={c.issued ? 'green' : 'amber'}>{c.issued ? 'issued' : 'not issued'}</Badge>
      </div>

      {!editing && c.issued && (
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="col-span-2"><p className="text-[#6B7280]">Card number</p>
            <p className="text-white font-mono tracking-wider flex items-center gap-2">{shown ? shown.panFormatted : c.maskedNumber}{shown && <Copy value={shown.pan} />}</p></div>
          <div><p className="text-[#6B7280]">Expiry</p><p className="text-white font-mono">{c.expiry}</p></div>
          <div><p className="text-[#6B7280]">CVV</p><p className="text-white font-mono flex items-center gap-2">{shown ? shown.cvv : '•'.repeat(cvvLen)}{shown && <Copy value={shown.cvv} />}</p></div>
          <div className="col-span-2"><p className="text-[#6B7280]">Cardholder</p><p className="text-white">{c.holderName}</p></div>
          <div><p className="text-[#6B7280]">User PIN</p><p className="text-white">{r.pin?.isSet ? `Set ${shortDate(r.pin.setAt)}` : 'Not set yet'}</p></div>
          <div><p className="text-[#6B7280]">Issued</p><p className="text-white">{shortDate(c.issuedAt)}</p></div>
        </div>
      )}
      {!editing && !c.issued && (
        <p className="text-[11px] text-[#A5AFC4]">Issue the card number, expiry, CVV and cardholder name. They are required before you can approve the activation payment.</p>
      )}

      {editing && f && (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <Field className="flex-1" label={`Card number (${rule?.label || 'card'}${rule?.rule ? ` · ${rule.rule.replace(/^.*?numbers /, '')}` : ''})`}
              hint={c.issued && !panDigits ? 'Leave empty to keep the current number' : undefined}>
              <input className={`${inputCls} font-mono tracking-wider`} inputMode="numeric" autoComplete="off" value={groupPan(panDigits)} maxLength={23}
                onChange={(e) => setF((s) => ({ ...s, pan: e.target.value.replace(/\D/g, '').slice(0, 19) }))} placeholder={c.issued ? c.maskedNumber : 'Card number'} />
            </Field>
            <Button variant="secondary" busy={busy === 'gen'} onClick={generate}><Wand2 size={13} />Generate</Button>
          </div>
          {liveHint && <p className="text-[11px] text-amber-400">{liveHint}</p>}
          {!liveHint && panDigits && <p className="text-[11px] text-emerald-400">Valid {rule?.label} number</p>}
          <div className="grid grid-cols-3 gap-2">
            <Field label="Expiry month">
              <select className={inputCls} value={f.expiryMonth} onChange={(e) => setF((s) => ({ ...s, expiryMonth: Number(e.target.value) || '' }))}>
                <option value="">MM</option>{MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
              </select>
            </Field>
            <Field label="Expiry year"><input className={inputCls} inputMode="numeric" maxLength={4} value={f.expiryYear} onChange={(e) => setF((s) => ({ ...s, expiryYear: e.target.value.replace(/\D/g, '') }))} placeholder="YYYY" /></Field>
            <Field label={`CVV (${cvvLen} digits)`}><input className={`${inputCls} font-mono`} inputMode="numeric" autoComplete="off" maxLength={cvvLen} value={f.cvv} onChange={(e) => setF((s) => ({ ...s, cvv: e.target.value.replace(/\D/g, '') }))} placeholder={c.issued ? 'Keep' : '•'.repeat(cvvLen)} /></Field>
          </div>
          <Field label="Cardholder name (as printed)"><input className={inputCls} value={f.holderName} maxLength={60} onChange={(e) => setF((s) => ({ ...s, holderName: e.target.value.toUpperCase() }))} placeholder="JOHN DOE" /></Field>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" busy={busy === 'save'} disabled={busy === 'gen'} onClick={save}><Check size={12} />{c.issued ? 'Save changes' : 'Issue card details'}</Button>
            <Button size="sm" variant="secondary" disabled={busy === 'save'} onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {!editing && (
        <div className="flex flex-wrap gap-1.5">
          {canEdit && <Button size="sm" variant={c.issued ? 'secondary' : 'primary'} onClick={start}>{c.issued ? <><Pencil size={12} />Edit / regenerate</> : <><Plus size={12} />Issue card details</>}</Button>}
          {c.issued && <Button size="sm" variant="secondary" busy={busy === 'reveal'} onClick={reveal}>{shown ? <><EyeOff size={12} />Hide</> : <><Eye size={12} />Show full details</>}</Button>}
          {r.stage === 'active' && <Button size="sm" variant="secondary" busy={busy === 'freeze'} onClick={() => status('freeze')}><Snowflake size={12} />Freeze</Button>}
          {r.stage === 'frozen' && <Button size="sm" variant="success" busy={busy === 'unfreeze'} onClick={() => status('unfreeze')}><RotateCcw size={12} />Unfreeze</Button>}
          {canEdit && <Button size="sm" variant="danger" onClick={() => setTerminate(true)}><Ban size={12} />Terminate</Button>}
        </div>
      )}
      {r.stage === 'terminated' && <p className="text-[11px] text-red-400">Terminated {date(r.terminatedAt)}{r.statusNote ? ` · ${r.statusNote}` : ''}</p>}
      {r.stage === 'frozen' && <p className="text-[11px] text-blue-400">Frozen {date(r.frozenAt)}{r.statusNote ? ` · ${r.statusNote}` : ''}</p>}

      {terminate && (
        <Modal open title="Terminate card" onClose={() => setTerminate(false)}
          footer={<><Button variant="secondary" disabled={busy === 'terminate'} onClick={() => setTerminate(false)}>Cancel</Button><Button variant="danger" busy={busy === 'terminate'} disabled={!note.trim()} onClick={() => status('terminate', { note })}>Terminate card</Button></>}>
          <Field label="Reason (the user sees this)"><textarea className={`${inputCls} h-20 py-2`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Closed at the user's request" /></Field>
          <p className="text-[11px] text-[#8C96A8]">Terminating is final. The user can no longer see the card details or use the card.</p>
        </Modal>
      )}
    </div>
  );
}
const PAY_TONE = { unpaid: 'gray', pending: 'amber', approved: 'green', rejected: 'red' };

function PaymentBlock({ title, pay, price, currency, canDecide, onApprove, onReject, busy, extra, approveBlocked }) {
  return (
    <div className="rounded-2xl border border-[#2F3944] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white">{title}</p>
        <Badge tone={PAY_TONE[pay?.status || 'unpaid']}>{pay?.status || 'unpaid'}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div><p className="text-[#6B7280]">Amount</p><p className="text-white">{pay?.amount != null && pay?.status !== 'unpaid' ? money(pay.amount, pay.currency) : money(price, currency)}</p></div>
        <div><p className="text-[#6B7280]">Method</p><p className="text-white">{pay?.paymentMethod || '—'}</p></div>
        <div><p className="text-[#6B7280]">Submitted</p><p className="text-white">{date(pay?.submittedAt)}</p></div>
        <div><p className="text-[#6B7280]">Reference</p><p className="text-white break-all">{pay?.reference || '—'}</p></div>
      </div>
      {pay?.note && <p className="text-[11px] text-[#A5AFC4]">Note: {pay.note}</p>}
      {pay?.proof && (
        <a href={fileUrl(pay.proof)} target="_blank" rel="noreferrer" className="block">
          <img src={fileUrl(pay.proof)} alt="Payment proof" className="w-full max-h-56 object-contain rounded-xl bg-black/30" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="text-[11px] text-blue-400">Open payment proof</span>
        </a>
      )}
      {canDecide && (
        <div className="space-y-2 pt-1">
          {extra}
          <div className="flex gap-2">
            <Button size="sm" variant="success" busy={busy === 'approve'} disabled={Boolean(approveBlocked) || busy === 'reject'} title={approveBlocked || undefined} onClick={onApprove}><Check size={12} />Approve</Button>
            <Button size="sm" variant="danger" busy={busy === 'reject'} disabled={busy === 'approve'} onClick={onReject}><X size={12} />Reject</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestDetail({ id, onClose, onChanged }) {
  const api = useApi();
  const { busy, run } = useAction();
  const d = useLoad(() => api.get(`/admin/card-invoices/${id}`).then((r) => r.data.data), [id]);
  const [reject, setReject] = useState(null); // 'purchase' | 'activation'
  const [note, setNote] = useState('');
  const r = d.data;
  const decide = (which, decision, body = {}) =>
    run(decision, () => api.patch(`/admin/card-invoices/${id}/${which}/${decision}`, body), decision === 'approve' ? `${which === 'purchase' ? 'Purchase' : 'Activation'} payment approved` : 'Payment rejected')
      .then((res) => { if (res) { setReject(null); setNote(''); d.reload(); onChanged(); } });

  return (
    <Modal open wide title="Card request" onClose={onClose}>
      {d.error && <ErrorBox message={d.error} onRetry={d.reload} />}
      {!r ? <Loading /> : (
        <div className="grid md:grid-cols-[240px_1fr] gap-5">
          <div className="space-y-3">
            <CardArt product={r.productSnapshot} />
            <div className="text-[11px] space-y-1">
              <p className="text-white text-sm font-semibold">{r.productSnapshot?.name}</p>
              <p className="text-[#8C96A8] capitalize">{r.productSnapshot?.type} · {NETWORK_LABEL[r.productSnapshot?.network]}</p>
              <Badge tone={STAGE_TONE[r.stage]}>{STAGE_LABEL[r.stage] || r.stage}</Badge>
              {r.card?.issued && <p className="text-[#A5AFC4] pt-1">Card •••• {r.card.last4} · exp {r.card.expiry}</p>}
            </div>
            <div className="rounded-2xl border border-[#2F3944] p-3 text-[11px] space-y-1">
              <p className="text-white font-semibold text-xs">User</p>
              <p className="text-white">{who(r.user)}</p>
              <p className="text-[#8C96A8] break-all">{r.user?.email}</p>
              {r.user?.accountId && <p className="text-[#6B7280]">ID {r.user.accountId}</p>}
              <p className="text-white font-semibold text-xs pt-2">Cardholder</p>
              <p className="text-white">{r.holder?.fullName}</p>
              {r.holder?.email && <p className="text-[#8C96A8] break-all">{r.holder.email}</p>}
              {r.holder?.phone && <p className="text-[#8C96A8]">{r.holder.phone}</p>}
              {r.holder?.dateOfBirth && <p className="text-[#8C96A8]">Born {r.holder.dateOfBirth}</p>}
              {r.holder?.address?.city && <p className="text-[#8C96A8]">{[r.holder.address.street, r.holder.address.city, r.holder.address.state, r.holder.address.postalCode, r.holder.address.country].filter(Boolean).join(', ')}</p>}
              <p className="text-[#6B7280] pt-1">Requested {date(r.createdAt)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <PaymentBlock title="1. Card purchase payment" pay={r.purchase} price={r.productSnapshot?.purchasePrice} currency={r.productSnapshot?.baseCurrency}
              canDecide={r.stage === 'purchase_review'} busy={busy} onApprove={() => decide('purchase', 'approve')} onReject={() => setReject('purchase')} />
            <PaymentBlock title="2. Card activation payment" pay={r.activation} price={r.productSnapshot?.activationFee} currency={r.productSnapshot?.baseCurrency}
              canDecide={r.stage === 'activation_review'} busy={busy}
              onApprove={() => decide('activation', 'approve')} onReject={() => setReject('activation')}
              approveBlocked={!r.card?.issued ? 'Issue the card details first' : ''}
              extra={!r.card?.issued ? <p className="text-[11px] text-amber-400">Issue the card details below before approving the activation.</p> : null} />
            <CardDetailsBlock r={r} onChanged={() => { d.reload(); onChanged(); }} />
            {['purchase_unpaid', 'activation_unpaid'].includes(r.stage) && (
              <p className="text-[11px] text-[#8C96A8]">Waiting for the user to pay the {r.stage === 'purchase_unpaid' ? 'purchase price' : 'activation fee'}. It appears here for review once they submit it.</p>
            )}
          </div>
        </div>
      )}
      {reject && (
        <Modal open title={`Reject ${reject} payment`} onClose={() => setReject(null)}
          footer={<><Button variant="secondary" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" busy={busy === 'reject'} disabled={!note.trim()} onClick={() => decide(reject, 'reject', { note })}>Reject payment</Button></>}>
          <Field label="Reason (the user sees this)"><textarea className={`${inputCls} h-20 py-2`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Payment not received, or proof unreadable" /></Field>
          <p className="text-[11px] text-[#8C96A8]">The user can pay again after a rejection.</p>
        </Modal>
      )}
    </Modal>
  );
}

export function CardInvoices() {
  const api = useApi();
  const [status, setStatus] = useState('review');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const c = useLoad(() => api.get('/admin/card-invoices', { params: { status: status || undefined, search: search || undefined, page, limit: 20 } }).then((r) => r.data.data), [status, search, page]);
  const counts = c.data?.counts || {};
  const review = (counts.purchase_review || 0) + (counts.activation_review || 0);

  const columns = [
    { key: 'user', label: 'User', render: (r) => <div className="min-w-0"><p className="text-white truncate">{who(r.user)}</p><p className="text-[10px] text-[#8C96A8] truncate">{r.user?.email}</p></div> },
    { key: 'card', label: 'Card', render: (r) => <div><p className="text-white">{r.productSnapshot?.name}</p><p className="text-[10px] text-[#8C96A8] capitalize">{r.productSnapshot?.type} · {NETWORK_LABEL[r.productSnapshot?.network]}</p></div> },
    { key: 'price', label: 'Purchase', render: (r) => <div><p className="text-white">{r.purchase?.amount != null && r.purchase?.status !== 'unpaid' ? money(r.purchase.amount, r.purchase.currency) : money(r.productSnapshot?.purchasePrice, r.productSnapshot?.baseCurrency)}</p><Badge tone={PAY_TONE[r.purchase?.status || 'unpaid']}>{r.purchase?.status || 'unpaid'}</Badge></div> },
    { key: 'fee', label: 'Activation', render: (r) => <div><p className="text-white">{r.activation?.amount != null && r.activation?.status !== 'unpaid' ? money(r.activation.amount, r.activation.currency) : money(r.productSnapshot?.activationFee, r.productSnapshot?.baseCurrency)}</p><Badge tone={PAY_TONE[r.activation?.status || 'unpaid']}>{r.activation?.status || 'unpaid'}</Badge></div> },
    { key: 'stage', label: 'Status', render: (r) => <Badge tone={STAGE_TONE[r.stage]}>{STAGE_LABEL[r.stage] || r.stage}</Badge> },
    { key: 'date', label: 'Requested', render: (r) => <span className="text-[#A5AFC4]">{shortDate(r.createdAt)}</span> },
    { key: 'act', label: '', render: (r) => { const issue = ISSUABLE.includes(r.stage) && !r.card?.issued; const review = r.stage.endsWith('_review'); return <Button size="sm" variant={review || issue ? 'primary' : 'secondary'} onClick={(e) => { e.stopPropagation(); setOpen(r._id); }}>{review ? <><Check size={12} />Review</> : issue ? <><KeyRound size={12} />Issue card</> : <><Eye size={12} />View</>}</Button>; } }
  ];

  return (
    <Page title="Card Invoices" subtitle="Every card request, with its purchase and activation payments. Approve or reject each payment, then issue and manage the card." icon={Receipt}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[
          { value: 'review', label: `To review${review ? ` (${review})` : ''}` },
          { value: 'awaiting', label: 'Awaiting payment' },
          { value: 'active', label: 'Active cards' },
          { value: 'frozen', label: 'Frozen' },
          { value: 'terminated', label: 'Terminated' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: '', label: 'All' }
        ]} />
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search user or card…" />
      </div>
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : (
        <Card>
          <Table columns={columns} rows={c.data?.items || []} onRowClick={(r) => setOpen(r._id)}
            empty={<Empty icon={Receipt} title={status === 'review' ? 'No payments waiting for review' : 'No card requests here'} />} />
        </Card>
      )}
      {c.data && <Pager page={page} total={c.data.total} limit={c.data.limit} onPage={setPage} />}
      {open && <RequestDetail id={open} onClose={() => setOpen(null)} onChanged={c.reload} />}
    </Page>
  );
}
