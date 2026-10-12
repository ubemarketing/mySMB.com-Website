import {legalDocumentToHTML} from './legal-renderer.js';

const ids = {'page-terms-and-conditions':'legal-terms-and-conditions','page-privacy-policy':'legal-privacy-policy','page-legal-terms-of-engagement':'legal-terms-of-engagement'};
const pageId = document.body.dataset.cmsPage;
const container = document.querySelector('.legal-source');
const config = window.MYSMB_CMS;
if (ids[pageId] && container && config?.projectId) {
  const endpoint = new URL(`https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`);
  endpoint.searchParams.set('query','*[_type == "legalDocument" && _id == $id && pageId == $pageId][0]{content,versionLines,versionBold}');
  endpoint.searchParams.set('$id',JSON.stringify(ids[pageId]));
  endpoint.searchParams.set('$pageId',JSON.stringify(pageId));
  endpoint.searchParams.set('perspective','published');
  try {
    const response = await fetch(endpoint,{credentials:'omit',signal:AbortSignal.timeout(10000)});
    if (!response.ok) throw Error('Legal CMS unavailable');
    const {result} = await response.json();
    if (result) {
      const html = legalDocumentToHTML(result); // Validate everything before replacing the saved body.
      container.innerHTML = html;
      container.dataset.legalCmsStatus = 'connected';
    } else container.dataset.legalCmsStatus = 'saved';
  } catch (error) {
    container.dataset.legalCmsStatus = 'saved';
    console.warn('Legal CMS: retaining the saved approved document.',error.message);
  }
}
