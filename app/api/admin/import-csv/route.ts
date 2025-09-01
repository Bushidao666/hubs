import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'

const EDGE_URL = process.env.HUB_EDGE_IMPORT_URL || `${process.env.NEXT_PUBLIC_HUB_SUPABASE_URL}/functions/v1/admin-import-members`
const EDGE_KEY = process.env.HUB_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  try {
    if (!EDGE_KEY) return NextResponse.json({ error: 'missing EDGE KEY' }, { status: 500 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const dryRun = (formData.get('dry_run') as string | null) === 'true'

    if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 })

    const text = await file.text()
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
    if (parsed.errors?.length) {
      return NextResponse.json({ error: 'csv parse error', details: parsed.errors }, { status: 400 })
    }

    // Auto-detecção de colunas
    const fields = (parsed.meta as any)?.fields?.map((f: string) => f?.toString()) || []
    const toKey = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
    const candidates = fields.map((f: string) => ({ raw: f, key: toKey(f) }))

    const pick = (keys: string[]): string | null => {
      const found = candidates.find(c => keys.includes(c.key))
      return found?.raw || null
    }

    const emailCol = pick(['email','emailemail','useremail','emailaddress'])
    const nameCol = pick(['fullname','name','displayname','nome','username'])
    const firstCol = pick(['firstname','first','nome','primeironome'])
    const lastCol = pick(['lastname','last','sobrenome'])
    const phoneCol = pick(['phone','phonenumber','telefone','celular','mobile','whatsapp','contactnumber'])
    const grantsCol = pick(['grants','acessos','acesso','apps','permissoes','roles','tiers','planos'])

    if (!emailCol) {
      return NextResponse.json({ error: 'email column not detected', headers: fields }, { status: 400 })
    }

    const normalizePhone = (v: any) => {
      if (!v) return null
      const s = String(v)
      const digits = s.replace(/[^0-9+]/g, '')
      return digits || null
    }

    const rows = (parsed.data as any[])
    const normalized = rows.map((r) => {
      const email = (r[emailCol] || '').toString().trim().toLowerCase()
      let full_name = r[nameCol] || ''
      if (!full_name && (firstCol || lastCol)) {
        full_name = [r[firstCol || ''] || '', r[lastCol || ''] || ''].filter(Boolean).join(' ').trim()
      }
      const phone = phoneCol ? normalizePhone(r[phoneCol]) : null
      const grants = grantsCol ? (r[grantsCol] || '').toString() : undefined
      return { ...r, email, full_name, phone, grants }
    })

    const mapping = { email: emailCol, full_name: nameCol || `${firstCol || ''}+${lastCol || ''}`, phone: phoneCol, grants: grantsCol }

    const payload = {
      items: normalized,
      dry_run: dryRun,
      mapping,
      headers: fields,
    }

    const resp = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${EDGE_KEY}` },
      body: JSON.stringify(payload),
    })

    const bodyText = await resp.text()
    let edgeJson: any = null
    try { edgeJson = JSON.parse(bodyText) } catch {}
    const responseJson = edgeJson ? {
      ...edgeJson,
      mappingDetected: mapping,
      headers: fields,
      sample: normalized.slice(0, 10),
    } : {
      raw: bodyText,
      mappingDetected: mapping,
      headers: fields,
      sample: normalized.slice(0, 10),
    }
    return NextResponse.json(responseJson, { status: resp.status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unexpected' }, { status: 500 })
  }
}
