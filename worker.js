/**
 * NEDC Dashboard Data Worker  (dashboard + NPI Summary)
 * Dev origin: dev.nedc-qsi-dashboard.pages.dev  → prefix: dev:
 * Production: nedc-qsi-dashboard.pages.dev       → prefix: prod:
 *
 * NPI Summary routes (added):
 *   GET    /npi/index?env=dev|prod        → [{key, period, updatedAt}]
 *   GET    /npi/archive/2026/07?env=…     → {npi_data, period, updatedAt}
 *   POST   /npi/save?env=…                → body {npi_data, key, period, updatedAt}
 *   DELETE /npi/archive/2026/07?env=…     → removes one month
 * NPI keys live under <prefix>npi:… in the same NEDC_KV namespace, so nothing
 * the dashboard already stores is touched.
 */

const ADMIN_SECRET = 'NEDC_WORKER_2026';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret, Cache-Control, X-Dashboard-Env',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Isolate dev vs production using ?env= query parameter
    // Dashboard sends ?env=dev or ?env=prod based on its own URL
    const envParam = url.searchParams.get('env') || request.headers.get('X-Dashboard-Env') || '';
    const isDev = envParam === 'dev';
    const P = isDev ? 'dev:' : 'prod:';

    try {

      // ── NPI Summary routes (/npi/*) ───────────────────────────────────
      if (path.startsWith('/npi/')) {
        const idxKey = P + 'npi:index';
        const monthKey = (y, m) => P + 'npi:m:' + y + ':' + m;
        const readIdx = async () => {
          const raw = await env.NEDC_KV.get(idxKey);
          try { return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
        };
        const sortIdx = a => a.sort((x, y) => (x.key < y.key ? 1 : x.key > y.key ? -1 : 0));

        // GET /npi/index
        if (request.method === 'GET' && path === '/npi/index') {
          return new Response(JSON.stringify(sortIdx(await readIdx())), { headers: cors });
        }

        // POST /npi/save
        if (request.method === 'POST' && path === '/npi/save') {
          if (request.headers.get('X-Admin-Secret') !== ADMIN_SECRET)
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
          let body;
          try { body = await request.json(); } catch (e) { return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400, headers: cors }); }
          const data = body.npi_data || body;
          const meta = (data && data.meta) || {};
          let key = body.key;
          if (!key && meta.year) {
            const mi = (meta.monthIndex == null ? 0 : Number(meta.monthIndex)) + 1;
            key = meta.year + ':' + String(mi).padStart(2, '0');
          }
          if (!key || !/^\d{4}:\d{2}$/.test(key))
            return new Response(JSON.stringify({ error: 'Missing or bad key' }), { status: 400, headers: cors });
          const [y, m] = key.split(':');
          const updatedAt = body.updatedAt || new Date().toISOString();
          const period = body.period || meta.period || key;

          await env.NEDC_KV.put(monthKey(y, m), JSON.stringify({ npi_data: data, period, updatedAt }));
          const idx = (await readIdx()).filter(e => e.key !== key);
          idx.push({ key, period, updatedAt });
          await env.NEDC_KV.put(idxKey, JSON.stringify(sortIdx(idx)));
          return new Response(JSON.stringify({ ok: true, key, period, count: idx.length, env: isDev ? 'dev' : 'prod' }), { headers: cors });
        }

        // GET | DELETE /npi/archive/:year/:month
        const mt = path.match(/^\/npi\/archive\/(\d{4})\/(\d{1,2})$/);
        if (mt) {
          const y = mt[1], m = String(mt[2]).padStart(2, '0'), key = y + ':' + m;
          if (request.method === 'GET') {
            const raw = await env.NEDC_KV.get(monthKey(y, m));
            if (!raw) {
              // Auto-clean stale entry from the NPI index
              const idx = await readIdx();
              const cleaned = idx.filter(e => e.key !== key);
              if (cleaned.length !== idx.length) await env.NEDC_KV.put(idxKey, JSON.stringify(cleaned));
              return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: cors });
            }
            return new Response(raw, { headers: cors });
          }
          if (request.method === 'DELETE') {
            if (request.headers.get('X-Admin-Secret') !== ADMIN_SECRET)
              return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
            await env.NEDC_KV.delete(monthKey(y, m));
            await env.NEDC_KV.put(idxKey, JSON.stringify((await readIdx()).filter(e => e.key !== key)));
            return new Response(JSON.stringify({ ok: true, deleted: key }), { headers: cors });
          }
        }

        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: cors });
      }

      // GET /current
      if (request.method === 'GET' && path === '/current') {
        const data = await env.NEDC_KV.get(P+'current');
        if (!data) return new Response(JSON.stringify({ error: 'No data yet' }), { status: 404, headers: cors });
        return new Response(data, { headers: cors });
      }

      // GET /archive/:year/:month
      if (request.method === 'GET' && path.startsWith('/archive/')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length !== 3) return new Response(JSON.stringify({ error: 'Invalid' }), { status: 400, headers: cors });
        const data = await env.NEDC_KV.get(P+`archive:${parts[1]}:${parts[2]}`);
        if (!data) {
          // Auto-clean stale entry from index
          const archKey = `${parts[1]}:${parts[2]}`;
          const idxData = await env.NEDC_KV.get(P+'index');
          if (idxData) {
            const idx = JSON.parse(idxData);
            const cleaned = idx.filter(i => i.key !== archKey);
            if (cleaned.length !== idx.length) {
              await env.NEDC_KV.put(P+'index', JSON.stringify(cleaned));
            }
          }
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: cors });
        }
        return new Response(data, { headers: cors });
      }

      // GET /index
      if (request.method === 'GET' && path === '/index') {
        const data = await env.NEDC_KV.get(P+'index');
        const index = data ? JSON.parse(data) : [];
        return new Response(JSON.stringify(index), { headers: cors });
      }

      // DELETE /archive/:year/:month
      if (request.method === 'DELETE' && path.startsWith('/archive/')) {
        const secret = request.headers.get('X-Admin-Secret');
        if (secret !== ADMIN_SECRET) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
        const parts = path.split('/').filter(Boolean);
        if (parts.length !== 3) return new Response(JSON.stringify({ error: 'Invalid' }), { status: 400, headers: cors });
        const archiveKey = `${parts[1]}:${parts[2]}`;
        await env.NEDC_KV.delete(P+`archive:${archiveKey}`);
        const indexData = await env.NEDC_KV.get(P+'index');
        const index = indexData ? JSON.parse(indexData) : [];
        const updated = index.filter(i => i.key !== archiveKey);
        await env.NEDC_KV.put(P+'index', JSON.stringify(updated));
        return new Response(JSON.stringify({ ok: true, deleted: archiveKey }), { headers: cors });
      }

      // POST /save
      if (request.method === 'POST' && path === '/save') {
        const secret = request.headers.get('X-Admin-Secret');
        if (secret !== ADMIN_SECRET) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
        const body = await request.json();
        const { nedc_data, period, updatedAt } = body;
        if (!nedc_data || !period) return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400, headers: cors });
        const payload = JSON.stringify({ nedc_data, period, updatedAt: updatedAt || new Date().toISOString() });

        // Only update 'current' if this month is chronologically newer
        const existingCurrent = await env.NEDC_KV.get(P+'current');
        let shouldUpdateCurrent = true;
        if (existingCurrent) {
          try {
            const existing = JSON.parse(existingCurrent);
            const existingKey = periodToKey(existing.period || '');
            const newKey = periodToKey(period);
            if (existingKey && newKey && existingKey > newKey) {
              shouldUpdateCurrent = false;
            }
          } catch(e) {}
        }
        if (shouldUpdateCurrent) {
          await env.NEDC_KV.put(P+'current', payload);
        }

        // Always archive
        const archiveKey = periodToKey(period);
        if (archiveKey) {
          await env.NEDC_KV.put(P+`archive:${archiveKey}`, payload);
          const indexData = await env.NEDC_KV.get(P+'index');
          const index = indexData ? JSON.parse(indexData) : [];
          const existing = index.findIndex(i => i.key === archiveKey);
          const entry = { key: archiveKey, period, updatedAt: updatedAt || new Date().toISOString() };
          if (existing >= 0) index[existing] = entry;
          else index.push(entry);
          index.sort((a, b) => b.key > a.key ? 1 : -1);
          await env.NEDC_KV.put(P+'index', JSON.stringify(index));
        }
        return new Response(JSON.stringify({ ok: true, archived: archiveKey, env: isDev?'dev':'prod' }), { headers: cors });
      }

      // POST /track-visit
      if (request.method === 'POST' && path === '/track-visit') {
        const countStr = await env.NEDC_KV.get(P+'visit_count');
        const count = (parseInt(countStr) || 0) + 1;
        await env.NEDC_KV.put(P+'visit_count', String(count));
        return new Response(JSON.stringify({ count }), { headers: cors });
      }

      // GET /visit-count
      if (request.method === 'GET' && path === '/visit-count') {
        const countStr = await env.NEDC_KV.get(P+'visit_count');
        return new Response(JSON.stringify({ count: parseInt(countStr) || 0 }), { headers: cors });
      }

      // GET /debug — show which env is detected (for testing)
      if (request.method === 'GET' && path === '/debug') {
        return new Response(JSON.stringify({ origin: url.origin, host: url.host, envParam, isDev, prefix: P }), { headers: cors });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: cors });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
    }
  }
};

function periodToKey(period) {
  const months = { JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',
                   JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12' };
  const parts = period.replace('YTD','').trim().split(' ').filter(Boolean);
  if (parts.length !== 2) return null;
  const [mon, year] = parts;
  const monthNum = months[mon.toUpperCase()];
  if (!monthNum || !year) return null;
  return `${year}:${monthNum}`;
}
