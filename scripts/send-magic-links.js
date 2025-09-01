#!/usr/bin/env node
/*
  Envia magic link (email OTP) para usuários importados (raw_user_meta_data.import_source = 'orders_csv').
  Uso:
    DST_URL=... DST_SERVICE_ROLE=... node scripts/send-magic-links.js
*/

const { createClient } = require('@supabase/supabase-js');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const url = process.env.DST_URL;
  const key = process.env.DST_SERVICE_ROLE;
  if (!url || !key) {
    console.error('ERRO: defina DST_URL e DST_SERVICE_ROLE para enviar magic links.');
    process.exit(1);
  }
  const supa = createClient(url, key);

  // Coletar todos os usuários alvo primeiro
  const all = [];
  let page = 1; const perPage = 1000;
  while (true) {
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users || [];
    if (!users.length) break;
    all.push(...users);
    if (users.length < perPage) break;
    page++;
  }

  const pending = all.filter(u => u.user_metadata?.import_source === 'orders_csv' && !u.user_metadata?.magic_sent_at);
  const rate = Number(process.env.RATE_PER_MINUTE || 12); // seguro: ~12/min
  const interval = Math.ceil(60000 / Math.max(1, rate));
  let sent = 0; let failed = 0; let idx = 0;
  for (const u of pending) {
    idx++;
    try {
      const base = process.env.APP_URL || process.env.SITE_URL || 'http://localhost:3000';
      const { error: e } = await supa.auth.signInWithOtp({
        email: u.email,
        options: {
          emailRedirectTo: `${base}/auth/callback?next=/`,
        },
      });
      if (e) {
        failed++;
        console.error('Falha ao enviar magic link para', u.email, e.message);
      } else {
        sent++;
        // marcar metadata para evitar reenvio
        await supa.auth.admin.updateUserById(u.id, {
          user_metadata: { ...(u.user_metadata||{}), magic_sent_at: new Date().toISOString() }
        });
      }
    } catch (err) {
      failed++;
      console.error('Exceção ao enviar magic link para', u.email, err?.message || err);
    }
    if (idx < pending.length) {
      await sleep(interval);
    }
  }

  console.log('Envio concluído', { sent, failed, totalPending: pending.length, ratePerMinute: rate });
}

main().catch((e)=>{ console.error(e); process.exit(1); });


