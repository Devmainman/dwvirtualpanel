// Trader Rewards: the program switch and settings, milestones (required profit ->
// reward, claim fee, prize), and Reward Invoices (claims to approve or reject).
import { useState } from 'react';
import { Trophy, Plus, Pencil, Trash2, Check, X, Eye, Receipt, Power, Save } from 'lucide-react';
import {
  useApi, useLoad, useAction, money, date, shortDate, who, Page, Card, Badge, Button, Field, inputCls,
  Tabs, SearchBox, Loading, Empty, ErrorBox, Table, Pager, Modal, Toggle
} from './kit';
import { STATIC_BASE_URL } from '../api/config';

const fileUrl = (p) => (p ? (/^https?:/.test(p) ? p : `${STATIC_BASE_URL}${p}`) : '');
const EMPTY = { name: '', requiredProfit: '', rewardAmount: '', claimFee: '0', prize: '', description: '', status: 'active' };

function MilestoneForm({ initial, currency, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(initial ? { ...EMPTY, ...initial, requiredProfit: String(initial.requiredProfit), rewardAmount: String(initial.rewardAmount), claimFee: String(initial.claimFee ?? 0) } : EMPTY);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = () => {
    setError('');
    if (f.name.trim().length < 2) return setError('Enter a milestone name');
    if (!(Number(f.requiredProfit) > 0)) return setError('Required profit must be more than 0');
    if (!(Number(f.rewardAmount) > 0)) return setError('Reward amount must be more than 0');
    if (!(Number(f.claimFee) >= 0)) return setError('Claim fee must be 0 or more');
    const body = { name: f.name, requiredProfit: f.requiredProfit, rewardAmount: f.rewardAmount, claimFee: f.claimFee, prize: f.prize, description: f.description, status: f.status };
    run('save', () => (initial ? api.put(`/admin/rewards/milestones/${initial._id}`, body) : api.post('/admin/rewards/milestones', body)), (r) => r.data.message)
      .then((r) => { if (r) { onSaved(); onClose(); } });
  };
  return (
    <Modal open title={initial ? `Edit ${initial.name}` : 'New milestone'} onClose={() => busy !== 'save' && onClose()}
      footer={<><Button variant="secondary" disabled={busy === 'save'} onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}><Check size={13} />{initial ? 'Save' : 'Create milestone'}</Button></>}>
      <div className="space-y-3">
        <Field label="Milestone name"><input className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. Milestone 1" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Required profit (${currency})`}><input className={inputCls} inputMode="decimal" value={f.requiredProfit} onChange={set('requiredProfit')} placeholder="5000" /></Field>
          <Field label={`Reward amount (${currency})`}><input className={inputCls} inputMode="decimal" value={f.rewardAmount} onChange={set('rewardAmount')} placeholder="10000" /></Field>
          <Field label={`Claim fee (${currency})`} hint="0 = no fee; the claim goes straight to review"><input className={inputCls} inputMode="decimal" value={f.claimFee} onChange={set('claimFee')} /></Field>
          <Field label="Status">
            <select className={inputCls} value={f.status} onChange={set('status')}><option value="active">Active (users see it)</option><option value="hidden">Hidden</option></select>
          </Field>
        </div>
        <Field label="Prize details (optional)"><input className={inputCls} value={f.prize} onChange={set('prize')} maxLength={300} placeholder="e.g. Plus a branded trading kit" /></Field>
        <Field label="Description (optional)"><input className={inputCls} value={f.description} onChange={set('description')} maxLength={300} /></Field>
        <p className="text-[11px] text-[#6B7280]">Amounts are in {currency}; users see them in their own currency.</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

export function RewardsAdmin() {
  const api = useApi();
  const { busy, run } = useAction();
  const d = useLoad(() => api.get('/admin/rewards').then((r) => r.data.data), []);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [form, setForm] = useState(null);
  const data = d.data;
  const program = form || (data && { title: data.program.title, description: data.program.description, sources: data.program.sources });

  const toggle = () => run('toggle', () => api.put('/admin/rewards/program', { enabled: !data.program.enabled }).then((r) => { d.reload(); return r; }), (r) => r.data.message);
  const saveProgram = () => run('program', () => api.put('/admin/rewards/program', program).then((r) => { setForm(null); d.reload(); return r; }), (r) => r.data.message);
  const remove = () => run('del', () => api.delete(`/admin/rewards/milestones/${del._id}`).then((r) => { setDel(null); d.reload(); return r; }), (r) => r.data.message);

  return (
    <Page title="Trader Rewards" subtitle="Milestones users unlock with their trading profit. Every amount, fee and the program itself is set here." icon={Trophy}
      actions={<Button onClick={() => setEdit('new')} disabled={!data}><Plus size={13} />New milestone</Button>}>
      {d.error && <ErrorBox message={d.error} onRetry={d.reload} />}
      {!data ? <Loading /> : (
        <div className="space-y-4">
          <Card title="Program"
            actions={<Button variant={data.program.enabled ? 'danger' : 'success'} busy={busy === 'toggle'} disabled={!!busy} onClick={toggle}><Power size={13} />{data.program.enabled ? 'Disable program' : 'Enable program'}</Button>}>
            <p className={`text-xs mb-3 ${data.program.enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {data.program.enabled ? 'Enabled: users see milestones, track progress and claim rewards.' : 'Disabled: users see "Reward Program Currently Unavailable."'}
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Title"><input className={inputCls} value={program.title} onChange={(e) => setForm({ ...program, title: e.target.value })} /></Field>
              <Field label="Intro text (optional)"><input className={inputCls} value={program.description} onChange={(e) => setForm({ ...program, description: e.target.value })} /></Field>
            </div>
            <p className="text-[11px] text-[#8C96A8] mt-2 mb-1">Profit that counts toward milestones</p>
            <div className="flex flex-wrap gap-2">
              {data.sources.map((s) => {
                const on = program.sources.includes(s.key);
                return (
                  <button key={s.key} type="button" onClick={() => setForm({ ...program, sources: on ? program.sources.filter((x) => x !== s.key) : [...program.sources, s.key] })}
                    className={`h-7 px-3 rounded-full text-[11px] border transition ${on ? 'bg-blue-600/15 border-blue-500/50 text-white' : 'border-[#2F3944] text-[#8C96A8] hover:text-white'}`}>
                    {on && <Check size={11} className="inline mr-1" />}{s.label}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-3"><Button size="sm" busy={busy === 'program'} disabled={!form || !!busy} onClick={saveProgram}><Save size={12} />Save settings</Button></div>
          </Card>

          <Card title="Milestones">
            {!data.milestones.length ? (
              <Empty icon={Trophy} title="No milestones yet" text="Create a milestone: the profit a user must reach and the reward they get." />
            ) : (
              <Table rows={data.milestones} onRowClick={setEdit} columns={[
                { key: 'name', label: 'Milestone', render: (m) => <div><p className="text-white">{m.name}</p>{m.prize && <p className="text-[10px] text-[#8C96A8]">+ {m.prize}</p>}</div> },
                { key: 'req', label: 'Required profit', render: (m) => money(m.requiredProfit, data.currency) },
                { key: 'rew', label: 'Reward', render: (m) => <span className="text-emerald-400">{money(m.rewardAmount, data.currency)}</span> },
                { key: 'fee', label: 'Claim fee', render: (m) => (m.claimFee ? money(m.claimFee, data.currency) : 'None') },
                { key: 'claims', label: 'Claims', render: (m) => <span className="text-[11px] text-[#A5AFC4]">{m.claims.review} to review · {m.claims.approved} paid</span> },
                { key: 'status', label: 'Status', render: (m) => <Badge tone={m.status === 'active' ? 'green' : 'gray'}>{m.status}</Badge> },
                { key: 'act', label: '', render: (m) => <div className="flex gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="secondary" onClick={() => setEdit(m)}><Pencil size={12} /></Button>
                  <Button size="sm" variant="danger" onClick={() => setDel(m)}><Trash2 size={12} /></Button>
                </div> }
              ]} />
            )}
          </Card>
        </div>
      )}
      {edit && <MilestoneForm initial={edit === 'new' ? null : edit} currency={data?.currency || 'USD'} onClose={() => setEdit(null)} onSaved={d.reload} />}
      {del && (
        <Modal open title={`Delete ${del.name}?`} onClose={() => busy !== 'del' && setDel(null)}
          footer={<><Button variant="secondary" disabled={busy === 'del'} onClick={() => setDel(null)}>Cancel</Button><Button variant="danger" busy={busy === 'del'} onClick={remove}><Trash2 size={12} />Delete</Button></>}>
          <p className="text-xs text-[#A5AFC4]">Users will no longer see this milestone. Paid claims stay in Reward Invoices. If claims are still open, settle them first or hide the milestone instead.</p>
        </Modal>
      )}
    </Page>
  );
}

/* ============================== Reward Invoices ============================== */

const STAGE = { fee_unpaid: ['gray', 'Awaiting fee'], review: ['amber', 'To review'], approved: ['green', 'Paid'], rejected: ['red', 'Rejected'] };

function ClaimDetail({ id, onClose, onChanged }) {
  const api = useApi();
  const { busy, run } = useAction();
  const d = useLoad(() => api.get(`/admin/reward-invoices/${id}`).then((r) => r.data.data), [id]);
  const [reject, setReject] = useState(null); // 'fee' | 'final'
  const [note, setNote] = useState('');
  const c = d.data;
  const decide = (decision, body = {}) => run(decision, () => api.patch(`/admin/reward-invoices/${id}/${decision}`, body), (r) => r.data.message)
    .then((r) => { if (r) { setReject(null); setNote(''); d.reload(); onChanged(); } });
  const cur = c?.snapshot?.baseCurrency || 'USD';
  return (
    <Modal open wide title={c ? `Reward invoice ${c.invoiceNumber || ''}` : 'Reward invoice'} onClose={onClose}>
      {d.error && <ErrorBox message={d.error} onRetry={d.reload} />}
      {!c ? <Loading /> : (
        <div className="grid md:grid-cols-2 gap-4 text-[11px]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#2F3944] p-3 space-y-1">
              <div className="flex items-center justify-between"><p className="text-white text-sm font-semibold">{c.snapshot.name}</p><Badge tone={STAGE[c.stage][0]}>{STAGE[c.stage][1]}</Badge></div>
              <p className="text-[#8C96A8]">Required profit {money(c.snapshot.requiredProfit, cur)}</p>
              <p className="text-emerald-400 text-sm">Reward {money(c.snapshot.rewardAmount, cur)}</p>
              {c.snapshot.prize && <p className="text-[#A5AFC4]">+ {c.snapshot.prize}</p>}
              <p className="text-[#6B7280]">Claimed {date(c.createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-[#2F3944] p-3 space-y-1">
              <p className="text-white font-semibold text-xs">User</p>
              <p className="text-white">{who(c.user)}</p>
              <p className="text-[#8C96A8] break-all">{c.user?.email}</p>
              <p className="text-[#8C96A8]">Profit when claimed: {money(c.profitAtClaim, cur)}</p>
              <p className={c.currentProfit.total >= c.snapshot.requiredProfit ? 'text-emerald-400' : 'text-amber-400'}>
                Profit now: {money(c.currentProfit.total, cur)} {c.currentProfit.total >= c.snapshot.requiredProfit ? '(still qualifies)' : '(below the requirement now)'}
              </p>
              <div className="pt-1">{c.currentProfit.breakdown.filter((b) => b.amount).map((b) => <p key={b.source} className="text-[#6B7280]">{b.label}: {money(b.amount, cur)}</p>)}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#2F3944] p-3 space-y-1">
              <p className="text-white font-semibold text-xs">Claim fee</p>
              {c.snapshot.claimFee > 0 ? (
                <>
                  <p className="text-white">{c.payment?.amount != null ? money(c.payment.amount, c.payment.currency) : money(c.snapshot.claimFee, cur)} · <span className="capitalize">{c.payment?.status}</span></p>
                  {c.payment?.paymentMethod && <p className="text-[#8C96A8]">{c.payment.paymentMethod} · {c.payment.reference}</p>}
                  {c.payment?.submittedAt && <p className="text-[#6B7280]">Paid {date(c.payment.submittedAt)}</p>}
                  {c.payment?.note && <p className="text-amber-400">Note: {c.payment.note}</p>}
                  {c.payment?.proof && (
                    <a href={fileUrl(c.payment.proof)} target="_blank" rel="noreferrer" className="block pt-1">
                      <img src={fileUrl(c.payment.proof)} alt="Payment proof" className="w-full max-h-52 object-contain rounded-xl bg-black/30" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <span className="text-blue-400">Open payment proof</span>
                    </a>
                  )}
                </>
              ) : <p className="text-[#8C96A8]">No fee for this milestone.</p>}
            </div>
            {c.stage === 'approved' && <p className="text-emerald-400 text-xs">{money(c.reward?.amount, c.reward?.currency)} credited {date(c.reward?.creditedAt)}</p>}
            {c.stage === 'rejected' && c.note && <p className="text-red-400 text-xs">Rejected: {c.note}</p>}
            {c.stage === 'review' && (
              <div className="flex flex-wrap gap-2">
                <Button variant="success" busy={busy === 'approve'} disabled={!!busy} onClick={() => decide('approve')}><Check size={13} />Approve and credit {money(c.snapshot.rewardAmount, cur)}</Button>
                {c.snapshot.claimFee > 0 && <Button variant="secondary" disabled={!!busy} onClick={() => setReject('fee')}><X size={13} />Reject fee payment</Button>}
                <Button variant="danger" disabled={!!busy} onClick={() => setReject('final')}><X size={13} />Reject claim</Button>
              </div>
            )}
            {c.stage === 'fee_unpaid' && <p className="text-[#8C96A8]">Waiting for the user to pay the claim fee.</p>}
          </div>
        </div>
      )}
      {reject && (
        <Modal open title={reject === 'fee' ? 'Reject the fee payment' : 'Reject the claim'} onClose={() => busy !== 'reject' && setReject(null)}
          footer={<><Button variant="secondary" disabled={busy === 'reject'} onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" busy={busy === 'reject'} disabled={!note.trim()} onClick={() => decide('reject', { note, final: reject === 'final' })}>Reject</Button></>}>
          <Field label="Reason (the user sees this)"><textarea className={`${inputCls} h-20 py-2`} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <p className="text-[11px] text-[#8C96A8]">{reject === 'fee' ? 'The user can pay the fee again.' : 'The claim is closed. The user can claim again later.'}</p>
        </Modal>
      )}
    </Modal>
  );
}

export function RewardInvoices() {
  const api = useApi();
  const [status, setStatus] = useState('review');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const c = useLoad(() => api.get('/admin/reward-invoices', { params: { status: status || undefined, search: search || undefined, page, limit: 20 } }).then((r) => r.data.data), [status, search, page]);
  const counts = c.data?.counts || {};
  return (
    <Page title="Reward Invoices" subtitle="Reward claims from users who reached a milestone. Approving credits the reward to their balance." icon={Receipt}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[
          { value: 'review', label: `To review${counts.review ? ` (${counts.review})` : ''}` },
          { value: 'fee_unpaid', label: 'Awaiting fee' },
          { value: 'approved', label: 'Paid' },
          { value: 'rejected', label: 'Rejected' },
          { value: '', label: 'All' }
        ]} />
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search user, milestone or invoice…" />
      </div>
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : (
        <Card>
          <Table rows={c.data?.items || []} onRowClick={(r) => setOpen(r._id)} empty={<Empty icon={Receipt} title={status === 'review' ? 'No reward claims waiting' : 'No reward invoices here'} />} columns={[
            { key: 'inv', label: 'Invoice', render: (r) => <span className="text-[#A5AFC4]">{r.invoiceNumber || '—'}</span> },
            { key: 'user', label: 'User', render: (r) => <div><p className="text-white">{who(r.user)}</p><p className="text-[10px] text-[#8C96A8]">{r.user?.email}</p></div> },
            { key: 'm', label: 'Milestone', render: (r) => r.snapshot?.name },
            { key: 'reward', label: 'Reward', render: (r) => <span className="text-emerald-400">{money(r.snapshot?.rewardAmount, r.snapshot?.baseCurrency)}</span> },
            { key: 'fee', label: 'Fee', render: (r) => (r.snapshot?.claimFee ? `${money(r.payment?.amount ?? r.snapshot.claimFee, r.payment?.currency || r.snapshot.baseCurrency)} · ${r.payment?.status}` : 'None') },
            { key: 'stage', label: 'Status', render: (r) => <Badge tone={STAGE[r.stage][0]}>{STAGE[r.stage][1]}</Badge> },
            { key: 'date', label: 'Updated', render: (r) => shortDate(r.updatedAt) },
            { key: 'act', label: '', render: (r) => <Button size="sm" variant={r.stage === 'review' ? 'primary' : 'secondary'} onClick={(e) => { e.stopPropagation(); setOpen(r._id); }}>{r.stage === 'review' ? <><Check size={12} />Review</> : <><Eye size={12} />View</>}</Button> }
          ]} />
        </Card>
      )}
      {c.data && <Pager page={page} total={c.data.total} limit={c.data.limit} onPage={setPage} />}
      {open && <ClaimDetail id={open} onClose={() => setOpen(null)} onChanged={c.reload} />}
    </Page>
  );
}
