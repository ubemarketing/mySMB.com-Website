import {defineType,defineField} from 'sanity';
const f=defineField;
export async function isSlugUnique(slug,{document,getClient}){
 const id=document?._id?.replace(/^drafts\./,'');
 return await getClient({apiVersion:'2026-10-04'}).fetch('count(*[_type==$type && migrationRetired != true && slug.current==$slug && !(_id in [$id,$draft])]) == 0',{slug,id,draft:'drafts.'+id,type:document?._type});
}
const rich={name:'body',title:'Text',type:'array',of:[{type:'block'}]};
const linkFields=[f({name:'buttonLabel',title:'Button text',type:'string'}),f({name:'buttonUrl',title:'Button link',type:'string',validation:Rule=>Rule.custom(v=>!v||(!/^[a-z]+:/i.test(v)||/^https?:/i.test(v))?true:'Use an https:// URL or a relative page address.')})];
const imageField=f({name:'image',title:'Image',type:'image',options:{hotspot:true},fields:[{name:'alt',title:'Image description',type:'string'}]});
const preview={select:{title:'heading'},prepare:({title})=>({title:title||'Section'})};
export const sectionTypes=[
 defineType({name:'heroSection',title:'Hero / introduction',type:'object',fields:[f({name:'label',title:'Small label',type:'string'}),f({name:'heading',title:'Heading',type:'string',validation:R=>R.required()}),f({name:'description',title:'Introduction',type:'text',rows:3}),...linkFields],preview}),
 defineType({name:'textSection',title:'Text section',type:'object',fields:[f({name:'heading',title:'Heading',type:'string'}),f(rich)],preview}),
 defineType({name:'imageSection',title:'Image and text',type:'object',fields:[f({name:'heading',title:'Heading',type:'string'}),imageField,f(rich),f({name:'imageSide',title:'Image position',type:'string',initialValue:'right',options:{list:[{title:'Left',value:'left'},{title:'Right',value:'right'}]}}),...linkFields],preview}),
 defineType({name:'featureSection',title:'Features / benefits',type:'object',fields:[f({name:'heading',title:'Heading',type:'string'}),f({name:'features',title:'Features',type:'array',of:[{type:'object',name:'feature',fields:[{name:'title',title:'Title',type:'string'},{name:'description',title:'Description',type:'text',rows:3}],preview:{select:{title:'title'}}}]})],preview}),
 defineType({name:'ctaSection',title:'Call to action',type:'object',fields:[f({name:'heading',title:'Heading',type:'string'}),f({name:'description',title:'Description',type:'text',rows:3}),...linkFields],preview})
];
const sectionOptions=sectionTypes.map(t=>({type:t.name}));
export const reusableSection=defineType({name:'reusableSection',title:'Reusable section',type:'document',fields:[f({name:'title',title:'Section name',type:'string',validation:R=>R.required()}),f({name:'section',title:'Section content',type:'array',of:sectionOptions,validation:R=>R.required().length(1),description:'Create one section, then reuse it on any new page. Publishing changes updates every page that uses it.'})]});
export const customPage=defineType({name:'customPage',title:'New website page',type:'document',fields:[
 f({name:'title',title:'Page name',type:'string',validation:R=>R.required()}),
 f({name:'slug',title:'Page address',type:'slug',options:{source:'title',maxLength:90,isUnique:isSlugUnique},validation:R=>R.required().custom(v=>!v?.current||/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.current)||'Use lowercase words separated by hyphens, for example our-services.') }),
 f({name:'showInNavigation',title:'Show in website menu',type:'boolean',initialValue:false}),
 f({name:'navigationLabel',title:'Menu label',type:'string',description:'Optional. Uses the page name if left blank.'}),
 f({name:'seoDescription',title:'Search description',type:'text',rows:3}),
 f({name:'sections',title:'Page sections',type:'array',of:[...sectionOptions,{type:'reference',title:'Saved reusable section',to:[{type:'reusableSection'}],options:{filter:'migrationRetired != true'}}],validation:R=>R.required().min(1),description:'Add and reorder sections, or select a saved reusable section.'})
],initialValue:{showInNavigation:false},preview:{select:{title:'title',subtitle:'slug.current'}}});
