import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../src/app.ts';
import { openDb } from '../src/db.ts';
import { loadConfig } from '../src/config.ts';

const config = loadConfig({ NODE_ENV: 'test' });
const db = openDb(':memory:');
const app = createApp(db, config);
let server: Server;
let base = '';

before(async () => {
  server = app.listen(0);
  await new Promise<void>((r) => server.once('listening', () => r()));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => new Promise<void>((r) => server.close(() => r())));

async function call(method: string, path: string, body?: unknown, token?: string) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : undefined };
}

const userA = { email: 'Ali@Example.com', name: 'Ali', password: 'parol12345' };
const userB = { email: 'vali@example.com', name: 'Vali', password: 'boshqa12345' };

describe('health', () => {
  test('GET /api/health ishlaydi', async () => {
    const r = await call('GET', '/api/health');
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
  });
});

describe('auth', () => {
  test('ro‘yxatdan o‘tish email’ni kichik harfga o‘tkazadi va token qaytaradi', async () => {
    const r = await call('POST', '/api/auth/register', userA);
    assert.equal(r.status, 201);
    assert.equal(r.json.user.email, 'ali@example.com');
    assert.ok(r.json.token);
    assert.equal(r.json.user.password_hash, undefined);
  });

  test('takroriy email 409 qaytaradi', async () => {
    const r = await call('POST', '/api/auth/register', { ...userA, email: 'ali@example.com' });
    assert.equal(r.status, 409);
  });

  test('qisqa parol rad etiladi', async () => {
    const r = await call('POST', '/api/auth/register', { email: 'x@example.com', name: 'X', password: '123' });
    assert.equal(r.status, 400);
    assert.match(r.json.error, /8 belgi/);
  });

  test('noto‘g‘ri parol 401 beradi, to‘g‘ri parol token beradi', async () => {
    const bad = await call('POST', '/api/auth/login', { email: userA.email, password: 'notogri' });
    assert.equal(bad.status, 401);
    const ok = await call('POST', '/api/auth/login', { email: userA.email, password: userA.password });
    assert.equal(ok.status, 200);
    assert.ok(ok.json.token);
  });

  test('/me tokensiz 401, token bilan foydalanuvchini qaytaradi', async () => {
    assert.equal((await call('GET', '/api/auth/me')).status, 401);
    const login = await call('POST', '/api/auth/login', { email: userA.email, password: userA.password });
    const me = await call('GET', '/api/auth/me', undefined, login.json.token);
    assert.equal(me.status, 200);
    assert.equal(me.json.user.name, 'Ali');
  });

  test('buzilgan token rad etiladi', async () => {
    const r = await call('GET', '/api/auth/me', undefined, 'bu.yaroqsiz.token');
    assert.equal(r.status, 401);
  });
});

describe('loyihalar', () => {
  let tokenA = '';
  let tokenB = '';
  let projectId = '';

  before(async () => {
    tokenA = (await call('POST', '/api/auth/register', { ...userA, email: 'proj-a@example.com' })).json.token;
    tokenB = (await call('POST', '/api/auth/register', { ...userB, email: 'proj-b@example.com' })).json.token;
  });

  test('tokensiz loyihalarga kirish mumkin emas', async () => {
    assert.equal((await call('GET', '/api/projects')).status, 401);
  });

  test('loyiha yaratiladi va ro‘yxatda ko‘rinadi', async () => {
    const created = await call(
      'POST',
      '/api/projects',
      { name: 'Oilaviy uy', data: { houseType: 'house', floors: [{ id: 'f1', rooms: [] }] } },
      tokenA,
    );
    assert.equal(created.status, 201);
    projectId = created.json.project.id;
    assert.deepEqual(created.json.project.data.houseType, 'house');

    const list = await call('GET', '/api/projects', undefined, tokenA);
    assert.equal(list.json.projects.length, 1);
  });

  test('boshqa foydalanuvchi loyihani ko‘ra, o‘zgartira va o‘chira olmaydi', async () => {
    assert.equal((await call('GET', `/api/projects/${projectId}`, undefined, tokenB)).status, 404);
    assert.equal(
      (await call('PUT', `/api/projects/${projectId}`, { name: 'x', data: {} }, tokenB)).status,
      404,
    );
    assert.equal((await call('DELETE', `/api/projects/${projectId}`, undefined, tokenB)).status, 404);
    const list = await call('GET', '/api/projects', undefined, tokenB);
    assert.equal(list.json.projects.length, 0);
  });

  test('loyiha yangilanadi (updatedAt o‘zgaradi)', async () => {
    const before = await call('GET', `/api/projects/${projectId}`, undefined, tokenA);
    await new Promise((r) => setTimeout(r, 5));
    const upd = await call(
      'PUT',
      `/api/projects/${projectId}`,
      { name: 'Oilaviy uy v2', data: { houseType: 'house', floors: [] } },
      tokenA,
    );
    assert.equal(upd.status, 200);
    assert.equal(upd.json.project.name, 'Oilaviy uy v2');
    assert.notEqual(upd.json.project.updatedAt, before.json.project.updatedAt);
  });

  test('nom bo‘sh bo‘lsa 400 qaytaradi', async () => {
    const r = await call('POST', '/api/projects', { name: '  ', data: {} }, tokenA);
    assert.equal(r.status, 400);
  });

  test('loyiha o‘chiriladi, qayta olib bo‘lmaydi', async () => {
    assert.equal((await call('DELETE', `/api/projects/${projectId}`, undefined, tokenA)).status, 204);
    assert.equal((await call('GET', `/api/projects/${projectId}`, undefined, tokenA)).status, 404);
  });
});

describe('xatolar', () => {
  test('noma’lum yo‘l 404 JSON', async () => {
    const r = await call('GET', '/api/nope');
    assert.equal(r.status, 404);
  });

  test('buzilgan JSON 400 qaytaradi', async () => {
    const res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bu json emas',
    });
    assert.equal(res.status, 400);
  });
});
