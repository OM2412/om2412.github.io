import test from 'node:test';
import assert from 'node:assert/strict';
import { safeHttps, normalizeRepo, selectArchive, resolveProject, activityItems } from '../lib/catalog.mjs';

const repo = (overrides = {}) => ({ id: 1, fullName: 'OM2412/New-Project', name: 'New-Project', size: 20, visibility: 'public', fork: false, archived: false, pushedAt: '2026-10-18T12:00:00Z', ...overrides });
const profile = { owner: 'OM2412', excludedRepositories: ['OM2412'], projects: [{ repository: 'OM2412/Featured' }] };

test('website links require HTTPS, reject credentials and local destinations', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'http://example.org', 'https://user:password@example.org', 'https://localhost/a', 'https://127.0.0.1', 'https://10.0.0.1', 'https://172.16.0.1', 'https://169.254.169.254', 'https://[::1]', 'https://[fd00::1]', 'https://service.internal', '/relative']) assert.equal(safeHttps(url), null);
  assert.equal(safeHttps('https://example.org/project'), 'https://example.org/project');
});
test('repository normalization excludes private, forked, archived and empty work', () => {
  for (const overrides of [{ visibility: 'private' }, { fork: true }, { archived: true }, { size: 0 }, { fullName: 'OM2412/<script>' }]) assert.equal(normalizeRepo(repo(overrides)), null);
});
test('repository links come from canonical names, not supplied URLs', () => {
  const normalized = normalizeRepo(repo({ source: 'javascript:alert(1)', description: '<img src=x onerror=alert(1)>' }));
  assert.equal(normalized.source, 'https://github.com/OM2412/New-Project');
  assert.equal(normalized.description, '<img src=x onerror=alert(1)>'); // Renderer uses textContent.
});
test('a new public project appears without editing the curated project list', () => {
  assert.deepEqual(selectArchive(profile, { repositories: [repo()] }).map(x => x.name), ['New-Project']);
});
test('archive excludes featured, excluded, external and duplicate repositories', () => {
  const rows = [repo(), repo(), repo({ fullName: 'OM2412/Featured' }), repo({ fullName: 'OM2412/OM2412' }), repo({ fullName: 'Other/Elsewhere' })];
  assert.equal(selectArchive(profile, { repositories: rows }).length, 1);
});
test('paused hosting cannot silently reappear from a stale repository homepage', () => {
  const project = { repository: 'OM2412/OnceTold', allowHomepageSync: false, website: null, status: 'Hosting paused' };
  const actual = resolveProject(project, { repositories: [repo({ fullName: project.repository, homepage: 'https://old-host.example.org' })] });
  assert.equal(actual.website, null); assert.equal(actual.status, 'Hosting paused');
});
test('planned project gains a listed website only when a valid homepage is supplied', () => {
  const project = { repository: 'OM2412/legal-contract-analyzer', allowHomepageSync: true, website: null, status: 'Deployment planned' };
  assert.equal(resolveProject(project, { repositories: [] }).status, 'Deployment planned');
  const actual = resolveProject(project, { repositories: [repo({ fullName: project.repository, homepage: 'https://contract.example.org' })] });
  assert.equal(actual.website, 'https://contract.example.org/'); assert.equal(actual.status, 'Project website');
});
test('activity drops fabricated external release links and invalid dates', () => {
  const catalog = { repositories: [repo()], releases: [{ repository: 'OM2412/New-Project', name: 'bad', url: 'https://evil.example.org', publishedAt: '2026-10-19' }, { repository: 'OM2412/New-Project', name: 'bad-date', url: 'https://github.com/OM2412/New-Project/releases/tag/v1', publishedAt: 'invalid' }] };
  assert.deepEqual(activityItems(profile, catalog).map(x => x.kind), ['Repository update']);
});
test('a verified release is shown as a release, never an invented achievement', () => {
  const catalog = { repositories: [repo()], releases: [{ repository: 'OM2412/New-Project', name: 'Version 1', tag: 'v1', url: 'https://github.com/OM2412/New-Project/releases/tag/v1', publishedAt: '2026-10-19T10:00:00Z' }] };
  const items = activityItems(profile, catalog); assert.equal(items[0].kind, 'Release'); assert.equal(items[0].title, 'New-Project · Version 1');
});


test('featured case studies are complete and deployment links are safe', async () => {
  const { readFile } = await import('node:fs/promises');
  const profileData = JSON.parse(await readFile(new URL('../data/profile.json', import.meta.url), 'utf8'));
  assert.ok(profileData.projects.length >= 3);
  for (const project of profileData.projects) {
    assert.ok(project.caseStudy, project.id + ' needs a case study');
    for (const section of ['problem', 'architecture', 'engineering', 'verification', 'next']) {
      const value = project.caseStudy[section];
      assert.ok(Array.isArray(value) ? value.length > 0 && value.every(x => typeof x === 'string' && x.trim()) : typeof value === 'string' && value.trim(), project.id + ' missing ' + section);
    }
    assert.ok(safeHttps(project.website), project.id + ' needs a safe deployment URL');
    if (project.preview) assert.ok(safeHttps(project.preview), project.id + ' has an unsafe alternate deployment');
  }
});


test('technical skill areas link to real repository evidence', async () => {
  const { readFile } = await import('node:fs/promises');
  const data = JSON.parse(await readFile(new URL('../data/profile.json', import.meta.url), 'utf8'));
  const expected = ['backend', 'frontend', 'data', 'ai', 'delivery'];
  assert.deepEqual(data.skills.map(group => group.id), expected);
  for (const group of data.skills) {
    assert.ok(group.title && group.summary, group.id + ' requires a title and description');
    assert.ok(group.technologies.length >= 3, group.id + ' requires concrete technologies');
    assert.ok(group.evidence.length >= 1, group.id + ' requires linked project evidence');
    for (const entry of group.evidence) {
      assert.match(entry.repository, /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/);
      assert.ok(data.projects.some(project => project.repository === entry.repository) || entry.repository === 'OM2412/om2412.github.io');
    }
  }
});


test('architecture diagrams and real captures have honest, bounded metadata', async () => {
  const { readFile } = await import('node:fs/promises');
  const { existsSync } = await import('node:fs');
  const data = JSON.parse(await readFile(new URL('../data/profile.json', import.meta.url), 'utf8'));
  for (const project of data.projects) {
    assert.ok(Array.isArray(project.architectureDiagrams) && project.architectureDiagrams.length > 0, project.id + ' missing architecture');
    for (const diagram of project.architectureDiagrams) {
      assert.ok(diagram.title && diagram.label && diagram.nodes?.length >= 3, project.id + ' incomplete architecture path');
      assert.ok(diagram.nodes.every(node => typeof node === 'string' && node.trim()));
    }
    if (!project.captures?.length) {
      assert.ok(project.visualNote, project.id + ' must disclose missing real UI captures');
    }
    for (const capture of project.captures || []) {
      assert.ok(capture.alt && capture.caption, project.id + ' capture needs attribution and alt text');
      const local = /^assets\/[a-z0-9-]+\.webp$/.test(capture.src);
      const upstream = /^https:\/\/raw\.githubusercontent\.com\/OM2412\/ReturnTrail\/main\/docs\/assets\/[a-z0-9-]+\.webp$/.test(capture.src);
      assert.ok(local || upstream, project.id + ' capture is not from an approved source');
      if (local) assert.ok(existsSync(new URL('../' + capture.src, import.meta.url)), project.id + ' missing local capture');
    }
  }
});
