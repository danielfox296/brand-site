/**
 * GA4 CTA Click Tracking for Entuned
 *
 * Fires GA4 events when visitors click commercial-intent CTAs:
 *   - cta_stripe_checkout  → clicks that open a Stripe Payment Link
 *   - cta_pilot_inquiry    → clicks that route to /contact.html?topic=pilot
 *
 * Uses a single delegated listener on document so it catches CTAs in the
 * hero, plan cards, and final-CTA section without per-element wiring.
 */
(function () {
  'use strict';

  function fireEvent(name, label) {
    if (typeof gtag !== 'function') {
      console.warn('[Entuned GA4] gtag not found — ' + name + ' not sent');
      return;
    }
    gtag('event', name, {
      event_category: 'conversion',
      event_label: label,
      page_location: window.location.href,
      page_path: window.location.pathname,
      value: 1
    });
    console.log('[Entuned GA4] ' + name + ' fired (' + label + ')');
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || !a.href) return;

    var href = a.href;

    // Stripe Payment Link click
    if (href.indexOf('buy.stripe.com/') !== -1) {
      fireEvent('cta_stripe_checkout', a.textContent.trim().slice(0, 80));
      return;
    }

    // Pilot inquiry click — contact page with topic=pilot
    if (href.indexOf('contact.html?topic=pilot') !== -1 ||
        href.indexOf('contact.html/?topic=pilot') !== -1) {
      fireEvent('cta_pilot_inquiry', a.textContent.trim().slice(0, 80));
      return;
    }
  }, true);
})();
