(() => {
  'use strict';
  const email = 'omjadon242@gmail.com';
  const themeButton = document.querySelector('#theme-toggle');
  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101510' : '#f3f2e9';
  };
  try { const saved = localStorage.getItem('om-portfolio-theme'); if (saved === 'light' || saved === 'dark') setTheme(saved); } catch { /* The portfolio works without browser storage. */ }
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('om-portfolio-theme', next); } catch { /* Optional preference only. */ }
  });
  const filters = document.querySelector('#project-filters');
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const selected = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    document.querySelectorAll('.project').forEach(project => {
      project.hidden = selected !== 'all' && !project.dataset.tags.split(' ').includes(selected);
      if (!project.hidden) visible++;
    });
    document.querySelector('#filter-status').textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown.`;
  });
  const service = document.querySelector('#service');
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    service.value = link.dataset.service;
  }));
  const copy = document.querySelector('#copy-email');
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      document.querySelector('#copy-status').textContent = 'Email copied. Say hello when you’re ready.';
    } catch {
      document.querySelector('#copy-status').textContent = `Copy this address: ${email}`;
    }
  });
  document.querySelector('#prepare-email').disabled = false;
  document.querySelector('#brief-form').addEventListener('submit', event => {
    event.preventDefault();
    const brief = document.querySelector('#brief').value.trim();
    if (!brief) {
      document.querySelector('#brief-status').textContent = 'Add a short summary before preparing your draft.';
      document.querySelector('#brief').focus();
      return;
    }
    const subject = `Project enquiry: ${service.value}`;
    const body = `Hi Om,\n\nI’m getting in touch about: ${service.value}.\n\n${brief}\n\nMy name / company:\nBudget range (if known):\nPreferred next step:\n`;
    document.querySelector('#brief-status').textContent = 'Your email draft is ready. If no app opens, use the email address on this page.';
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
