import React,{useState} from 'react';
import {legalDocumentToHTML} from '../legal-renderer.js';
export function LegalPreview({document}) {
  const [width,setWidth] = useState(390);
  const doc = document.displayed;
  let html;
  try { html = legalDocumentToHTML(doc); } catch (error) { return <p style={{padding:24}}>Complete the document fields to preview it: {error.message}</p>; }
  const engagement = doc.pageId === 'page-legal-terms-of-engagement';
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><base href="https://mysmb.com/"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://mysmb.com/styles.css">${engagement?'<link rel="stylesheet" href="https://mysmb.com/legal.css">':''}<link rel="stylesheet" href="https://mysmb.com/legal-format.css">${engagement?'<link rel="stylesheet" href="https://mysmb.com/engagement-format.css">':''}<style>.legal-source a{pointer-events:none}body{background:white}</style></head><body><article class="legal-prose legal-source page-width${engagement?' legal-terms-copy':''}">${html}</article></body></html>`;
  return <div style={{padding:16,height:'100%',overflow:'auto'}}><label>Preview width <select value={width} onChange={event=>setWidth(Number(event.target.value))}><option value={320}>Small phone — 320px</option><option value={390}>Phone — 390px</option><option value={768}>Tablet — 768px</option><option value={960}>Desktop — 960px</option></select></label><p>Preview shows your current edits. Publishing this document updates the website once the reviewed CMS connection is live.</p><iframe title="Legal document preview" sandbox="" srcDoc={srcDoc} style={{display:'block',marginTop:16,width,height:750,border:'1px solid #ddd',background:'white'}} /></div>;
}
