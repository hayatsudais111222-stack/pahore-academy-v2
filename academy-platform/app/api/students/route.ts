import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const className = searchParams.get('class')
    const search = searchParams.get('search')

    let query = supabase
      .from('profiles')
      .select(`*, students(*), roles(role)`)
      .order('full_name')

    if (className) query = query.eq('class', className)
    if (search) query = query.ilike('full_name', `%${search}%`)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ students: data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
