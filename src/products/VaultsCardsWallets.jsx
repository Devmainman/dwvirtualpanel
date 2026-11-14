// Cold storage vaults, debit cards and connected wallets.
import { useState } from 'react';
import { Lock, CreditCard, Wallet, Check, X, Snowflake, Sun, Unlock, ShieldAlert, Trash2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Page, Card, Button, Field, Tabs, Table, Pager, Badge, Modal, inputCls, Loading, ErrorBox, Empty, SearchBox,
  useApi, useLoad, useAction, money, date, shortDate, who, confirmAction
} from './kit';

const UserCell = ({ u }) => <div><p className="text-white">{who(u)}</p><p className="text-[10px] text-[#6B7280]">{u?.email}</p></div>;

/* ------------------------------------------------------------ cold storage */

export function ColdStorageAdmin() {
  const api = useApi();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [note, setNote] = useState(null);
  const v = useLoad(() => api.get('/admin/products/cold-storage', { params: { page, limit: 20, status: status || undefined } }).then((r) => r.data.data), [page, status]);
  const { busy, run } = useAction();
  const patch = (row, body, msg) => run(row._id, () => api.patch(`/admin/products/cold-storage/${row._id}`, body).then(v.reload), msg);
  return (
    <Page title="Cold storage" subtitle="Vaulted funds, unlock requests and holds." icon={Lock}>
      {v.data?.totalsByCurrency?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {v.data.totalsByCurrency.map((t) => <span key={t._id} className="px-3 py-1.5 rounded-xl bg-[#282F36] border border-[#2F3944] text-xs text-white pk-rise">{money(t.total, t._id)} <span className="text-[#6B7280]">vaulted</span></span>)}
        </div>
      )}
      <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[{ value: '', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'unlock_requested', label: 'Unlock requested' }, { value: 'closed', label: 'Closed' }]} />
      <Card>
        {v.error && <ErrorBox message={v.error} onRetry={v.reload} />}
        {v.loading && !v.data ? <Loading /> : (
          <>
            <Table rows={v.data?.items} empty={<Empty icon={Lock} title="No vaults" />} columns={[
              { key: 'user', label: 'User', render: (r) => <UserCell u={r.user} /> },
              { key: 'name', label: 'Vault', render: (r) => <div><p className="text-white">{r.name}</p><p className="text-[10px] text-[#6B7280]">{r.lockType === 'time_locked' ? `Locked until ${shortDate(r.lockedUntil)}` : 'Flexible'}</p></div> },
              { key: 'amount', label: 'Balance', align: 'right', render: (r) => money(r.amount, r.currency) },
              { key: 'unlock', label: 'Unlock', render: (r) => (r.status === 'unlock_requested' ? <div><p className="text-amber-300">{money(r.unlockAmount, r.currency)}</p><p className="text-[10px] text-[#6B7280]">available {date(r.unlockAvailableAt)}</p></div> : '—') },
              { key: 'status', label: 'Status', render: (r) => <div className="flex gap-1"><Badge>{r.status}</Badge>{r.adminHold && <Badge tone="red">Hold</Badge>}</div> },
              {
                key: 'actions', label: '', render: (r) => (
                  <div className="flex gap-1 justify-end">
                    {r.status === 'unlock_requested' && <Button size="sm" variant="success" busy={busy === r._id} onClick={() => patch(r, { releaseNow: true }, 'Unlock can be released now')}><Unlock size={12} />Release now</Button>}
                    <Button size="sm" variant={r.adminHold ? 'secondary' : 'danger'} busy={busy === r._id} onClick={() => patch(r, { adminHold: !r.adminHold }, r.adminHold ? 'Hold removed' : 'Vault on hold')}><ShieldAlert size={12} />{r.adminHold ? 'Lift hold' : 'Hold'}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setNote(r)}>Note</Button>
                  </div>
                )
              }
            ]} />
            <Pager page={page} total={v.data?.total} limit={v.data?.limit} onPage={setPage} />
          </>
        )}
      </Card>
      {note && <NoteModal title={`Note · ${note.name}`} initial={note.adminNote} onClose={() => setNote(null)} onSave={(text) => patch(note, { adminNote: text }, 'Note saved').then(() => setNote(null))} />}
    </Page>
  );
}

function NoteModal({ title, initial, onClose, onSave, label = 'Internal note' }) {
  const [text, setText] = useState(initial || '');
  return (
    <Modal open title={title} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onSave(text)}>Save</Button></>}>
      <Field label={label}><textarea className={`${inputCls} h-auto py-2 min-h-[96px]`} value={text} onChange={(e) => setText(e.target.value)} /></Field>
    </Modal>
  );
}

/* ------------------------------------------------------------ cards */

const CARD_BG = { midnight: 'from-slate-800 to-slate-950', aurora: 'from-teal-500 to-indigo-700', gold: 'from-amber-300 to-amber-700', rose: 'from-rose-400 to-fuchsia-700' };

function ApproveModal({ card, onClose, onDone }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState({ last4: '', expiryMonth: '', expiryYear: '', providerCardId: '', adminNote: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  return (
    <Modal open title={`Approve ${card.type} card · ${card.holderName}`} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="success" busy={busy === 'ok'} onClick={() => run('ok', () => api.post(`/admin/products/cards/${card._id}/approve`, f).then(() => { onDone(); onClose(); }), 'Card approved')}><Check size={13} />Approve</Button></>}>
      <p className="text-[11px] text-[#8C96A8]">Leave fields empty to generate them. Only the last 4 digits are stored, never the full number.</p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Last 4"><input className={inputCls} maxLength={4} value={f.last4} onChange={set('last4')} /></Field>
        <Field label="Exp. month"><input type="number" className={inputCls} value={f.expiryMonth} onChange={set('expiryMonth')} /></Field>
        <Field label="Exp. year"><input type="number" className={inputCls} value={f.expiryYear} onChange={set('expiryYear')} /></Field>
      </div>
      <Field label="Issuer reference (optional)"><input className={inputCls} value={f.providerCardId} onChange={set('providerCardId')} /></Field>
      <Field label="Note"><input className={inputCls} value={f.adminNote} onChange={set('adminNote')} /></Field>
    </Modal>
  );
}

export function CardsAdmin() {
  const api = useApi();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [approve, setApprove] = useState(null);
  const [reject, setReject] = useState(null);
  const c = useLoad(() => api.get('/admin/products/cards', { params: { page, limit: 20, status: status || undefined } }).then((r) => r.data.data), [page, status]);
  const { busy, run } = useAction();
  const setFrozen = (card, frozen) => run(card._id, () => api.patch(`/admin/products/cards/${card._id}/status`, { status: frozen ? 'frozen' : 'active' }).then(c.reload), frozen ? 'Card frozen' : 'Card unfrozen');
  return (
    <Page title="Cards" subtitle="Approve card requests, freeze or unfreeze live cards. Fees are set on the Products page." icon={CreditCard}>
      <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[{ value: 'pending', label: 'Requests' }, { value: 'active', label: 'Active' }, { value: 'frozen', label: 'Frozen' }, { value: 'rejected', label: 'Rejected' }, { value: 'cancelled', label: 'Cancelled' }, { value: '', label: 'All' }]} />
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : !c.data?.items?.length ? <Card><Empty icon={CreditCard} title={status === 'pending' ? 'No card requests waiting' : 'No cards here'} /></Card> : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {c.data.items.map((card, i) => (
              <article key={card._id} className="bg-[#282F36] border border-[#2F3944] rounded-2xl p-3 pk-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <div className={`relative h-36 rounded-xl bg-gradient-to-br ${CARD_BG[card.color] || CARD_BG.midnight} p-4 text-white overflow-hidden shadow-lg`}>
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                  <div className="flex justify-between text-[10px] uppercase tracking-wider opacity-80"><span>{card.type}</span><span>{card.brand}</span></div>
                  <p className="font-mono text-base tracking-widest mt-7">•••• •••• •••• {card.last4 || '····'}</p>
                  <div className="flex justify-between text-[10px] mt-3 opacity-90"><span>{card.holderName}</span><span>{card.expiryMonth ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}` : '--/--'}</span></div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <UserCell u={card.user} />
                  <Badge>{card.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] mt-3">
                  <div><p className="text-[#6B7280]">Balance</p><p className="text-white">{money(card.balance, card.currency)}</p></div>
                  <div><p className="text-[#6B7280]">Limit</p><p className="text-white">{money(card.spendingLimit, card.currency)}</p></div>
                  <div><p className="text-[#6B7280]">Fee paid</p><p className="text-white">{money(card.issuanceFee, card.currency)}</p></div>
                </div>
                {card.type === 'physical' && card.shippingAddress?.city && <p className="text-[10px] text-[#6B7280] mt-2">Ship to: {[card.shippingAddress.street, card.shippingAddress.city, card.shippingAddress.country].filter(Boolean).join(', ')}</p>}
                {card.adminNote && <p className="text-[10px] text-[#8C96A8] mt-1 italic">“{card.adminNote}”</p>}
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#2F3944]">
                  {card.status === 'pending' && <><Button size="sm" variant="success" onClick={() => setApprove(card)}><Check size={12} />Approve</Button><Button size="sm" variant="danger" onClick={() => setReject(card)}><X size={12} />Decline</Button></>}
                  {card.status === 'active' && <Button size="sm" variant="secondary" busy={busy === card._id} onClick={() => setFrozen(card, true)}><Snowflake size={12} />Freeze</Button>}
                  {card.status === 'frozen' && <Button size="sm" variant="secondary" busy={busy === card._id} onClick={() => setFrozen(card, false)}><Sun size={12} />Unfreeze</Button>}
                  <span className="ml-auto text-[10px] text-[#6B7280] self-center">{shortDate(card.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
          <Pager page={page} total={c.data.total} limit={c.data.limit} onPage={setPage} />
        </>
      )}
      {approve && <ApproveModal card={approve} onClose={() => setApprove(null)} onDone={c.reload} />}
      {reject && <NoteModal title="Decline card request" label="Reason shown to the user (fee is refunded)" onClose={() => setReject(null)}
        onSave={(reason) => run('rej', () => api.post(`/admin/products/cards/${reject._id}/reject`, { reason }).then(() => { setReject(null); c.reload(); }), 'Request declined, fee refunded')} />}
    </Page>
  );
}

/* ------------------------------------------------------------ wallets */

export function WalletsAdmin() {
  const api = useApi();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const w = useLoad(() => api.get('/admin/products/wallets', { params: { page, limit: 25 } }).then((r) => r.data.data), [page]);
  const { busy, run } = useAction();
  const rows = (w.data?.items || []).filter((x) => !q || `${x.address} ${x.user?.email} ${x.label || x.provider || ''}`.toLowerCase().includes(q.toLowerCase()));
  const remove = (x) => confirmAction('Disconnect this wallet from the user’s account?') && run(x._id, () => api.delete(`/admin/ops/wallets/${x._id}`).then(w.reload), 'Wallet disconnected');
  const copy = (t) => { navigator.clipboard?.writeText(t); toast.info('Address copied'); };
  return (
    <Page title="Connected wallets" subtitle="Public addresses users linked. Seed phrases and private keys are never collected." icon={Wallet} actions={<SearchBox value={q} onChange={setQ} placeholder="Address or email" />}>
      <Card>
        {w.error && <ErrorBox message={w.error} onRetry={w.reload} />}
        {w.loading && !w.data ? <Loading /> : (
          <>
            <Table rows={rows} empty={<Empty icon={Wallet} title="No wallets connected" />} columns={[
              { key: 'user', label: 'User', render: (r) => <UserCell u={r.user} /> },
              { key: 'wallet', label: 'Wallet', render: (r) => <span className="capitalize">{r.label || r.provider || '—'}</span> },
              { key: 'chain', label: 'Network', render: (r) => <span className="uppercase">{r.network}{r.chainId ? ` · ${r.chainId}` : ''}</span> },
              { key: 'address', label: 'Address', render: (r) => <button type="button" onClick={() => copy(r.address)} className="font-mono text-[11px] text-[#DDE3EC] hover:text-blue-400 inline-flex items-center gap-1">{r.address?.slice(0, 8)}…{r.address?.slice(-6)}<Copy size={10} /></button> },
              { key: 'verified', label: 'Ownership', render: (r) => <Badge tone={r.verified ? 'green' : 'gray'}>{r.verified ? 'Signed' : 'Watch only'}</Badge> },
              { key: 'createdAt', label: 'Linked', render: (r) => shortDate(r.createdAt) },
              { key: 'x', label: '', render: (r) => <Button size="sm" variant="ghost" className="text-red-400" busy={busy === r._id} onClick={() => remove(r)}><Trash2 size={12} /></Button> }
            ]} />
            <Pager page={page} total={w.data?.total} limit={w.data?.limit} onPage={setPage} />
          </>
        )}
      </Card>
    </Page>
  );
}
