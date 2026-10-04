(() => {
  'use strict';
  const config=window.MYSMB_CMS;
  if(!config?.projectId)return;
  const imageProjection='image{...,"url":asset->url}';
  const pageId=document.body.dataset.cmsPage;
  const slug=new URLSearchParams(location.search).get('slug')||location.pathname.match(/^\/pages\/([a-z0-9-]+)\/?$/)?.[1];
  const detailType=document.body.dataset.cmsDetail;
  const query=`{
    "page": *[_type == "websitePage" && _id == $pageId][0]{seoTitle,seoDescription,sections[]{items[]{binding,kind,text,url,alt,originalPath,${imageProjection}}}},
    "settings": *[_id == "websiteSettings"][0]{collectionsEnabled},
    "posts": *[_type == "post" && enabled != false] | order(sortOrder asc, _createdAt desc){title,slug,category,excerpt,tone,externalUrl,body,${imageProjection}},
    "events": *[_type == "event" && enabled != false] | order(sortOrder asc, _createdAt desc){title,slug,category,excerpt,tone,format,startsAt,registrationUrl,body,${imageProjection}},
    "newPages": *[_type == "customPage"] | order(title asc){title,slug,seoDescription,showInNavigation,navigationLabel,"sections":sections[]{...,${imageProjection},_type == "reference" => {"shared": @->section[0]{...,${imageProjection}}}}}
  }`;
  const endpoint=new URL(`https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`);
  endpoint.searchParams.set('query',query);
  endpoint.searchParams.set('$pageId',JSON.stringify(pageId||''));
  endpoint.searchParams.set('perspective','published');
  function safeUrl(value, image=false){
    if(typeof value!=='string'||!value.trim())return null;
    try{const u=new URL(value,location.href);return (image?['https:','http:']:['https:','http:','mailto:','tel:']).includes(u.protocol)?value:null;}catch{return null;}
  }
  function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n;}
  function setMeta(selector,value){const n=document.querySelector(selector);if(n&&typeof value==='string')n.setAttribute('content',value);}
  function setImage(n,image,alt){
    const url=safeUrl(image?.url,true);if(url)n.src=url;
    if(typeof alt==='string')n.alt=alt;
  }
  function applyPage(page){
    if(!page)return;
    if(page.seoTitle){document.title=page.seoTitle;setMeta('meta[property="og:title"]',page.seoTitle);setMeta('meta[name="twitter:title"]',page.seoTitle);}
    if(typeof page.seoDescription==='string'){setMeta('meta[name="description"]',page.seoDescription);setMeta('meta[property="og:description"]',page.seoDescription);setMeta('meta[name="twitter:description"]',page.seoDescription);}
    for(const section of page.sections||[])for(const item of section.items||[]){
      if(!/^content\d+$/.test(item.binding))continue;
      if(item.kind==='text'&&typeof item.text==='string')document.querySelectorAll(`[data-cms-text="${item.binding}"]`).forEach(n=>n.textContent=item.text);
      if(item.kind==='link'){const url=safeUrl(item.url);if(url)document.querySelectorAll(`[data-cms-link="${item.binding}"]`).forEach(n=>n.href=url);}
      if(item.kind==='image')document.querySelectorAll(`[data-cms-image="${item.binding}"]`).forEach(n=>setImage(n,item.image?.url?item.image:{url:item.originalPath},item.alt));
    }
  }
  function renderBody(blocks,container){
    let list=null;
    for(const block of blocks||[]){
      if(block._type!=='block')continue;
      const tag=['h2','h3','h4','blockquote'].includes(block.style)?block.style:'p';
      const node=el(block.listItem?'li':tag);
      for(const child of block.children||[]){
        if(child._type!=='span')continue;
        let span=document.createTextNode(child.text||'');
        for(const mark of child.marks||[]){
          let wrapper;
          if(mark==='strong')wrapper=el('strong');else if(mark==='em')wrapper=el('em');else if(mark==='underline')wrapper=el('u');else if(mark==='code')wrapper=el('code');
          else {const def=(block.markDefs||[]).find(x=>x._key===mark);const href=safeUrl(def?.href);if(href){wrapper=el('a');wrapper.href=href;}}
          if(wrapper){wrapper.append(span);span=wrapper;}
        }
        node.append(span);
      }
      if(block.listItem){const type=block.listItem==='number'?'ol':'ul';if(!list||list.tagName.toLowerCase()!==type){list=el(type);container.append(list);}list.append(node);}
      else{list=null;container.append(node);}
    }
  }
  function renderCards(items,kind){
    const grid=document.querySelector(`[data-cms-collection="${kind}"]`);if(!grid)return;
    const blog=kind==='posts';const prefix=blog?'blog':'event';const frag=document.createDocumentFragment();
    for(const item of items||[]){
      const destination=blog?(safeUrl(item.externalUrl)||(item.body?.length&&item.slug?.current?`article.html?slug=${encodeURIComponent(item.slug.current)}`:null)):(safeUrl(item.registrationUrl)||(item.body?.length&&item.slug?.current?`event.html?slug=${encodeURIComponent(item.slug.current)}`:null));
      const card=el(destination?'a':'div',`${prefix}-card`);if(destination){card.href=destination;card.style.color='inherit';card.style.textDecoration='none';}
      const tone=/^t([1-9]|10|11)$/.test(item.tone)?item.tone:'t1';
      const thumb=el('div',`${prefix}-thumb ${tone}`);
      const imgUrl=safeUrl(item.image?.url,true);
      if(imgUrl){const img=el('img');img.src=imgUrl;img.alt=item.image.alt||'';img.loading='lazy';img.style.cssText='width:100%;height:180px;object-fit:cover';thumb.style.padding='0';thumb.append(img);}else thumb.append(el('span','',item.category||''));
      const body=el('div',`${prefix}-body`);
      if(!blog){body.append(el('span','event-format',item.format||''));if(item.startsAt){const time=el('time','event-format',new Intl.DateTimeFormat('en-AU',{dateStyle:'medium',timeStyle:'short',timeZone:'Australia/Sydney'}).format(new Date(item.startsAt)));time.dateTime=item.startsAt;body.append(time);}}
      body.append(el('h3','',item.title||''),el('p','',item.excerpt||''));
      card.append(thumb,body);frag.append(card);
    }
    if(!frag.childNodes.length)frag.append(el('p','',blog?'New articles will be added here soon.':'New events will be added here soon.'));
    grid.replaceChildren(frag);
  }
  function renderDetail(data){
    if(!detailType)return;
    const item=(detailType==='post'?data.posts:data.events)?.find(x=>x.slug?.current===slug);
    const container=document.querySelector('[data-cms-detail-body]');
    const title=document.querySelector('[data-cms-detail-title]');
    if(!item){title.textContent=detailType==='post'?'Article unavailable':'Event unavailable';container.textContent='This page may have moved or is not published yet.';return;}
    document.title=item.title+' | mySMB.com';title.textContent=item.title;
    document.querySelector('[data-cms-detail-excerpt]').textContent=item.excerpt||'';
    setMeta('meta[name="description"]',item.excerpt||'');
    const cover=document.querySelector('[data-cms-detail-image]');if(item.image?.url){setImage(cover,item.image,item.image.alt||'');cover.hidden=false;}
    container.replaceChildren();renderBody(item.body,container);
  }
  const pageUrl=slug=>'page.html?slug='+encodeURIComponent(slug);
  function renderNavigation(pages){
    const nav=document.querySelector('.site-nav');if(!nav)return;
    const visible=(pages||[]).filter(p=>p.showInNavigation&&p.slug?.current);
    if(!visible.length)return;
    const group=el('div','has-dropdown');const toggle=el('button','dropdown-toggle','More');toggle.type='button';toggle.setAttribute('aria-haspopup','true');toggle.setAttribute('aria-expanded','false');
    const menu=el('div','dropdown-menu');
    for(const p of visible){const link=el('a','',p.navigationLabel||p.title);link.href=pageUrl(p.slug.current);menu.append(link);}
    toggle.addEventListener('click',()=>{const open=group.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
    group.addEventListener('keydown',event=>{if(event.key==='Escape'){group.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();}});
    menu.addEventListener('click',()=>{group.classList.remove('open');nav.classList.remove('open');document.querySelector('.menu-button')?.setAttribute('aria-expanded','false');});
    group.append(toggle,menu);nav.insertBefore(group,nav.querySelector('.site-nav-cta'));
  }
  function addButton(section,container){const href=safeUrl(section.buttonUrl);if(section.buttonLabel&&href){const link=el('a','button button-dark',section.buttonLabel);link.href=href;container.append(link);}}
  function renderSection(section,index){
    const node=el('section','cms-section page-width');
    if(section._type==='heroSection'){
      node.className='page-hero cms-hero';if(section.label)node.append(el('p','label',section.label));node.append(el(index===0?'h1':'h2','',section.heading));if(section.description)node.append(el('p','page-hero-lede',section.description));addButton(section,node);
    }else if(section._type==='textSection'){
      if(section.heading)node.append(el('h2','',section.heading));const copy=el('div','cms-prose');renderBody(section.body,copy);node.append(copy);
    }else if(section._type==='imageSection'){
      const row=el('div','cms-split'+(section.imageSide==='left'?' cms-image-left':''));const copy=el('div','cms-prose');if(section.heading)copy.append(el('h2','',section.heading));renderBody(section.body,copy);addButton(section,copy);row.append(copy);
      const url=safeUrl(section.image?.url,true);if(url){const img=el('img','cms-section-image');setImage(img,section.image,section.image.alt||'');img.loading='lazy';row.append(img);}node.append(row);
    }else if(section._type==='featureSection'){
      if(section.heading)node.append(el('h2','',section.heading));const grid=el('div','cms-feature-grid');for(const f of section.features||[]){const article=el('article','cms-feature');article.append(el('h3','',f.title),el('p','',f.description));grid.append(article);}node.append(grid);
    }else if(section._type==='ctaSection'){
      node.className='final-cta';const inner=el('div','page-width cta-grid');inner.append(el('h2','',section.heading));const copy=el('div');if(section.description)copy.append(el('p','',section.description));addButton(section,copy);inner.append(copy);node.append(inner);
    }else return null;
    return node;
  }
  function renderCustomPage(pages){
    if(!document.body.hasAttribute('data-cms-custom'))return;
    const main=document.querySelector('main');const page=(pages||[]).find(p=>p.slug?.current===slug);
    if(!page){main.replaceChildren(el('section','page-hero','This page is not published or the address has changed.'));document.title='Page unavailable | mySMB.com';return;}
    document.title=page.title+' | mySMB.com';setMeta('meta[name="description"]',page.seoDescription||'');
    const sections=(page.sections||[]).map(s=>s._type==='reference'?s.shared:s).filter(Boolean);
    const frag=document.createDocumentFragment();
    if(sections[0]?._type!=='heroSection'){const hero=el('section','page-hero');hero.append(el('h1','',page.title));frag.append(hero);}
    sections.forEach((s,i)=>{const node=renderSection(s,i);if(node)frag.append(node);});main.replaceChildren(frag);
  }
  async function load(){
    try{
      const response=await fetch(endpoint,{credentials:'omit',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error(`CMS request failed (${response.status})`);
      const {result}=await response.json();if(!result)throw Error('CMS returned no content');
      applyPage(result.page);
      if(result.settings?.collectionsEnabled){renderCards(result.posts,'posts');renderCards(result.events,'events');}
      renderDetail(result);renderNavigation(result.newPages);renderCustomPage(result.newPages);document.documentElement.dataset.cmsStatus='connected';
      document.dispatchEvent(new CustomEvent('cms:loaded'));
    }catch(error){document.documentElement.dataset.cmsStatus='offline';console.warn('mySMB CMS: showing the saved website content.',error.message);}
  }
  load();
})();
