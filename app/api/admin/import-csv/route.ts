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

    const payload = {
      items: parsed.data,
      dry_run: dryRun,
    }

    const resp = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${EDGE_KEY}` },
      body: JSON.stringify(payload),
    })

    const body = await resp.text()
    return new NextResponse(body, { status: resp.status, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unexpected' }, { status: 500 })
  }
}
