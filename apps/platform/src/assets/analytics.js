// Queue events immediately, but keep analytics layout reads off the first paint.
window.plausible =
  window.plausible ||
  ((...args) => {
    window.plausible.q = window.plausible.q || [];
    window.plausible.q.push(args);
  });

function loadAnalytics() {
  const script = document.createElement('script');
  script.async = true;
  script.dataset.domain = 'zoff.me';
  script.src =
    'https://analytics.zoff.me/js/script.outbound-links.tagged-events.js';
  document.head.append(script);
}

function scheduleAnalytics() {
  requestAnimationFrame(() => requestAnimationFrame(loadAnalytics));
}

if (document.readyState === 'complete') {
  scheduleAnalytics();
} else {
  window.addEventListener('load', scheduleAnalytics, { once: true });
}
