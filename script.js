import { safeHttps, normalizeRepo, selectArchive, resolveProject, activityItems } from './lib/catalog.mjs';
import { createScene } from './lib/scene.mjs';

const $ = selector => document.querySelector(selector);
const element = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
const external = (text, url, className) => { const href = safeHttps(url); if (!href) return null; const a = element('a', className, text); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
const readSetting = key => { try { return localStorage.getItem(key); } catch { return null; } };
const writeSetting = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Settings are optional. */ } };
const dateLabel = date => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date(date));

const lighting = $('#lighting-toggle');
const setLighting = value => { document.documentElement.dataset.theme = value; lighting.setAttribute('aria-label', value === 'cinema' ? 'Switch to studio lighting' : 'Switch to cinema lighting'); $('meta[name="theme-color"]').content = value === 'cinema' ? '#090a10' : '#f5eee7'; };
setLighting(readSetting('om-cinema-lighting') === 'studio' ? 'studio' : 'cinema');
lighting.hidden = false;
lighting.addEventListener('click', () => { const next = document.documentElement.dataset.theme === 'cinema' ? 'studio' : 'cinema'; setLighting(next); writeSetting('om-cinema-lighting', next); });

const stage = $('#hero-stage'), rig = $('#portrait-rig'), motionButton = $('#motion-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let userMotion = readSetting('om-cinema-motion'), motion = userMotion === null ? !reduceMotion.matches : userMotion === 'on';
let scene;
try { scene = createScene($('#scene')); } catch { scene = { setMotion() {}, setPointer() {} }; }
const applyMotion = () => { document.body.classList.toggle('motion-paused', !motion); motionButton.setAttribute('aria-pressed', String(motion)); motionButton.querySelector('span').textContent = motion ? 'on' : 'off'; scene.setMotion(motion); if (!motion) { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); } };
motionButton.hidden = false; applyMotion();
motionButton.addEventListener('click', () => { motion = !motion; userMotion = motion ? 'on' : 'off'; writeSetting('om-cinema-motion', userMotion); applyMotion(); });
reduceMotion.addEventListener('change', () => { if (userMotion === null) { motion = !reduceMotion.matches; applyMotion(); } });
if (matchMedia('(pointer: fine)').matches) {
  stage.addEventListener('pointermove', event => { if (!motion) return; const r = stage.getBoundingClientRect(); const x = Math.max(-1, Math.min(1, (event.clientX - r.left) / r.width * 2 - 1)); const y = Math.max(-1, Math.min(1, (event.clientY - r.top) / r.height * 2 - 1)); stage.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg'); stage.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); scene.setPointer(x, y); });
  stage.addEventListener('pointerleave', () => { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); scene.setPointer(0, 0); });
}

const email = 'omjadon242@gmail.com';
$('#copy-email').hidden = false;
$('#copy-email').addEventListener('click', async () => { try { await navigator.clipboard.writeText(email); $('#copy-status').textContent = 'Email copied. Your move.'; } catch { $('#copy-status').textContent = 'Copy this address: ' + email; } });
document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click', () => { $('#service').value = a.dataset.service; }));
$('#prepare-email').disabled = false;
$('#brief').addEventListener('input', () => { $('#brief-status').textContent = ''; });
$('#brief-form').addEventListener('submit', event => {
  event.preventDefault(); const brief = $('#brief').value.trim();
  if (!brief) { $('#brief-status').textContent = 'Add a short summary before preparing your draft.'; $('#brief').focus(); return; }
  const subject = 'Project enquiry: ' + $('#service').value;
  const body = 'Hi Om,\n\nI’m getting in touch about: ' + $('#service').value + '.\n\n' + brief + '\n\nMy name / company:\nBudget range (if known):\nPreferred next step:\n';
  $('#brief-status').textContent = 'Draft prepared. If no email app opens, use the email address directly.';
  location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
});

function artwork(project) {
  const known = new Set(['trail', 'memory', 'contract', 'spider']);
  const art = element('div', 'poster-art art-' + (known.has(project.art) ? project.art : 'memory'));
  const top = element('div', 'poster-header'); top.append(element('span', '', 'PROJECT / ' + project.number), element('span', '', 'OM / SELECTED WORK')); art.append(top);
  if (project.art === 'trail') {
    const image = element('img'); image.src = 'assets/returntrail.webp'; image.alt = 'Actual ReturnTrail evidence workspace'; image.loading = 'lazy'; image.width = 1440; image.height = 1200; art.append(image);
  } else if (project.art === 'memory') {
    const sculpture = element('div', 'memory-sculpture'); sculpture.setAttribute('aria-hidden', 'true'); sculpture.append(element('i'), element('i')); art.append(sculpture);
  } else if (project.art === 'contract') {
    const props = element('div', 'contract-props'); props.setAttribute('aria-hidden', 'true');
    for (const [label, number] of [['AGREEMENT', '30'], ['STATEMENT OF WORK', '60']]) { const paper = element('div', 'paper'); paper.append(element('span', '', label), element('strong', '', number), element('small', '', 'calendar days'), element('i'), element('i'), element('i')); props.append(paper); }
    art.append(props);
  } else {
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 280 220'); svg.setAttribute('class', 'signal-web'); svg.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 7; i++) { const p = document.createElementNS(ns, 'path'); const d = 10 + i * 10; p.setAttribute('d', 'M140 ' + d + 'L' + (270 - d) + ' ' + (200 - d / 2) + 'L' + d + ' ' + (200 - d / 2) + 'Z'); svg.append(p); }
    for (const [x, y] of [[140, 10], [260, 195], [20, 195], [140, 100]]) { const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', '4'); svg.append(c); }
    art.append(svg);
  }
  const title = element('h3', 'poster-title', project.title); title.append(element('small', '', project.tagline)); art.append(title);
  art.append(element('span', 'poster-bottom-label', project.art === 'trail' ? 'ACTUAL CAPTURE + ORIGINAL POSTER LAYOUT' : project.art === 'contract' ? 'ILLUSTRATIVE SAMPLE TERMS' : 'ORIGINAL WORKFLOW ILLUSTRATION'));
  return art;
}

const dialog = $('#project-dialog');
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
function openProject(project) {
  $('#dialog-scene').textContent = 'PROJECT FILE / ' + project.number + ' / ' + project.genre.toUpperCase();
  const content = $('#dialog-content'); content.replaceChildren(); const grid = element('div', 'dialog-grid'), copy = element('div', 'dialog-copy');
  const title = element('h2', '', project.title); title.id = 'dialog-title'; copy.append(title, element('p', '', project.description));
  const status = element('p', 'project-status', project.status); copy.append(status);
  const tags = element('div', 'tags'); project.stack.forEach(x => tags.append(element('span', '', x))); copy.append(tags, element('p', 'contribution', project.role));
  for (const [heading, text] of [['The engineering decision', project.decision], ['A lesson from the build', project.lesson]]) copy.append(element('h3', '', heading), element('p', '', text));
  copy.append(element('p', 'boundary', project.boundary));
  const links = element('div', 'dialog-links'); const source = external('Source & setup ↗', project.source); if (source) links.append(source);
  if (project.website) links.append(external(project.status === 'Public demo' ? 'Open demo ↗' : 'Project website ↗', project.website));
  if (project.video) links.append(external('Watch walkthrough ↗', project.video));
  copy.append(links); grid.append(artwork(project), copy); content.append(grid);
  if (typeof project.screenshot === 'string' && /^assets\/[a-z0-9-]+\.webp$/.test(project.screenshot)) {
    const figure = element('figure', 'project-capture'), link = element('a');
    link.href = project.screenshot; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const image = element('img'); image.src = project.screenshot; image.alt = project.screenshotAlt || project.title + ' application screenshot';
    image.loading = 'lazy'; image.width = 1561; image.height = 956;
    link.append(image); figure.append(link, element('figcaption', '', 'Actual ' + project.title + ' portal · open the image at full size ↗')); content.append(figure);
  }
  document.body.classList.add('dialog-open'); dialog.showModal();
}

function renderProjects(profile, catalog) {
  const reel = $('#project-reel'); reel.replaceChildren();
  profile.projects.forEach(raw => {
    const project = resolveProject(raw, catalog), card = element('article', 'project-card'); card.dataset.category = project.category;
    const button = element('button', 'poster-button'); button.type = 'button'; button.setAttribute('aria-label', 'Open ' + project.title + ' case study'); button.append(artwork(project)); button.addEventListener('click', () => openProject(project));
    const meta = element('div', 'card-meta'); const status = element('span', 'project-status' + (project.status === 'Hosting paused' ? ' paused' : project.status === 'Deployment planned' ? ' planned' : ''), project.status); meta.append(status, element('span', '', project.category === 'team' ? 'TEAM BUILD' : project.category === 'solo' ? 'SOLO BUILD' : 'ACADEMIC'));
    const caption = element('p', 'card-caption', project.genre); const links = element('div', 'card-links'); links.append(external('Source ↗', project.source));
    if (project.website) links.append(external(project.status === 'Public demo' ? 'Demo ↗' : 'Website ↗', project.website));
    else links.append(external('Local setup ↗', project.source + '#readme'));
    card.append(button, meta, caption, links); reel.append(card);
  });
  $('#catalog-fallback').hidden = true; const filters = $('#project-filters'); filters.hidden = false; filters.querySelector('[data-filter="all"] span').textContent = String(profile.projects.length).padStart(2, '0');
  filters.addEventListener('click', event => { const target = event.target.closest('button[data-filter]'); if (!target) return; filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === target))); let visible = 0; reel.querySelectorAll('.project-card').forEach(card => { card.hidden = target.dataset.filter !== 'all' && card.dataset.category !== target.dataset.filter; if (!card.hidden) visible++; }); $('#filter-status').textContent = visible + (visible === 1 ? ' project shown.' : ' projects shown.'); });
}

function renderMilestones(profile) {
  const holder = $('#milestones'); holder.replaceChildren();
  for (const m of profile.milestones || []) { const item = element('article', 'milestone'); item.append(element('p', 'eyebrow', m.label), element('h3', '', m.title), element('p', '', m.text)); const link = external(m.linkLabel || 'Explore the work ↗', m.url); if (link) item.append(link); holder.append(item); }
}

function renderGitHub(profile, catalog) {
  const rows = selectArchive(profile, catalog), list = $('#repo-list'); list.replaceChildren();
  for (const repo of rows) { const a = external('', repo.source, 'repo-row'), copy = element('div'); copy.append(element('strong', '', repo.name)); if (repo.description) copy.append(element('p', '', repo.description)); copy.append(element('span', 'repo-language', (repo.language || 'Public repository') + (repo.pushedAt ? ' / updated ' + dateLabel(repo.pushedAt) : ''))); a.append(copy, element('span', '', '↗')); list.append(a); }
  $('#repo-empty').hidden = rows.length > 0;
  const activities = $('#activity-list'); activities.replaceChildren();
  for (const item of activityItems(profile, catalog)) { const row = element('div', 'activity-item'), time = element('time', '', dateLabel(item.date)); time.dateTime = item.date; row.append(time, external(item.title + ' ↗', item.url), element('small', '', item.kind)); activities.append(row); }
  const valid = Number.isFinite(Date.parse(catalog.checkedAt)); $('#sync-status').textContent = valid ? 'SAVED GITHUB SNAPSHOT / ' + dateLabel(catalog.checkedAt) + ' / daily refresh' : 'Saved GitHub snapshot. Refresh information is unavailable.';
}

async function loadContent() {
  try {
    const [profileResponse, catalogResponse] = await Promise.all([fetch('data/profile.json', { cache: 'no-cache' }), fetch('data/github.json', { cache: 'no-cache' }).catch(() => null)]);
    if (!profileResponse.ok) throw new Error('Profile unavailable'); const profile = await profileResponse.json();
    let catalog = { repositories: [], releases: [] }; if (catalogResponse?.ok) { try { catalog = await catalogResponse.json(); } catch { /* Use curated projects when the snapshot cannot load. */ } }
    if (!Array.isArray(profile.projects) || !profile.projects.length || !Array.isArray(catalog.repositories)) throw new Error('Invalid catalog');
    renderProjects(profile, catalog); renderMilestones(profile); renderGitHub(profile, catalog);
  } catch { $('#sync-status').textContent = 'The project list could not load. The repository links and contact options still work.'; }
}
loadContent();
