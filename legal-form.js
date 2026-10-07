/* Dynamics renders asynchronously; keep its fields and submission flow intact. */
(() => {
  const host = document.querySelector('.legal-original-form');
  if (!host) return;

  const updateMobile = () => {
    const mobile = host.querySelector('input[name="mobilephone"]');
    if (!mobile) return;
    mobile.placeholder = '+61400000000';
    mobile.setAttribute('inputmode', 'tel');
    mobile.setAttribute('autocomplete', 'tel');

    const hintId = 'legal-mobile-hint';
    if (!host.querySelector('#' + hintId)) {
      const hint = document.createElement('p');
      hint.id = hintId;
      hint.className = 'legal-mobile-hint';
      hint.textContent = 'Start with +61, for example +61400000000.';
      mobile.closest('.phoneFormFieldBlock').append(hint);
    }
    const descriptions = new Set((mobile.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    descriptions.add(hintId);
    mobile.setAttribute('aria-describedby', [...descriptions].join(' '));
  };

  new MutationObserver(updateMobile).observe(host, { childList: true, subtree: true });
  updateMobile();
})();
