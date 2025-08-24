import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = process.env.FEEDBACK_WEBHOOK_URL
const WEBHOOK_SECRET = process.env.FEEDBACK_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, app_slug, severity, title, description, metadata } = body || {}

    if (!type || !title || !description) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    // forward to webhook if configured
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(WEBHOOK_SECRET ? { Authorization: `Bearer ${WEBHOOK_SECRET}` } : {}),
        },
        body: JSON.stringify({ type, app_slug, severity, title, description, metadata }),
      }).catch(()=>undefined)
    }

    // also save in DB via RPC
    const hubUrl = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string
    const hubKey = process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string

    const resp = await fetch(`${hubUrl}/rest/v1/rpc/hub_create_bug_report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: hubKey },
      body: JSON.stringify({ p_type: type, p_app_slug: app_slug, p_severity: severity, p_title: title, p_description: description, p_metadata: metadata || {} })
    })

    const data = await resp.json()
    return NextResponse.json({ ok: true, ticket: data?.id || null })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unexpected' }, { status: 500 })
  }
}
