// FAQ / Help Center: categories (name + optional image) and their questions and answers.
// Published ones appear on the public site (/help and the landing page Help Center).
import { useMemo, useState } from 'react';
import { HelpCircle, Plus, Pencil, Trash2, ImagePlus, ExternalLink, Eye, EyeOff, Check } from 'lucide-react';
import {
  useApi, useLoad, useAction, Page, Card, Badge, Button, Field, inputCls, Loading, Empty, ErrorBox, Modal
} from './kit';
import { STATIC_BASE_URL } from '../api/config';
import { renderMarkdown } from '../lib/markdown';

const fileUrl = (p) => (p ? (/^https?:/.test(p) ? p : `${STATIC_BASE_URL}${p}`) : '');
const SITE = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');

function CategoryForm({ initial, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState({ name: initial?.name || '', description: initial?.description || '', status: initial?.status || 'published', sortOrder: initial?.sortOrder ?? 0, image: initial?.image || '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const image = file ? URL.createObjectURL(file) : fileUrl(f.image);
  const save = () => {
    setError('');
    if (f.name.trim().length < 2) return setError('Enter a category name');
    const fd = new FormData();
    ['name', 'description', 'status', 'sortOrder'].forEach((k) => fd.append(k, f[k]));
    if (file) fd.append('image', file);
    else if (initial?.image && !f.image) fd.append('removeImage', 'true');
    run('save', () => (initial ? api.put(`/admin/faq/categories/${initial._id}`, fd) : api.post('/admin/faq/categories', fd)), (r) => r.data.message)
      .then((r) => { if (r) { onSaved(); onClose(); } });
  };
  return (
    <Modal open title={initial ? `Edit ${initial.name}` : 'New FAQ category'} onClose={() => busy !== 'save' && onClose()}
      footer={<><Button variant="secondary" disabled={busy === 'save'} onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}><Check size={13} />{initial ? 'Save' : 'Create category'}</Button></>}>
      <div className="space-y-3">
        <Field label="Name"><input className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. Deposits & withdrawals" /></Field>
        <Field label="Short description (optional)"><input className={inputCls} value={f.description} onChange={set('description')} maxLength={240} /></Field>
        <div>
          <p className="text-[11px] text-[#8C96A8] mb-1">Image (optional)</p>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl bg-[#22282E] border border-[#2F3944] overflow-hidden flex items-center justify-center">
              {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <HelpCircle size={22} className="text-[#6B7280]" />}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#303943] hover:bg-[#3A4451] text-[11px] text-[#DDE3EC] cursor-pointer">
                <ImagePlus size={13} />{image ? 'Change image' : 'Upload image'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
              {image && <button type="button" className="text-[11px] text-[#8C96A8] hover:text-white text-left" onClick={() => { setFile(null); setF((s) => ({ ...s, image: '' })); }}>Remove image</button>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select className={inputCls} value={f.status} onChange={set('status')}><option value="published">Published</option><option value="draft">Draft (hidden)</option></select>
          </Field>
          <Field label="Order" hint="Lower numbers show first"><input type="number" className={inputCls} value={f.sortOrder} onChange={set('sortOrder')} /></Field>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

function QuestionForm({ initial, categories, categoryId, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState({ category: initial?.category?._id || initial?.category || categoryId || '', question: initial?.question || '', answer: initial?.answer || '', status: initial?.status || 'published', sortOrder: initial?.sortOrder ?? 0 });
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const html = useMemo(() => renderMarkdown(f.answer), [f.answer]);
  const save = () => {
    setError('');
    if (!f.category) return setError('Choose a category');
    if (f.question.trim().length < 3) return setError('Enter the question');
    if (!f.answer.trim()) return setError('Every question needs an answer');
    run('save', () => (initial ? api.put(`/admin/faq/items/${initial._id}`, f) : api.post('/admin/faq/items', f)), (r) => r.data.message)
      .then((r) => { if (r) { onSaved(); onClose(); } });
  };
  return (
    <Modal open wide title={initial ? 'Edit question' : 'New question'} onClose={() => busy !== 'save' && onClose()}
      footer={<><Button variant="secondary" disabled={busy === 'save'} onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}><Check size={13} />{initial ? 'Save' : 'Add question'}</Button></>}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Category" className="col-span-3 sm:col-span-1">
            <select className={inputCls} value={f.category} onChange={set('category')}>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Status"><select className={inputCls} value={f.status} onChange={set('status')}><option value="published">Published</option><option value="draft">Draft (hidden)</option></select></Field>
          <Field label="Order"><input type="number" className={inputCls} value={f.sortOrder} onChange={set('sortOrder')} /></Field>
        </div>
        <Field label="Question"><input className={inputCls} value={f.question} onChange={set('question')} maxLength={300} placeholder="e.g. How long do withdrawals take?" /></Field>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#8C96A8]">Answer</span>
            <button type="button" className="text-[11px] text-[#8C96A8] hover:text-white" onClick={() => setPreview((v) => !v)}>{preview ? 'Edit' : 'Preview'}</button>
          </div>
          {preview
            ? <div className="blog-prose rounded-xl bg-[#22282E] border border-[#2F3944] p-3 min-h-[160px] text-sm text-[#C9D1DC]" dangerouslySetInnerHTML={{ __html: html }} />
            : <textarea className={`${inputCls} h-auto py-2 min-h-[160px]`} value={f.answer} onChange={set('answer')} placeholder="Write the answer. **bold**, lists and [links](https://...) work." />}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

export function FaqAdmin() {
  const api = useApi();
  const { busy, run } = useAction();
  const cats = useLoad(() => api.get('/admin/faq/categories').then((r) => r.data.data), []);
  const [selected, setSelected] = useState(null);
  const categories = cats.data || [];
  const current = categories.find((c) => c._id === selected) || categories[0] || null;
  const items = useLoad(() => (current ? api.get('/admin/faq/items', { params: { category: current._id } }).then((r) => r.data.data) : Promise.resolve([])), [current?._id]);
  const [catForm, setCatForm] = useState(null);   // 'new' | category
  const [qForm, setQForm] = useState(null);       // 'new' | item
  const [confirm, setConfirm] = useState(null);   // { kind, item }
  const reloadAll = () => { cats.reload(); items.reload(); };

  const togglePublish = (kind, x) => {
    const next = x.status === 'published' ? 'draft' : 'published';
    if (kind === 'category') {
      const fd = new FormData(); fd.append('status', next);
      return run(`pub-${x._id}`, () => api.put(`/admin/faq/categories/${x._id}`, fd).then(reloadAll), next === 'published' ? 'Category published' : 'Category hidden');
    }
    return run(`pub-${x._id}`, () => api.put(`/admin/faq/items/${x._id}`, { status: next }).then(reloadAll), next === 'published' ? 'Question published' : 'Question hidden');
  };
  const remove = () => run('del', () => api.delete(confirm.kind === 'category' ? `/admin/faq/categories/${confirm.item._id}` : `/admin/faq/items/${confirm.item._id}`)
    .then((r) => { if (confirm.kind === 'category') setSelected(null); setConfirm(null); reloadAll(); return r; }), (r) => r.data.message);

  return (
    <Page title="FAQ" subtitle="Help Center categories and their questions. Published ones show on the public site and the landing page." icon={HelpCircle}
      actions={<>
        {SITE && <a href={`${SITE}/help`} target="_blank" rel="noreferrer"><Button variant="secondary"><ExternalLink size={13} />View Help Center</Button></a>}
        <Button onClick={() => setCatForm('new')}><Plus size={13} />New category</Button>
      </>}>
      {cats.error && <ErrorBox message={cats.error} onRetry={cats.reload} />}
      {cats.loading && !cats.data ? <Loading /> : !categories.length ? (
        <Card><Empty icon={HelpCircle} title="No FAQ categories yet" text="Create a category, then add questions and answers to it." /></Card>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4">
          <Card title="Categories" pad={false}>
            <ul className="divide-y divide-[#2F3944]">
              {categories.map((c) => (
                <li key={c._id}>
                  <button type="button" onClick={() => setSelected(c._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${current?._id === c._id ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}>
                    <div className="w-10 h-10 rounded-lg bg-[#22282E] overflow-hidden shrink-0 flex items-center justify-center">
                      {c.image ? <img src={fileUrl(c.image)} alt="" className="w-full h-full object-cover" /> : <HelpCircle size={16} className="text-[#6B7280]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{c.name}</p>
                      <p className="text-[10px] text-[#6B7280]">{c.published} published · {c.questions} total</p>
                    </div>
                    <Badge tone={c.status === 'published' ? 'green' : 'gray'}>{c.status}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {current && (
            <Card title={current.name}
              actions={<div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setCatForm(current)}><Pencil size={12} />Edit category</Button>
                <Button size="sm" variant="secondary" busy={busy === `pub-${current._id}`} disabled={!!busy} onClick={() => togglePublish('category', current)}>
                  {current.status === 'published' ? <><EyeOff size={12} />Unpublish</> : <><Eye size={12} />Publish</>}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirm({ kind: 'category', item: current })}><Trash2 size={12} />Delete</Button>
                <Button size="sm" onClick={() => setQForm('new')}><Plus size={12} />Add question</Button>
              </div>}>
              {current.description && <p className="text-xs text-[#8C96A8] mb-3">{current.description}</p>}
              {items.error && <ErrorBox message={items.error} onRetry={items.reload} />}
              {items.loading && !items.data ? <Loading /> : !(items.data || []).length ? (
                <Empty icon={HelpCircle} title="No questions in this category" text="Add the first question and its answer." />
              ) : (
                <ul className="space-y-2">
                  {items.data.map((q) => (
                    <li key={q._id} className="rounded-xl border border-[#2F3944] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium">{q.question}</p>
                          <p className="text-[11px] text-[#8C96A8] mt-1 line-clamp-2">{q.answer.replace(/[#*>`[\]()]/g, '')}</p>
                        </div>
                        <Badge tone={q.status === 'published' ? 'green' : 'gray'}>{q.status}</Badge>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <Button size="sm" variant="secondary" onClick={() => setQForm(q)}><Pencil size={12} />Edit</Button>
                        <Button size="sm" variant="secondary" busy={busy === `pub-${q._id}`} disabled={!!busy} onClick={() => togglePublish('item', q)}>
                          {q.status === 'published' ? <><EyeOff size={12} />Unpublish</> : <><Eye size={12} />Publish</>}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setConfirm({ kind: 'item', item: q })}><Trash2 size={12} />Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}

      {catForm && <CategoryForm initial={catForm === 'new' ? null : catForm} onClose={() => setCatForm(null)} onSaved={reloadAll} />}
      {qForm && <QuestionForm initial={qForm === 'new' ? null : qForm} categories={categories} categoryId={current?._id} onClose={() => setQForm(null)} onSaved={reloadAll} />}
      {confirm && (
        <Modal open title={confirm.kind === 'category' ? `Delete ${confirm.item.name}?` : 'Delete this question?'} onClose={() => busy !== 'del' && setConfirm(null)}
          footer={<><Button variant="secondary" disabled={busy === 'del'} onClick={() => setConfirm(null)}>Cancel</Button><Button variant="danger" busy={busy === 'del'} onClick={remove}><Trash2 size={12} />Delete</Button></>}>
          <p className="text-xs text-[#A5AFC4]">{confirm.kind === 'category' ? `The category and its ${confirm.item.questions} question(s) are deleted. This cannot be undone.` : `"${confirm.item.question}" is deleted. This cannot be undone.`}</p>
          <p className="text-[11px] text-[#6B7280] mt-2">To take it off the site for now, unpublish it instead.</p>
        </Modal>
      )}
    </Page>
  );
}
