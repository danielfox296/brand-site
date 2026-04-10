/**
 * GA4 Form Submission Tracking for Entuned Contact Page
 * Fires a `form_submit_success` event when Formspree accepts a submission.
 * Needed because Formspree submits via AJAX and GA4 enhanced measurement
 * only catches traditional form POSTs that navigate.
 */
(function () {
  'use strict';

  var successEl = document.getElementById('form-success');
  if (!successEl) return; // not on contact page — bail

  // Method 1: MutationObserver watches for the success div becoming visible
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes') {
        var visible =
          successEl.style.display !== 'none' &&
          successEl.style.display !== '' &&
          !successEl.classList.contains('hidden');
        if (visible) {
          fireFormSubmitEvent();
          observer.disconnect();
        }
      }
    });
  });
  observer.observe(successEl, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Method 2: Intercept fetch as a backup trigger
  var originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function () {
      var args = arguments;
      var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
      if (url.indexOf('formspree.io') !== -1) {
        return originalFetch.apply(this, args).then(function (response) {
          if (response.ok) fireFormSubmitEvent();
          return response;
        });
      }
      return originalFetch.apply(this, args);
    };
  }

  var hasFired = false;
  function fireFormSubmitEvent() {
    if (hasFired) return;
    hasFired = true;
    if (typeof gtag === 'function') {
      gtag('event', 'form_submit_success', {
        event_category: 'engagement',
        event_label: 'contact_form',
        page_location: window.location.href,
        value: 1
      });
      console.log('[Entuned GA4] form_submit_success event fired');
    } else {
      console.warn('[Entuned GA4] gtag not found — event not sent');
    }
  }
})();
