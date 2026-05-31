import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('student_id')

    let query = supabase
      .from('test_results')
      .select('*')
      .order('date', { ascending: false })

    if (studentId) query = query.eq('student_id', studentId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ marks: data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { data, error } = await supabase.from('test_results').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ mark: data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
