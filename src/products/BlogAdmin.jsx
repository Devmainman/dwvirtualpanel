// Blog: write and publish articles (shown on the public site at /blog) and manage categories.
import { useMemo, useState } from 'react';
import { Newspaper, Plus, Pencil, Trash2, Check, Eye, PenLine, ImagePlus, ExternalLink, Tag } from 'lucide-react';
import {
  useApi, useLoad, useAction, shortDate, Page, Card, Badge, Button, Field, inputCls,
  Tabs, SearchBox, Loading, Empty, ErrorBox, Table, Pager, Modal, confirmAction
} from './kit';
import { STATIC_BASE_URL } from '../api/config';
import { renderMarkdown } from '../lib/markdown';

const fileUrl = (p) => (p ? (/^https?:/.test(p) ? p : `${STATIC_BASE_URL}${p}`) : '');
const SITE = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
const PROSE = `
.blog-prose{color:#C9D1DC;font-size:14px;line-height:1.75}
.blog-prose>*+*{margin-top:1em}
.blog-prose h2,.blog-prose h3,.blog-prose h4{color:#fff;font-weight:600;line-height:1.25;margin-top:1.6em}
.blog-prose h2{font-size:20px}.blog-prose h3{font-size:17px}.blog-prose h4{font-size:15px}
.blog-prose a{color:#fb9b4b;text-decoration:underline}
.blog-prose ul{list-style:disc;padding-left:1.3em}.blog-prose ol{list-style:decimal;padding-left:1.3em}
.blog-prose blockquote{border-left:2px solid #e8742a;padding-left:12px;color:#fff}
.blog-prose code{background:#303943;padding:1px 5px;border-radius:5px;font-size:12px}
.blog-prose img{width:100%;border-radius:12px}.blog-prose hr{border:0;height:1px;background:#3A4451}
`;
const HELP = '## Heading   **bold**   *italic*   - list item   1. numbered   > quote   [link text](https://...)   ![image](https://...)';

function PostEditor({ id, categories, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const existing = useLoad(() => (id ? api.get(`/admin/blog/posts/${id}`).then((r) => r.data.data) : Promise.resolve(null)), [id]);
  const [f, setF] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const p = existing.data;
  if (!f && !existing.loading) {
    setF({
      title: p?.title || '', slug: p?.slug || '', excerpt: p?.excerpt || '', content: p?.content || '',
      category: p?.category?._id || '', authorName: p?.authorName || '', status: p?.status || 'draft',
      featured: !!p?.featured, coverImage: p?.coverImage || ''
    });
  }
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const html = useMemo(() => (f ? renderMarkdown(f.content) : ''), [f]);

  const save = (status) => {
    setError('');
    if (!f.title.trim()) return setError('Give the article a title');
    if (status === 'published' && f.content.trim().length < 20) return setError('Write the article before publishing it');
    const fd = new FormData();
    ['title', 'slug', 'excerpt', 'content', 'category', 'authorName'].forEach((k) => fd.append(k, f[k]));
    fd.append('status', status);
    fd.append('featured', String(f.featured));
    if (file) fd.append('coverImage', file);
    if (!file && p?.coverImage && !f.coverImage) fd.append('removeCover', 'true');
    run(status, () => (id ? api.put(`/admin/blog/posts/${id}`, fd) : api.post('/admin/blog/posts', fd)), status === 'published' ? 'Article published' : 'Draft saved')
      .then((r) => { if (r) { onSaved(); onClose(); } });
  };

  const cover = file ? URL.createObjectURL(file) : fileUrl(f?.coverImage);
  return (
    <Modal open wide title={id ? 'Edit article' : 'New article'} onClose={onClose}
      footer={f && <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="secondary" busy={busy === 'draft'} onClick={() => save('draft')}>{p?.status === 'published' ? 'Unpublish (save as draft)' : 'Save draft'}</Button>
        <Button busy={busy === 'published'} onClick={() => save('published')}><Check size={13} />{p?.status === 'published' ? 'Update article' : 'Publish'}</Button>
      </>}>
      <style>{PROSE}</style>
      {existing.error && <ErrorBox message={existing.error} onRetry={existing.reload} />}
      {!f ? <Loading /> : (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={f.title} onChange={set('title')} placeholder="e.g. How copy trading works" /></Field>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Category">
              <select className={inputCls} value={f.category} onChange={set('category')}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Author (optional)"><input className={inputCls} value={f.authorName} onChange={set('authorName')} placeholder="e.g. Research team" /></Field>
            <Field label="Web address (optional)" hint="Made from the title if empty"><input className={inputCls} value={f.slug} onChange={set('slug')} placeholder="how-copy-trading-works" /></Field>
          </div>
          <Field label="Summary (shown on the blog list)"><textarea className={`${inputCls} h-16 py-2`} value={f.excerpt} onChange={set('excerpt')} maxLength={300} /></Field>
          <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
            <div className="space-y-2">
              <div className="aspect-[16/10] rounded-xl bg-[#303943] overflow-hidden flex items-center justify-center">
                {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <span className="text-[11px] text-[#6B7280]">No cover image</span>}
              </div>
              <label className="flex items-center justify-center gap-2 h-8 rounded-lg bg-[#303943] hover:bg-[#3A4451] text-[11px] text-[#DDE3EC] cursor-pointer">
                <ImagePlus size={13} />{cover ? 'Replace cover' : 'Add cover'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
              {cover && <button type="button" className="w-full text-[11px] text-[#8C96A8] hover:text-white" onClick={() => { setFile(null); setF((s) => ({ ...s, coverImage: '' })); }}>Remove cover</button>}
              <label className="flex items-center gap-2 text-[11px] text-[#A5AFC4]"><input type="checkbox" checked={f.featured} onChange={set('featured')} />Feature at the top of the blog</label>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-[#8C96A8]">Article</p>
                <div className="flex gap-1">
                  <Button size="sm" variant={preview ? 'ghost' : 'secondary'} onClick={() => setPreview(false)}><PenLine size={12} />Write</Button>
                  <Button size="sm" variant={preview ? 'secondary' : 'ghost'} onClick={() => setPreview(true)}><Eye size={12} />Preview</Button>
                </div>
              </div>
              {preview
                ? <div className="blog-prose min-h-[300px] max-h-[420px] overflow-y-auto rounded-xl bg-[#22282e] p-4" dangerouslySetInnerHTML={{ __html: html || '<p style="color:#6B7280">Nothing written yet.</p>' }} />
                : <textarea className={`${inputCls} !h-[300px] py-3 font-mono text-[12.5px] leading-relaxed`} value={f.content} onChange={set('content')} placeholder={'Start writing...\n\n## A section heading\nA paragraph of text.'} />}
              <p className="text-[10px] text-[#6B7280] mt-1.5">{HELP}</p>
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

function Categories({ cats, reload }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [edit, setEdit] = useState(null);
  const save = () => run('save', () => (edit._id ? api.put(`/admin/blog/categories/${edit._id}`, edit) : api.post('/admin/blog/categories', edit)), edit._id ? 'Category updated' : 'Category added')
    .then((r) => { if (r) { setEdit(null); reload(); } });
  const del = (c) => confirmAction(`Delete "${c.name}"? Its ${c.posts} article(s) stay, without a category.`) && run(c._id, () => api.delete(`/admin/blog/categories/${c._id}`).then(reload), 'Category deleted');
  return (
    <>
      <Card title="Categories" actions={<Button size="sm" onClick={() => setEdit({ name: '', description: '' })}><Plus size={12} />Add category</Button>}>
        {!cats.length ? <Empty icon={Tag} title="No categories yet" text="Add categories like News, Guides or Markets." /> : (
          <Table rows={cats} columns={[
            { key: 'name', label: 'Name', render: (c) => <span className="text-white">{c.name}</span> },
            { key: 'slug', label: 'Address', render: (c) => <span className="text-[#8C96A8]">/blog?category={c.slug}</span> },
            { key: 'description', label: 'Description', render: (c) => <span className="text-[#A5AFC4]">{c.description || '—'}</span> },
            { key: 'posts', label: 'Articles', align: 'right' },
            { key: 'act', label: '', render: (c) => <div className="flex gap-1 justify-end"><Button size="sm" variant="secondary" onClick={() => setEdit({ ...c })}><Pencil size={12} /></Button><Button size="sm" variant="danger" busy={busy === c._id} onClick={() => del(c)}><Trash2 size={12} /></Button></div> }
          ]} />
        )}
      </Card>
      {edit && (
        <Modal open title={edit._id ? 'Edit category' : 'Add category'} onClose={() => setEdit(null)}
          footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button busy={busy === 'save'} disabled={!edit.name?.trim()} onClick={save}><Check size={13} />Save</Button></>}>
          <Field label="Name"><input className={inputCls} value={edit.name} onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Guides" /></Field>
          <Field label="Description (optional)"><input className={inputCls} value={edit.description} onChange={(e) => setEdit((s) => ({ ...s, description: e.target.value }))} /></Field>
        </Modal>
      )}
    </>
  );
}

export function BlogAdmin() {
  const api = useApi();
  const [tab, setTab] = useState('posts');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const { busy, run } = useAction();
  const cats = useLoad(() => api.get('/admin/blog/categories').then((r) => r.data.data), []);
  const posts = useLoad(() => api.get('/admin/blog/posts', { params: { status: status || undefined, search: search || undefined, page, limit: 20 } }).then((r) => r.data.data), [status, search, page]);
  const del = (p) => confirmAction(`Delete "${p.title}"? This cannot be undone.`) && run(p._id, () => api.delete(`/admin/blog/posts/${p._id}`).then(() => { posts.reload(); cats.reload(); }), 'Article deleted');

  return (
    <Page title="Blog" subtitle="Write articles for the public blog on the landing site and organise them in categories." icon={Newspaper}
      actions={<Button onClick={() => setEditing('new')}><Plus size={13} />New article</Button>}>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'posts', label: 'Articles' }, { value: 'categories', label: 'Categories' }]} />
      {tab === 'categories' ? (
        cats.error ? <ErrorBox message={cats.error} onRetry={cats.reload} /> : cats.loading && !cats.data ? <Loading /> : <Categories cats={cats.data || []} reload={cats.reload} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[{ value: '', label: 'All' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Drafts' }]} />
            <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search titles…" />
          </div>
          {posts.error && <ErrorBox message={posts.error} onRetry={posts.reload} />}
          {posts.loading && !posts.data ? <Loading /> : (
            <Card>
              <Table rows={posts.data?.items || []} onRowClick={(p) => setEditing(p._id)}
                empty={<Empty icon={Newspaper} title="No articles yet" text="Write your first article; it appears on the blog when you publish it." />}
                columns={[
                  { key: 'title', label: 'Article', render: (p) => (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-9 rounded-md bg-[#303943] overflow-hidden shrink-0">{p.coverImage && <img src={fileUrl(p.coverImage)} alt="" className="w-full h-full object-cover" />}</div>
                      <div className="min-w-0"><p className="text-white truncate max-w-[320px]">{p.title}{p.featured ? ' ★' : ''}</p><p className="text-[10px] text-[#6B7280]">{p.readMinutes} min read</p></div>
                    </div>
                  ) },
                  { key: 'category', label: 'Category', render: (p) => p.category?.name || '—' },
                  { key: 'status', label: 'Status', render: (p) => <Badge tone={p.status === 'published' ? 'green' : 'gray'}>{p.status}</Badge> },
                  { key: 'date', label: 'Updated', render: (p) => shortDate(p.updatedAt) },
                  { key: 'act', label: '', render: (p) => (
                    <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      {p.status === 'published' && SITE && <a href={`${SITE}/blog/${p.slug}`} target="_blank" rel="noreferrer" className="h-7 w-7 rounded-lg bg-[#303943] text-[#DDE3EC] flex items-center justify-center" title="Open on the site"><ExternalLink size={12} /></a>}
                      <Button size="sm" variant="secondary" onClick={() => setEditing(p._id)}><Pencil size={12} /></Button>
                      <Button size="sm" variant="danger" busy={busy === p._id} onClick={() => del(p)}><Trash2 size={12} /></Button>
                    </div>
                  ) }
                ]} />
            </Card>
          )}
          {posts.data && <Pager page={page} total={posts.data.total} limit={posts.data.limit} onPage={setPage} />}
        </>
      )}
      {editing && <PostEditor id={editing === 'new' ? null : editing} categories={cats.data || []} onClose={() => setEditing(null)} onSaved={() => { posts.reload(); cats.reload(); }} />}
    </Page>
  );
}
