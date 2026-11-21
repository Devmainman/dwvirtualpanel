// Cold storage vaults and connected wallets.
import { useState } from 'react';
import { Lock, CreditCard, Wallet, Check, X, Snowflake, Sun, Unlock, ShieldAlert, Trash2, Copy } from 'lucide-react';
import { toast } from '../lib/toast';
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
