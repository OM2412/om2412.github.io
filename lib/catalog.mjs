export function safeHttps(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (host === 'localhost' || /\.(localhost|local|internal)$/.test(host)) return null;
    const ip = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ip) { const a = Number(ip[1]), b = Number(ip[2]); if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)) return null; }
    if (host.includes(':') && /^(::|fc|fd|fe[89ab])/.test(host)) return null;
    return url.href;
  } catch { return null; }
}

export function normalizeRepo(value) {
  if (!value || typeof value !== 'object') return null;
  const fullName = String(value.fullName || '');
  if (!/^[a-z0-9-]+\/[a-z0-9._-]+$/i.test(fullName)) return null;
  if (value.visibility !== 'public' || value.fork || value.archived || !(Number(value.size) > 0)) return null;
  return {
    id: Number(value.id) || 0,
    fullName,
    name: fullName.split('/')[1],
    description: String(value.description || '').slice(0, 300),
    source: 'https://github.com/' + fullName,
    homepage: safeHttps(value.homepage),
    language: String(value.language || '').slice(0, 40),
    pushedAt: Number.isFinite(Date.parse(value.pushedAt)) ? value.pushedAt : null,
    createdAt: Number.isFinite(Date.parse(value.createdAt)) ? value.createdAt : null,
    stars: Math.max(0, Math.floor(Number(value.stars) || 0)),
    visibility: 'public', fork: false, archived: false, size: Number(value.size)
  };
}

export function selectArchive(profile, catalog) {
  const excluded = new Set((profile.excludedRepositories || []).map(x => x.toLowerCase()));
  const featured = new Set((profile.projects || []).map(x => x.repository.toLowerCase()));
  const seen = new Set();
  return (catalog.repositories || []).map(normalizeRepo).filter(repo => {
    if (!repo || repo.fullName.split('/')[0].toLowerCase() !== profile.owner.toLowerCase()) return false;
    const key = repo.fullName.toLowerCase();
    if (seen.has(key) || featured.has(key) || excluded.has(repo.name.toLowerCase())) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => (Date.parse(b.pushedAt) || 0) - (Date.parse(a.pushedAt) || 0));
}

export function resolveProject(project, catalog) {
  const repo = (catalog.repositories || []).map(normalizeRepo).find(x => x?.fullName.toLowerCase() === project.repository.toLowerCase());
  const website = project.allowHomepageSync === false ? safeHttps(project.website) : (repo?.homepage || safeHttps(project.website));
  const status = website && !project.website ? 'Project website' : project.status;
  return { ...project, website, status, source: 'https://github.com/' + project.repository, pushedAt: repo?.pushedAt || null };
}

export function activityItems(profile, catalog) {
  const owner = profile.owner.toLowerCase();
  const curated = new Set((profile.projects || []).map(x => x.repository.toLowerCase()));
  const excluded = new Set((profile.excludedRepositories || []).map(x => x.toLowerCase()));
  const repos = (catalog.repositories || []).map(normalizeRepo).filter(x => x && (curated.has(x.fullName.toLowerCase()) || (x.fullName.split('/')[0].toLowerCase() === owner && !excluded.has(x.name.toLowerCase()))));
  const allowed = new Set(repos.map(x => x.fullName.toLowerCase()));
  const releases = (catalog.releases || []).filter(x => {
    const href = safeHttps(x.url);
    return allowed.has(String(x.repository).toLowerCase()) && Number.isFinite(Date.parse(x.publishedAt)) && href?.startsWith('https://github.com/' + x.repository + '/releases/');
  }).map(x => ({ kind: 'Release', title: String(x.repository.split('/')[1]) + ' · ' + String(x.name || x.tag).slice(0, 100), url: safeHttps(x.url), date: x.publishedAt }));
  const updates = repos.filter(x => x.pushedAt).map(x => ({ kind: 'Repository update', title: x.name, url: x.source, date: x.pushedAt }));
  return [...releases, ...updates].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 4);
}
