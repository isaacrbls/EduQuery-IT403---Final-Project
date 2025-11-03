// Centralized JS for accounts pages (SignUp/SignIn)
// - Handles Terms & Conditions slide-in panel
// - Keep code resilient if elements are not present on a page

(function () {
  // Terms & Conditions panel logic
  const openLink = document.getElementById('open-terms');
  const panel = document.getElementById('tc-panel');
  const backdrop = document.getElementById('tc-backdrop');
  const closeBtn = document.getElementById('tc-close');

  if (openLink && panel && backdrop && closeBtn) {
    function openPanel() {
      document.body.classList.add('tc-open');
      panel.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');
      // Accessibility: focus the close button
      try { closeBtn.focus({ preventScroll: true }); } catch (_) { closeBtn.focus(); }
    }

    function closePanel() {
      document.body.classList.remove('tc-open');
      panel.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      // Return focus to the opener
      try { openLink.focus({ preventScroll: true }); } catch (_) { openLink.focus(); }
    }

    openLink.addEventListener('click', (e) => { e.preventDefault(); openPanel(); });
    backdrop.addEventListener('click', closePanel);
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('tc-open')) {
        closePanel();
      }
    });
  }
})();
