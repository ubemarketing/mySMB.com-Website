import {defineType,defineField} from 'sanity';
export const legalPages = [
  {id:'legal-terms-and-conditions',title:'Terms and Conditions',pageId:'page-terms-and-conditions'},
  {id:'legal-privacy-policy',title:'Privacy Policy',pageId:'page-privacy-policy'},
  {id:'legal-terms-of-engagement',title:'Terms of Engagement',pageId:'page-legal-terms-of-engagement'}
];
export const legalContentBlock = defineType({name:'legalContentBlock',title:'Document paragraph or clause',type:'object',initialValue:{kind:'paragraph',indent:1},fields:[
  defineField({name:'kind',title:'Format',type:'string',options:{list:[{title:'Section heading',value:'heading'},{title:'Subsection heading',value:'subheading'},{title:'Paragraph',value:'paragraph'},{title:'Bullet point',value:'bullet'},{title:'Numbered list item',value:'numbered'},{title:'Lettered clause',value:'clause'}]},validation:R=>R.required()}),
  defineField({name:'indent',title:'Indentation level',type:'number',description:'The website automatically reduces indentation on phones.',options:{list:[{title:'No indent',value:0},{title:'Level 1',value:1},{title:'Level 2',value:2},{title:'Level 3',value:3}]},validation:R=>R.required().integer().min(0).max(3)}),
  defineField({name:'label',title:'Clause label',type:'string',description:'Keep the original label, such as (a) or (b).',hidden:({parent})=>parent?.kind!=='clause',validation:R=>R.custom((value,context)=>context.parent?.kind!=='clause'||/^\([a-zA-Z]\)$/.test(value||'')||'Enter a clause label such as (a).')}),
  defineField({name:'listGroup',type:'string',hidden:true,readOnly:true}),
  defineField({name:'body',title:'Text',type:'array',of:[{type:'block',styles:[{title:'Normal',value:'normal'}],lists:[],marks:{decorators:[{title:'Bold',value:'strong'},{title:'Italic',value:'em'},{title:'Underline',value:'underline'}],annotations:[{name:'link',title:'Link',type:'object',fields:[{name:'href',title:'Destination',type:'string',validation:R=>R.required().custom(v=>/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(v||'')&&!/[\u0000-\u0020\\]/.test(v||'')&&!String(v).startsWith('//')||'Use an https://, email or relative page link.')},{name:'ariaLabel',title:'Accessible link description',type:'string',description:'Optional: clarify a link for screen readers.'},{name:'openInNewTab',title:'Open in a new tab',type:'boolean',initialValue:false}]}]}}],validation:R=>R.required().min(1).max(1),description:'Use one paragraph per item. Shift+Enter inserts a line break. Select Format above to change the heading or list type.'})
],preview:{select:{kind:'kind',label:'label',body:'body',indent:'indent'},prepare:({kind,label,body,indent})=>({title:(label?label+' ':'')+(body?.[0]?.children?.map(x=>x.text||'').join('')||'New paragraph'),subtitle:`${kind||'paragraph'} · indent ${indent??0}`})}});
export const legalDocument = defineType({name:'legalDocument',title:'Legal document',type:'document',fields:[
  defineField({name:'title',title:'Document',type:'string',readOnly:true,validation:R=>R.required()}),
  defineField({name:'pageId',type:'string',readOnly:true,hidden:true,validation:R=>R.required()}),
  defineField({name:'content',title:'Document content',type:'array',of:[{type:'legalContentBlock'}],validation:R=>R.required().min(1),description:'Headings, paragraphs and clauses keep their structure. Reorder or add an item when necessary; preserve clause labels and cross-references.'}),
  defineField({name:'versionLines',title:'Version and effective date',type:'array',of:[{type:'string'}],validation:R=>R.required().min(1).max(3),description:'These lines appear at the bottom of the document. Do not change the date unless a new version has been approved.'})
],preview:{select:{title:'title',subtitle:'versionLines.0'}}});
