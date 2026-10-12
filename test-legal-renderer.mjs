import fs from 'node:fs';
import assert from 'node:assert/strict';
import {legalDocumentToHTML,legalLink} from './legal-renderer.js';
const docs=fs.readFileSync('studio/legal-documents.ndjson','utf8').trim().split('\n').map(JSON.parse);
for(const doc of docs){
 const html=legalDocumentToHTML(doc);
 assert.equal((html.match(/<h2\b/g)||[]).length,doc.content.filter(x=>x.kind==='heading').length);
 assert.equal((html.match(/<li\b/g)||[]).length,doc.content.filter(x=>['bullet','numbered'].includes(x.kind)).length);
 assert.equal((html.match(/class="clause-label"/g)||[]).length,doc.content.filter(x=>x.kind==='clause').length);
 assert.throws(()=>legalDocumentToHTML({...doc,content:[{...doc.content[0],kind:'invalid'}]}));
}
for(const href of ['javascript:alert(1)','data:text/html,test','//evil.test','https://ok.test\\@evil.test','https://ok.test\n'])assert.equal(legalLink(href),null);
const test={content:[{_type:'legalContentBlock',kind:'paragraph',indent:0,body:[{_type:'block',children:[{_type:'span',text:'<img src=x onerror=alert(1)>',marks:['x']}],markDefs:[{_key:'x',_type:'link',href:'javascript:alert(1)'}]}]}],versionLines:['Date']};
assert(!legalDocumentToHTML(test).includes('<img'));
assert(!legalDocumentToHTML(test).includes('<a'));
console.log('Renderer passed: all documents, block structure, invalid content and unsafe links.');
