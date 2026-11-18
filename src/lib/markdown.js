// Tiny, safe Markdown for blog articles. All text is HTML-escaped first, so an
// article can never inject scripts; only the formatting below becomes HTML.
// Supports: ## / ### headings, paragraphs, **bold**, *italic*, `code`,
// [links](https://...), ![images](https://...), - / 1. lists, > quotes, --- rules.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const safeUrl = (u) => (/^(https?:\/\/|\/)/i.test(u) ? u : '#');

const inline = (s) => esc(s)
  .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" />`)
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');

export function renderMarkdown(src) {
  const lines = String(src || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = null; // { tag, items }
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();
    let m;
    if (!t) { flushPara(); flushList(); continue; }
    if ((m = t.match(/^(#{1,3})\s+(.*)$/))) { flushPara(); flushList(); const lvl = Math.min(4, m[1].length + 1); out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`); continue; }
    if (/^(-{3,}|\*{3,})$/.test(t)) { flushPara(); flushList(); out.push('<hr />'); continue; }
    if ((m = t.match(/^>\s?(.*)$/))) { flushPara(); flushList(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); continue; }
    if ((m = t.match(/^[-*]\s+(.*)$/))) { flushPara(); if (list?.tag !== 'ul') { flushList(); list = { tag: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = t.match(/^\d+[.)]\s+(.*)$/))) { flushPara(); if (list?.tag !== 'ol') { flushList(); list = { tag: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    flushList();
    para.push(t);
  }
  flushPara();
  flushList();
  return out.join('\n');
}
