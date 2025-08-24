import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string
const BUCKET = 'banners'

export async function POST(req: NextRequest) {
  try {
    if (!HUB_URL || !HUB_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'missing hub envs' }, { status: 500 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 })

    const supabase = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

    // Garantir bucket
    await supabase.storage.createBucket(BUCKET, { public: true }).catch(()=> undefined)

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const ext = file.type.split('/')[1] || 'png'
    const name = file.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || `banner.${ext}`
    const objectPath = `${Date.now()}_${Math.random().toString(36).slice(2)}_${name}`

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
      contentType: file.type || 'image/*',
      upsert: false,
    })
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
    return NextResponse.json({ ok: true, path: objectPath, public_url: data.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unexpected' }, { status: 500 })
  }
}
