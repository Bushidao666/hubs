#!/usr/bin/env node
/*
  Usage:
    node scripts/import-master-users.js "orders (1) (2).csv"          # Dry-run (não cria usuários)
    DO_IMPORT=1 DST_URL=... DST_SERVICE_ROLE=... node scripts/import-master-users.js "orders (1) (2).csv"
*/

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const DO_IMPORT = process.env.DO_IMPORT === '1' || process.env.DO_IMPORT === 'true';

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('ERRO: informe o caminho do CSV como primeiro argumento.');
    process.exit(1);
  }

  const abs = path.resolve(csvPath);
  if (!fs.existsSync(abs)) {
    console.error(`ERRO: arquivo não encontrado: ${abs}`);
    process.exit(1);
  }

  const csv = fs.readFileSync(abs, 'utf8');
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  // Filtrar ofertas contendo "Acesso Master"
  const masters = records.filter(r =>
    (r.offer || '').toLowerCase().includes('acesso master')
  );

  // Deduplicar por email, ignorando vazios
  const emailKey = 'customer_email_address';
  const seen = new Set();
  const users = [];
  for (const r of masters) {
    const email = (r[emailKey] || '').trim();
    if (!email) continue;
    if (seen.has(email.toLowerCase())) continue;
    seen.add(email.toLowerCase());
    users.push({
      email,
      name: (r.customer_name || '').trim() || email.split('@')[0],
      phone: (r.customer_phone_number || '').trim() || null,
      doc: (r.customer_document || '').trim() || null,
      offer: r.offer,
    });
  }

  console.log(`Total de linhas no CSV: ${records.length}`);
  console.log(`Filtradas como "Acesso Master": ${masters.length}`);
  console.log(`Usuários únicos por e-mail: ${users.length}`);

  if (!DO_IMPORT) {
    console.log('Dry-run concluído. Exemplo do primeiro usuário:');
    console.log(users[0] || {});
    return;
  }

  const DST_URL = process.env.DST_URL;
  const DST_SERVICE_ROLE = process.env.DST_SERVICE_ROLE;
  if (!DST_URL || !DST_SERVICE_ROLE) {
    console.error('ERRO: defina DST_URL e DST_SERVICE_ROLE no ambiente para importar.');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const supa = createClient(DST_URL, DST_SERVICE_ROLE);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Import simples: tenta criar; se já existir, ignora
  for (const u of users) {
    try {
      const payload = {
        email: u.email,
        email_confirm: true,
        user_metadata: {
          full_name: u.name,
          import_source: 'orders_csv',
          import_offer: u.offer,
          phone: u.phone || undefined,
          document: u.doc || undefined,
        },
      };
      const { data, error } = await supa.auth.admin.createUser(payload);
      if (error) {
        // Se já existir, considerar como skipped
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('exists')) {
          skipped++;
        } else {
          errors++;
          console.error(`Erro ao criar ${u.email}:`, error.message);
        }
      } else {
        created++;
      }
    } catch (e) {
      errors++;
      console.error(`Exceção ao criar ${u.email}:`, e?.message || e);
    }
  }

  console.log('Importação finalizada:', { created, skipped, errors });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


