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

  let page = 1;
  const perPage = 1000;
  let sent = 0;
  let failed = 0;

  while (true) {
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const batch = data.users || [];
    if (batch.length === 0) break;

    const targets = batch.filter(u => (u.user_metadata?.import_source === 'orders_csv'));
    for (const u of targets) {
      try {
        const { error: e } = await supa.auth.signInWithOtp({
          email: u.email,
          options: {
            // redirectTo: process.env.MAGIC_REDIRECT_TO || undefined,
          }
        });
        if (e) {
          failed++;
          console.error('Falha ao enviar magic link para', u.email, e.message);
        } else {
          sent++;
        }
      } catch (err) {
        failed++;
        console.error('Exceção ao enviar magic link para', u.email, err?.message || err);
      }
      // Pausa curta para evitar burst
      await sleep(75);
    }

    if (batch.length < perPage) break;
    page++;
  }

  console.log('Envio concluído', { sent, failed });
}

main().catch((e)=>{ console.error(e); process.exit(1); });


