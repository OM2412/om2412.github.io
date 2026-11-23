/**
 * Refresh curated public GitHub metadata for the portfolio.
 * Runs on GitHub Actions; no access token or private metadata is published.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { safeHttps } from '../lib/catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const profile = JSON.parse(await readFile(resolve(root, 'data/profile.json'), 'utf8'));
const snapshotPath = resolve(root, 'data/github.json');
const current = JSON.parse(await readFile(snapshotPath, 'utf8'));
const token = process.env.GITHUB_TOKEN;
const api = 'https://api.github.com';
const excluded = new Set((profile.excludedRepositories || []).map(x => x.toLowerCase()));
const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'portfolio-public-sync' };
if (token) headers.Authorization = 'Bearer ' + token;

async function readJson(path) {
  const response = await fetch(api + path, { headers, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error('GitHub metadata fetch failed (' + response.status + '): ' + path);
  return response.json();
}
const allowed = value => value && value.visibility === 'public' && !value.fork && !value.archived && value.size > 0;
function normalize(repo) {
  return {
    id: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    description: repo.description || null,
    source: 'https://github.com/' + repo.full_name,
    homepage: safeHttps(repo.homepage),
    language: repo.language || null,
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    stars: repo.stargazers_count || 0,
    fork: false,
    archived: false,
    visibility: 'public',
    size: repo.size
  };
}
const repositories = new Map();
const owned = await readJson('/users/' + encodeURIComponent(profile.owner) + '/repos?per_page=100&type=owner&sort=full_name&page=1');
for (const repo of owned) {
  if (!allowed(repo) || excluded.has(repo.name.toLowerCase())) continue;
  repositories.set(repo.full_name.toLowerCase(), normalize(repo));
}
if (owned.length === 100) {
  for (let page = 2; page <= 10; page++) {
    const more = await readJson('/users/' + encodeURIComponent(profile.owner) + '/repos?per_page=100&type=owner&sort=full_name&page=' + page);
    for (const repo of more) if (allowed(repo) && !excluded.has(repo.name.toLowerCase())) repositories.set(repo.full_name.toLowerCase(), normalize(repo));
    if (more.length < 100) break;
    if (page === 10) throw new Error('Pagination limit reached; refusing incomplete snapshot');
  }
}
for (const project of profile.projects || []) {
  const fullName = String(project.repository || '');
  if (!/^[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+$/.test(fullName)) throw new Error('Invalid curated repository name');
  const [owner, name] = fullName.split('/');
  const repo = await readJson('/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(name));
  if (!allowed(repo)) throw new Error('Curated repository is not eligible: ' + fullName);
  repositories.set(repo.full_name.toLowerCase(), normalize(repo));
}
const releases = [];
for (const repo of repositories.values()) {
  const [owner, name] = repo.fullName.split('/');
  const list = await readJson('/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(name) + '/releases?per_page=10');
  let count = 0;
  for (const rel of list) {
    if (count >= 3) break;
    if (rel.draft || rel.prerelease || !rel.published_at) continue;
    const url = safeHttps(rel.html_url);
    if (!url || !url.startsWith('https://github.com/' + repo.fullName + '/releases/')) continue;
    releases.push({ repository: repo.fullName, name: rel.name || rel.tag_name, tag: rel.tag_name, url, publishedAt: rel.published_at });
    count++;
  }
}
const sortedRepos = [...repositories.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
releases.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.repository.localeCompare(b.repository) || a.tag.localeCompare(b.tag));
const signature = data => JSON.stringify({ repositories: [...data.repositories].sort((a, b) => a.fullName.localeCompare(b.fullName)), releases: [...data.releases].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.repository.localeCompare(b.repository) || a.tag.localeCompare(b.tag)) });
const proposed = { schemaVersion: 1, checkedAt: new Date().toISOString(), repositories: sortedRepos, releases };
if (signature(current) === signature(proposed)) {
  console.log('Public GitHub metadata unchanged; snapshot preserved at ' + current.checkedAt);
} else {
  await writeFile(snapshotPath, JSON.stringify(proposed, null, 2) + '\n');
  console.log('Updated public GitHub snapshot: ' + sortedRepos.length + ' repositories, ' + releases.length + ' releases');
}
