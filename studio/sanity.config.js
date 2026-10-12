import {defineConfig, defineType, defineField} from 'sanity';
import {structureTool} from 'sanity/structure';
import pages from './pages.json';
import {legalPages,legalDocument,legalContentBlock} from './legal-schema.js';
import {LegalPreview} from './LegalPreview.jsx';
import {sectionTypes,customPage,reusableSection,isSlugUnique} from './page-builder.js';

const fixedArray={disableActions:['add','addBefore','addAfter','remove','duplicate','copy']};
const field=defineField;
const urlRule=Rule=>Rule.custom(value=>!value||/^(https?:\/\/|mailto:|tel:|#|[a-zA-Z0-9_./-])/.test(value)&&!/^\s*(javascript|data|vbscript):/i.test(value)||'Use a website URL, email, phone number, or a relative page link.');
const contentItem=defineType({name:'contentItem',title:'Content',type:'object',fields:[
  field({name:'binding',type:'string',hidden:true,readOnly:true}),
  field({name:'kind',type:'string',hidden:true,readOnly:true}),
  field({name:'label',type:'string',hidden:true,readOnly:true}),
  field({name:'text',title:'Text',type:'text',rows:3,hidden:({parent})=>parent?.kind!=='text'}),
  field({name:'url',title:'Destination',type:'string',description:'A full https:// address, a page filename, or a #section link.',validation:urlRule,hidden:({parent})=>parent?.kind!=='link'}),
  field({name:'image',title:'Replace image',type:'image',options:{hotspot:true},description:'Upload a replacement. Remove it to return to the original image.',hidden:({parent})=>parent?.kind!=='image'}),
  field({name:'alt',title:'Image description',type:'string',description:'Describe the image for people using screen readers.',hidden:({parent})=>parent?.kind!=='image'}),
  field({name:'originalPath',type:'string',hidden:true,readOnly:true})
],preview:{select:{title:'label',kind:'kind',text:'text',image:'image'},prepare:({title,kind,text,image})=>({title,subtitle:kind==='text'?text:kind==='image'?'Image':'Button / link',media:image})}});
const pageSection=defineType({name:'pageSection',title:'Page section',type:'object',fields:[
  field({name:'title',type:'string',readOnly:true}),
  field({name:'items',title:'Content in this section',type:'array',of:[{type:'contentItem'}],options:fixedArray})
],preview:{select:{title:'title'}}});
const websitePage=defineType({name:'websitePage',title:'Website page',type:'document',fields:[
  field({name:'title',title:'Page name',type:'string',readOnly:true}),
  field({name:'filename',type:'string',hidden:true,readOnly:true}),
  field({name:'seoTitle',title:'Browser / search title',type:'string'}),
  field({name:'seoDescription',title:'Search description',type:'text',rows:3}),
  field({name:'sections',title:'Page sections',type:'array',of:[{type:'pageSection'}],options:fixedArray,description:'Open a section to edit its text, links and images. Layout follows your existing website.'})
]});
const tones=Array.from({length:11},(_,i)=>({title:'Colour '+(i+1),value:'t'+(i+1)}));
const common=[
  field({name:'title',title:'Title',type:'string',validation:Rule=>Rule.required()}),
  field({name:'slug',title:'Page address',type:'slug',options:{source:'title',maxLength:90,isUnique:isSlugUnique},validation:Rule=>Rule.required()}),
  field({name:'category',title:'Category',type:'string'}),
  field({name:'excerpt',title:'Short description',type:'text',rows:4,validation:Rule=>Rule.required()}),
  field({name:'image',title:'Cover image',type:'image',options:{hotspot:true},fields:[{name:'alt',title:'Image description',type:'string'}]}),
  field({name:'tone',title:'Card colour',type:'string',options:{list:tones}}),
  field({name:'sortOrder',title:'Display order',type:'number',description:'Lower numbers appear first.',initialValue:0}),
  field({name:'enabled',title:'Show on the website',type:'boolean',initialValue:true})
];
const post=defineType({name:'post',title:'Blog / news article',type:'document',initialValue:{enabled:true,tone:'t1',sortOrder:0},fields:[...common,
  field({name:'externalUrl',title:'Link to an existing article',type:'url',description:'Optional. If set, the card links here instead of the article page.',validation:Rule=>Rule.uri({scheme:['http','https']})}),
  field({name:'body',title:'Article',type:'array',of:[{type:'block'}],description:'Write the full article here, or link to an existing article above.'})
],preview:{select:{title:'title',subtitle:'category',media:'image'}}});
const event=defineType({name:'event',title:'Event / webinar',type:'document',initialValue:{enabled:true,tone:'t2',sortOrder:0,format:'Webinar · Online'},fields:[...common,
  field({name:'format',title:'Format / location',type:'string'}),
  field({name:'startsAt',title:'Start date and time',type:'datetime'}),
  field({name:'registrationUrl',title:'Registration link',type:'url',validation:Rule=>Rule.uri({scheme:['http','https']})}),
  field({name:'body',title:'Event details',type:'array',of:[{type:'block'}]})
],preview:{select:{title:'title',subtitle:'format',media:'image'}}});
const websiteSettings=defineType({name:'websiteSettings',title:'Website settings',type:'document',fields:[
  field({name:'title',type:'string',hidden:true}),
  field({name:'collectionsEnabled',title:'Use CMS blogs and events',type:'boolean',description:'On: published CMS entries populate the listings. Off: use the original website listings.',initialValue:true})
]});
const fixedTypes=new Set(['websitePage','websiteSettings','legalDocument']);
export default defineConfig({name:'mysmb',title:'mySMB.com Website',projectId:'h7kdscx8',dataset:'production',plugins:[structureTool({defaultDocumentNode:(S,{schemaType})=>schemaType==='legalDocument'?S.document().views([S.view.form(),S.view.component(LegalPreview).title('Preview')]):S.document().views([S.view.form()]),structure:S=>S.list().title('mySMB.com').items([
  S.listItem().title('Website pages').child(S.list().title('Website pages').items(pages.map(p=>S.listItem().title(p.title).child(S.document().schemaType('websitePage').documentId(p.id))))),
  S.listItem().title('Legal documents').child(S.list().title('Legal documents').items(legalPages.map(p=>S.listItem().title(p.title).child(S.document().schemaType('legalDocument').documentId(p.id).views([S.view.form(),S.view.component(LegalPreview).title('Preview')]))))),
  S.documentTypeListItem('post').title('Blogs & news').child(S.documentList().title('Blogs & news').filter('_type == "post" && migrationRetired != true')),
  S.documentTypeListItem('event').title('Events & webinars').child(S.documentList().title('Events & webinars').filter('_type == "event" && migrationRetired != true')),
  S.documentTypeListItem('customPage').title('Create pages').child(S.documentList().title('Create pages').filter('_type == "customPage" && migrationRetired != true')),
  S.documentTypeListItem('reusableSection').title('Reusable sections').child(S.documentList().title('Reusable sections').filter('_type == "reusableSection" && migrationRetired != true')),
  S.listItem().title('Website settings').child(S.document().schemaType('websiteSettings').documentId('websiteSettings'))
])})],schema:{types:[legalDocument,legalContentBlock,contentItem,pageSection,websitePage,post,event,websiteSettings,customPage,reusableSection,...sectionTypes]},document:{
  newDocumentOptions:(options)=>options.filter(x=>!fixedTypes.has(x.templateId)),
  actions:(actions,context)=>fixedTypes.has(context.schemaType)?actions.filter(a=>!['delete','duplicate','unpublish'].includes(a.action)):actions
}});
