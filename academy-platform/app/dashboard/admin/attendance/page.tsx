'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

type Status = 'present'|'absent'|'half_day'|'leave'
const S = {
  present:  {label:'Present',  color:'#1B6B38', bg:'#E6F4EA', icon:'✅'},
  absent:   {label:'Absent',   color:'#C53030', bg:'#FEE2E2', icon:'❌'},
  half_day: {label:'Half Day', color:'#92400E', bg:'#FEF3C7', icon:'🕐'},
  leave:    {label:'Leave',    color:'#5B21B6', bg:'#EDE9FE', icon:'📋'},
}

interface AttRow { id:string; full_name:string; class:string; roll_number:string|null; status:Status; note:string; type:'student'|'teacher' }

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttRow[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [filterClass, setFilterClass] = useState('all')
  const [filterType, setFilterType] = useState<'all'|'student'|'teacher'>('all')
  const [filterStatus, setFilterStatus] = useState<'all'|Status>('all')
  const [search, setSearch] = useState('')
  const [classes, setClasses] = useState<string[]>([])

  const load = async () => {
    setLoading(true)
    const { data: att } = await supabase
      .from('attendance')
      .select('user_id, status, note, user_type, class, date')
      .eq('date', date)

    if (!att || att.length === 0) {
      // No attendance for this date
      const { data: profiles } = await supabase.from('profiles').select('id,full_name,class').order('full_name')
      const { data: studentData } = await supabase.from('students').select('id,roll_number')
      const rollMap: Record<string,string|null> = {}
      studentData?.forEach((s:{id:string;roll_number:string|null}) => { rollMap[s.id] = s.roll_number })
      const rows: AttRow[] = (profiles||[]).map((p:{id:string;full_name:string;class:string}) => ({
        id:p.id, full_name:p.full_name||'Unknown', class:p.class||'—',
        roll_number:rollMap[p.id]||null, status:'absent' as Status, note:'', type:'student',
      }))
      setRecords(rows)
      setClasses([...new Set(rows.map(r=>r.class).filter(c=>c!=='—'))].sort())
      setLoading(false)
      return
    }

    const uids = att.map((a:{user_id:string})=>a.user_id)
    const { data: profiles } = await supabase.from('profiles').select('id,full_name,class').in('id', uids)
    const { data: studentData } = await supabase.from('students').select('id,roll_number')
    const rollMap: Record<string,string|null> = {}
    studentData?.forEach((s:{id:string;roll_number:string|null}) => { rollMap[s.id] = s.roll_number })
    const profileMap: Record<string,{full_name:string;class:string}> = {}
    profiles?.forEach((p:{id:string;full_name:string;class:string}) => { profileMap[p.id] = {full_name:p.full_name,class:p.class} })

    const rows: AttRow[] = att.map((a:{user_id:string;status:Status;note:string;user_type:string;class:string}) => ({
      id: a.user_id,
      full_name: profileMap[a.user_id]?.full_name || 'Unknown',
      class: a.class || profileMap[a.user_id]?.class || '—',
      roll_number: rollMap[a.user_id] || null,
      status: a.status,
      note: a.note || '',
      type: a.user_type as 'student'|'teacher',
    }))
    setRecords(rows)
    setClasses([...new Set(rows.map(r=>r.class).filter(c=>c!=='—'))].sort())
    setLoading(false)
  }

  useEffect(() => { load() }, [date])

  const filtered = records.filter(r => {
    const mc = filterClass==='all'||r.class===filterClass
    const mt = filterType==='all'||r.type===filterType
    const ms = filterStatus==='all'||r.status===filterStatus
    const mq = !search||r.full_name.toLowerCase().includes(search.toLowerCase())||(r.roll_number||'').includes(search)
    return mc&&mt&&ms&&mq
  })

  const stats = Object.fromEntries(Object.keys(S).map(k=>[k, filtered.filter(r=>r.status===k).length]))
  const pct = filtered.length ? Math.round(filtered.filter(r=>r.status==='present').length/filtered.length*100) : 0

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar/>
      <Topbar title="Attendance Overview" subtitle="View and manage all attendance records"/>
      <main style={{marginLeft:260,paddingTop:66}}>
        <div style={{padding:28}}>

          {/* Controls */}
          <div className="card" style={{marginBottom:20,display:'flex',gap:16,flexWrap:'wrap',alignItems:'flex-end'}}>
            <div>
              <label className="label">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input-field" style={{width:180}}/>
            </div>
            <div>
              <label className="label">Type</label>
              <div style={{display:'flex',gap:6}}>
                {(['all','student','teacher'] as const).map(t=>(
                  <button key={t} className={`chip${filterType===t?' active':''}`} onClick={()=>setFilterType(t)} style={{textTransform:'capitalize'}}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{flex:1}}>
              <label className="label">Class</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <button className={`chip${filterClass==='all'?' active':''}`} onClick={()=>setFilterClass('all')}>All</button>
                {classes.slice(0,8).map(c=><button key={c} className={`chip${filterClass===c?' active':''}`} onClick={()=>setFilterClass(c)}>{c}</button>)}
              </div>
            </div>
          </div>

          {/* Stats + attendance % */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:20}}>
            {Object.entries(S).map(([k,c])=>(
              <div key={k} onClick={()=>setFilterStatus(filterStatus===k?'all':k as Status)}
                style={{background:'#fff',border:`1.5px solid ${filterStatus===k?c.color:'#DDE3F0'}`,borderRadius:16,padding:'16px 18px',textAlign:'center',cursor:'pointer',transition:'all .25s',boxShadow:filterStatus===k?`0 4px 20px ${c.color}33`:'0 2px 8px rgba(27,58,122,.06)'}}>
                <div style={{fontSize:24,marginBottom:6}}>{c.icon}</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:700,color:c.color}}>{stats[k]||0}</div>
                <div style={{color:'#6B7A99',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>{c.label}</div>
              </div>
            ))}
            <div style={{background:'linear-gradient(135deg,#1B3A7A,#2349A0)',borderRadius:16,padding:'16px 18px',textAlign:'center',boxShadow:'0 4px 20px rgba(27,58,122,.25)'}}>
              <div style={{fontSize:24,marginBottom:6}}>📈</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:700,color:'#F5C842'}}>{pct}%</div>
              <div style={{color:'rgba(255,255,255,.7)',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>Attendance Rate</div>
            </div>
          </div>

          {/* Search */}
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..." className="input-field" style={{flex:1,minWidth:200}}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {Object.entries(S).map(([k,c])=>(
                <button key={k} onClick={()=>setFilterStatus(filterStatus===k?'all':k as Status)}
                  style={{padding:'7px 12px',borderRadius:9,border:`1.5px solid ${filterStatus===k?c.color:'transparent'}`,cursor:'pointer',background:filterStatus===k?c.bg:'#fff',color:filterStatus===k?c.color:'#6B7A99',fontSize:11,fontWeight:700,transition:'all .2s'}}>
                  {c.icon} {c.label} ({stats[k]||0})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 12px rgba(27,58,122,.06)'}}>
            {loading ? (
              <div style={{padding:24}}>{[...Array(6)].map((_,i)=><div key={i} className="skeleton" style={{height:52,marginBottom:8,borderRadius:10}}/>)}</div>
            ) : filtered.length===0 ? (
              <div style={{textAlign:'center',padding:'60px 24px',color:'#6B7A99'}}>
                <div style={{fontSize:48,marginBottom:12}}>📋</div>
                <p style={{fontSize:14}}>No attendance records for {formatDate(date)}</p>
                <p style={{fontSize:12,marginTop:6}}>Use the Teacher Attendance page to mark attendance</p>
              </div>
            ) : (
              <table className="marks-table">
                <thead><tr><th>#</th><th>Name</th><th>Type</th><th>Class</th><th>Roll</th><th>Status</th><th>Note</th><th>Action</th></tr></thead>
                <tbody>
                  {filtered.map((r,i)=>{
                    const c=S[r.status]
                    return(
                      <tr key={r.id}>
                        <td style={{color:'#9AA5B4',fontSize:12}}>{i+1}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:32,height:32,borderRadius:'50%',background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',color:c.color,fontWeight:800,fontSize:13,flexShrink:0}}>{r.full_name[0]}</div>
                            <span style={{fontWeight:600,color:'#0D1B35',fontSize:14}}>{r.full_name}</span>
                          </div>
                        </td>
                        <td><span className={r.type==='student'?'badge-student':'badge-teacher'}>{r.type}</span></td>
                        <td><span style={{background:'#EEF2FF',color:'#1B3A7A',padding:'3px 10px',borderRadius:6,fontSize:12,fontWeight:600}}>{r.class}</span></td>
                        <td style={{fontFamily:'JetBrains Mono,monospace',color:'#9AA5B4',fontSize:12}}>{r.roll_number||'—'}</td>
                        <td><span style={{background:c.bg,color:c.color,padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,display:'inline-flex',alignItems:'center',gap:5}}>{c.icon} {c.label}</span></td>
                        <td style={{color:'#6B7A99',fontSize:12}}>{r.note||'—'}</td>
                        <td>
                          <Link href={`/dashboard/admin/students/${r.id}`} style={{padding:'5px 12px',borderRadius:8,background:'#EEF2FF',color:'#1B3A7A',textDecoration:'none',fontSize:12,fontWeight:700,transition:'all .2s'}}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#1B3A7A';(e.currentTarget as HTMLElement).style.color='#fff'}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#EEF2FF';(e.currentTarget as HTMLElement).style.color='#1B3A7A'}}>
                            View Profile →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={{marginTop:12,color:'#6B7A99',fontSize:12}}>Showing {filtered.length} records for {formatDate(date)}</div>
        </div>
      </main>
    </div>
  )
}
