// This serializer only emits known tags, escaped text and validated links.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function legalLink(value) {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u0020\\]/.test(value) || value.startsWith('//')) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value)) return value;
  if (/^[a-z0-9][a-z0-9_.\/-]*(?:[?#][^\s]*)?$/i.test(value) && !value.includes(':')) return value;
  return null;
}
function richText(body) {
  if (!Array.isArray(body) || !body.length) throw Error('Text is required');
  return body.map(block => {
    if (block._type !== 'block' || !Array.isArray(block.children)) throw Error('Invalid rich text');
    return block.children.map(span => {
      if (span._type !== 'span' || typeof span.text !== 'string') throw Error('Invalid span');
      let html = escape(span.text).replace(/\n/g, '<br>');
      for (const mark of span.marks || []) {
        const tag = {strong:'strong',em:'em',underline:'u'}[mark];
        if (tag) html = `<${tag}>${html}</${tag}>`;
        else {
          const definition = (block.markDefs || []).find(x => x._key === mark && x._type === 'link');
          const href = legalLink(definition?.href);
          if (href) html = `<a href="${escape(href)}"${definition.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''}${definition.ariaLabel ? ` aria-label="${escape(definition.ariaLabel)}"` : ''}>${html}</a>`;
        }
      }
      return html;
    }).join('');
  }).join('<br><br>');
}
export function legalDocumentToHTML(doc) {
  if (!doc || !Array.isArray(doc.content) || !doc.content.length || !Array.isArray(doc.versionLines) || !doc.versionLines.length || doc.versionLines.some(x => typeof x !== 'string' || !x.trim())) throw Error('Incomplete legal document');
  let html = '', list = null;
  function endList() { if (list) { html += `</${list.tag}>`; list = null; } }
  for (const block of doc.content) {
    if (block._type !== 'legalContentBlock' || !Number.isInteger(block.indent) || block.indent < 0 || block.indent > 3) throw Error('Invalid legal block');
    const copy = richText(block.body);
    const indent = block.indent ? `clause-indent-${block.indent}` : '';
    if (block.kind === 'bullet' || block.kind === 'numbered') {
      const tag = block.kind === 'bullet' ? 'ul' : 'ol';
      const key = `${tag}:${block.indent}:${block.listGroup || ''}`;
      if (list?.key !== key) { endList(); html += `<${tag}>`; list = {tag,key}; }
      html += `<li${indent ? ` class="${indent}"` : ''}><p>${copy}</p></li>`;
      continue;
    }
    endList();
    if (block.kind === 'clause') {
      if (!/^\([a-zA-Z]\)$/.test(block.label || '')) throw Error('A clause label is required');
      html += `<p class="${indent} labelled-clause"><span class="clause-label">${escape(block.label)}</span> <span>${copy}</span></p>`;
    } else {
      const tag = {heading:'h2',subheading:'h3',paragraph:'p'}[block.kind];
      if (!tag) throw Error('Unknown block kind');
      html += `<${tag}${indent ? ` class="${indent}"` : ''}>${copy}</${tag}>`;
    }
  }
  endList();
  return html + `<p class="legal-version">${doc.versionLines.map(escape).join('<br>')}</p>`;
}
