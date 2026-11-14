// Real estate: create and run projects, follow investors.
import { useState } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Lock, Unlock } from 'lucide-react';
import {
  Page, Card, Stat, Button, Field, Toggle, Tabs, Table, Pager, Badge, Modal, inputCls, Loading, ErrorBox, Empty,
  useApi, useLoad, useAction, money, num, shortDate, who, confirmAction
} from './kit';

const TYPES = ['residential', 'commercial', 'industrial', 'hospitality', 'land', 'mixed_use', 'life_science', 'healthcare', 'retail', 'office'];
const lines = (a) => (a || []).join('\n');
const toLines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

const blank = {
  title: '', summary: '', overview: '', images: '', propertyType: 'commercial', assetType: '', stories: '', strategy: 'Fixed income', objective: '',
  minimumInvestment: '', roi: '', durationMonths: '', fundingTarget: '', whyProject: '', sponsorName: '', sponsorAbout: '', whySponsor: '',
  documents: '', address: '', city: '', country: '', featured: false, status: 'open', sortOrder: 0
};

const toForm = (p) => ({
  ...blank,
  ...p,
  images: lines(p.images),
  whyProject: lines(p.whyProject),
  whySponsor: lines(p.whySponsor),
  sponsorName: p.sponsor?.name || '',
  sponsorAbout: p.sponsor?.about || '',
  documents: (p.documents || []).map((d) => `${d.title} | ${d.url}`).join('\n'),
  address: p.location?.address || '',
  city: p.location?.city || '',
  country: p.location?.country || '',
  stories: p.stories ?? ''
});

const toBody = (f) => ({
  title: f.title, summary: f.summary, overview: f.overview, propertyType: f.propertyType, assetType: f.assetType, strategy: f.strategy, objective: f.objective,
  minimumInvestment: f.minimumInvestment, roi: f.roi, durationMonths: f.durationMonths, fundingTarget: f.fundingTarget,
  stories: f.stories === '' ? undefined : f.stories, sortOrder: f.sortOrder, featured: !!f.featured, status: f.status,
  images: toLines(f.images), whyProject: toLines(f.whyProject), whySponsor: toLines(f.whySponsor),
  sponsor: { name: f.sponsorName, about: f.sponsorAbout },
  location: { address: f.address, city: f.city, country: f.country },
  documents: toLines(f.documents).map((l) => { const [title, url] = l.split('|').map((x) => x.trim()); return { title, url }; })
});

function ProjectForm({ initial, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(initial ? toForm(initial) : blank);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));
  const save = () => run('save', async () => {
    const body = toBody(f);
    if (initial) await api.put(`/admin/products/real-estate/properties/${initial._id}`, body);
    else await api.post('/admin/products/real-estate/properties', body);
    onSaved();
    onClose();
  }, initial ? 'Project updated' : 'Project created');
  const area = `${inputCls} h-auto py-2 min-h-[72px]`;
  return (
    <Modal open wide title={initial ? `Edit · ${initial.title}` : 'New project'} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}>{initial ? 'Save' : 'Create project'}</Button></>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title" className="sm:col-span-2"><input className={inputCls} value={f.title} onChange={set('title')} /></Field>
        <Field label="Summary (one or two lines)" className="sm:col-span-2"><input className={inputCls} value={f.summary} onChange={set('summary')} /></Field>
        <Field label="Minimum investment (base currency)"><input type="number" className={inputCls} value={f.minimumInvestment} onChange={set('minimumInvestment')} /></Field>
        <Field label="Funding target"><input type="number" className={inputCls} value={f.fundingTarget} onChange={set('fundingTarget')} /></Field>
        <Field label="Total ROI over the term (%)"><input type="number" className={inputCls} value={f.roi} onChange={set('roi')} /></Field>
        <Field label="Term (months)"><input type="number" className={inputCls} value={f.durationMonths} onChange={set('durationMonths')} /></Field>
        <Field label="Property type">
          <select className={inputCls} value={f.propertyType} onChange={set('propertyType')}>{TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select>
        </Field>
        <Field label="Asset type"><input className={inputCls} value={f.assetType} placeholder="Life Science - Lab/R&D" onChange={set('assetType')} /></Field>
        <Field label="Strategy"><input className={inputCls} value={f.strategy} onChange={set('strategy')} /></Field>
        <Field label="Objective"><input className={inputCls} value={f.objective} placeholder="Opportunistic" onChange={set('objective')} /></Field>
        <Field label="Stories"><input type="number" className={inputCls} value={f.stories} onChange={set('stories')} /></Field>
        <Field label="Sort order"><input type="number" className={inputCls} value={f.sortOrder} onChange={set('sortOrder')} /></Field>
        <Field label="Address"><input className={inputCls} value={f.address} onChange={set('address')} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="City"><input className={inputCls} value={f.city} onChange={set('city')} /></Field>
          <Field label="Country"><input className={inputCls} value={f.country} onChange={set('country')} /></Field>
        </div>
        <Field label="Image URLs (one per line)" className="sm:col-span-2"><textarea className={area} value={f.images} onChange={set('images')} /></Field>
        <Field label="Project overview" className="sm:col-span-2"><textarea className={`${area} min-h-[110px]`} value={f.overview} onChange={set('overview')} /></Field>
        <Field label="Why this project (one point per line)" className="sm:col-span-2"><textarea className={area} value={f.whyProject} onChange={set('whyProject')} /></Field>
        <Field label="Sponsor name"><input className={inputCls} value={f.sponsorName} onChange={set('sponsorName')} /></Field>
        <Field label="Status">
          <select className={inputCls} value={f.status} onChange={set('status')}><option value="open">Open</option><option value="closed">Closed</option></select>
        </Field>
        <Field label="About the sponsor" className="sm:col-span-2"><textarea className={area} value={f.sponsorAbout} onChange={set('sponsorAbout')} /></Field>
        <Field label="Why this sponsor (one point per line)" className="sm:col-span-2"><textarea className={area} value={f.whySponsor} onChange={set('whySponsor')} /></Field>
        <Field label="Documents (Title | https://link, one per line)" className="sm:col-span-2"><textarea className={area} value={f.documents} onChange={set('documents')} /></Field>
        <Toggle checked={!!f.featured} onChange={(v) => setF((s) => ({ ...s, featured: v }))} label="Featured" />
      </div>
    </Modal>
  );
}

function Projects() {
  const api = useApi();
  const list = useLoad(() => api.get('/admin/products/real-estate/properties').then((r) => r.data.data), []);
  const { busy, run } = useAction();
  const [editing, setEditing] = useState(null);
  const projects = list.data || [];
  const toggle = (p) => run(p._id, () => api.put(`/admin/products/real-estate/properties/${p._id}`, { status: p.status === 'open' ? 'closed' : 'open' }).then(list.reload), p.status === 'open' ? 'Project closed' : 'Project reopened');
  const remove = (p) => confirmAction(`Delete "${p.title}"? This cannot be undone.`) && run(p._id, () => api.delete(`/admin/products/real-estate/properties/${p._id}`).then(list.reload), 'Project deleted');

  return (
    <>
      <div className="flex justify-end mb-3"><Button onClick={() => setEditing('new')}><Plus size={14} />New project</Button></div>
      {list.error && <ErrorBox message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data ? <Loading /> : !projects.length ? <Card><Empty icon={Building2} title="No projects yet" text="Create the first project investors can put money into." /></Card> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {projects.map((p, i) => (
            <article key={p._id} className="bg-[#282F36] border border-[#2F3944] rounded-2xl overflow-hidden flex flex-col pk-rise" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="h-32 bg-[#303943] relative">
                {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />}
                <div className="absolute top-2 left-2 flex gap-1"><Badge>{p.status}</Badge>{p.featured && <Badge tone="violet">Featured</Badge>}</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-sm font-semibold text-white leading-snug">{p.title}</p>
                <p className="text-[11px] text-[#8C96A8] flex items-center gap-1 mt-0.5"><MapPin size={11} />{[p.location?.city, p.location?.country].filter(Boolean).join(', ') || '—'}</p>
                <div className="mt-3 h-1.5 rounded-full bg-[#303943] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-[width] duration-700" style={{ width: `${p.fundedPercent || 0}%` }} /></div>
                <div className="flex justify-between text-[11px] text-[#8C96A8] mt-1"><span>{money(p.amountRaised)} raised</span><span>{num(p.fundedPercent)}% of {money(p.fundingTarget)}</span></div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                  <div><p className="text-[#6B7280]">ROI</p><p className="text-emerald-400 font-semibold">{p.roi}%</p></div>
                  <div><p className="text-[#6B7280]">Term</p><p className="text-white font-semibold">{p.durationMonths} mo</p></div>
                  <div><p className="text-[#6B7280]">Min</p><p className="text-white font-semibold">{money(p.minimumInvestment)}</p></div>
                </div>
                <div className="flex gap-1.5 mt-4 pt-3 border-t border-[#2F3944]">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(p)}><Pencil size={12} />Edit</Button>
                  <Button size="sm" variant="secondary" busy={busy === p._id} onClick={() => toggle(p)}>{p.status === 'open' ? <><Lock size={12} />Close</> : <><Unlock size={12} />Reopen</>}</Button>
                  <Button size="sm" variant="ghost" className="ml-auto text-red-400" onClick={() => remove(p)}><Trash2 size={12} /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && <ProjectForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={list.reload} />}
    </>
  );
}

function Investments() {
  const api = useApi();
  const [page, setPage] = useState(1);
  const inv = useLoad(() => api.get('/admin/products/real-estate/investments', { params: { page, limit: 20 } }).then((r) => r.data.data), [page]);
  const d = inv.data;
  return (
    <Card pad>
      {inv.error && <ErrorBox message={inv.error} onRetry={inv.reload} />}
      {inv.loading && !d ? <Loading /> : (
        <>
          <Table rows={d?.items} empty={<Empty icon={Building2} title="No investments yet" />} columns={[
            { key: 'user', label: 'Investor', render: (r) => <div><p className="text-white">{who(r.user)}</p><p className="text-[10px] text-[#6B7280]">{r.user?.email}</p></div> },
            { key: 'project', label: 'Project', render: (r) => r.property?.title || '—' },
            { key: 'amount', label: 'Invested', align: 'right', render: (r) => money(r.amount, r.currency) },
            { key: 'earned', label: 'Earned', align: 'right', render: (r) => <span className="text-emerald-400">{money(r.earnedIncome || 0, r.currency)}</span> },
            { key: 'maturityAt', label: 'Matures', render: (r) => shortDate(r.maturityAt) },
            { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> }
          ]} />
          <Pager page={page} total={d?.total} limit={d?.limit} onPage={setPage} />
        </>
      )}
    </Card>
  );
}

export default function RealEstateAdmin() {
  const [tab, setTab] = useState('projects');
  const api = useApi();
  const ov = useLoad(() => api.get('/admin/ops/overview').then((r) => r.data.data), []);
  const re = ov.data?.realEstate;
  return (
    <Page title="Real estate" subtitle="Projects investors can buy into, and every investment made." icon={Building2}>
      {re && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat i={0} label="Invested (active)" value={money(re.total, ov.data.currency)} tone="up" />
          <Stat i={1} label="Active investments" value={num(re.count, 0)} />
          <Stat i={2} label="Open projects" value={num(re.projects?.open || 0, 0)} tone="blue" />
          <Stat i={3} label="Closed projects" value={num(re.projects?.closed || 0, 0)} />
        </div>
      )}
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'projects', label: 'Projects' }, { value: 'investments', label: 'Investments' }]} />
      {tab === 'projects' ? <Projects /> : <Investments />}
    </Page>
  );
}
