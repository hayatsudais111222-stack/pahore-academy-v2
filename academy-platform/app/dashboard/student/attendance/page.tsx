'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'

type Status = 'present'|'absent'|'half_day'|'leave'
const S = {
  present:  {label:'Present',  color:'#1B6B38', bg:'#E6F4EA', icon:'✅'},
  absent:   {label:'Absent',   color:'#C53030', bg:'#FEE2E2', icon:'❌'},
  half_day: {label:'Half Day', color:'#92400E', bg:'#FEF3C7', icon:'🕐'},
  leave:    {label:'Leave',    color:'#5B21B6', bg:'#EDE9FE', icon:'📋'},
}

interface AttRecord { date:string; status:Status; note:string }

export default function StudentAttendancePage() {
  const { userId } = useAuthStore()
  const [records, setRecords] = useState<AttRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'week'|'month'|'year'>('month')

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const now = new Date()
      let from = ''
      if (filter==='week')  from = new Date(now.setDate(now.getDate()-7)).toISOString().split('T')[0]
      if (filter==='month') from = new Date(new Date().setDate(1)).toISOString().split('T')[0]
      if (filter==='year')  from = new Date(new Date().getFullYear(),0,1).toISOString().split('T')[0]
      let q = supabase.from('attendance').select('date,status,note').eq('user_id',userId).order('date',{ascending:false})
      if (from) q = q.gte('date', from)
      const { data } = await q
      setRecords(data || [])
      setLoading(false)
    }
    load()
  }, [userId, filter])

  const stats = Object.fromEntries(Object.keys(S).map(k=>[k, records.filter(r=>r.status===k).length]))
  const pct = records.length ? Math.round(records.filter(r=>r.status==='present').length/records.length*100) : 0
  const today = records.find(r=>r.date===new Date().toISOString().split('T')[0])

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar/><Topbar title="My Attendance" subtitle="Your attendance history"/>
      <main style={{marginLeft:260,paddingTop:66}}>
        <div style={{padding:28}}>
          {/* Today status */}
          <div style={{background:today?S[today.status].bg:'#FEE2E2',border:`1px solid ${today?S[today.status].color:'#C53030'}44`,borderRadius:18,padding:'20px 24px',marginBottom:20,display:'flex',alignItems:'center',gap:16}}>
            <div style={{fontSize:40}}>{today?S[today.status].icon:'❓'}</div>
            <div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,color:'#0D1B35'}}>Today&apos;s Status</div>
              <div style={{fontSize:15,fontWeight:700,color:today?S[today.status].color:'#C53030',marginTop:3}}>{today?S[today.status].label:'Not Marked Yet'}</div>
              {today?.note&&<div style={{fontSize:12,color:'#6B7A99',marginTop:3}}>{today.note}</div>}
            </div>
            <div style={{marginLeft:'auto',textAlign:'center',background:'linear-gradient(135deg,#1B3A7A,#2349A0)',borderRadius:14,padding:'16px 24px',boxShadow:'0 4px 16px rgba(27,58,122,.25)'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:32,fontWeight:700,color:'#F5C842'}}>{pct}%</div>
              <div style={{color:'rgba(255,255,255,.7)',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>Attendance Rate</div>
            </div>
          </div>

          {/* Filter + stats */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            {(['week','month','year','all'] as const).map(f=>(
              <button key={f} className={`chip${filter===f?' active':''}`} onClick={()=>setFilter(f)} style={{textTransform:'capitalize'}}>{f==='all'?'All Time':f==='week'?'This Week':f==='month'?'This Month':'This Year'}</button>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {Object.entries(S).map(([k,c])=>(
              <div key={k} style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:16,padding:'16px',textAlign:'center',boxShadow:'0 2px 8px rgba(27,58,122,.06)'}}>
                <div style={{fontSize:24,marginBottom:6}}>{c.icon}</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:700,color:c.color}}>{stats[k]||0}</div>
                <div style={{color:'#6B7A99',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Records */}
          <div style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 12px rgba(27,58,122,.06)'}}>
            {loading ? (
              <div style={{padding:24}}>{[...Array(5)].map((_,i)=><div key={i} className="skeleton" style={{height:48,marginBottom:8,borderRadius:10}}/>)}</div>
            ) : records.length===0 ? (
              <div style={{textAlign:'center',padding:'60px 24px',color:'#6B7A99'}}>
                <div style={{fontSize:48,marginBottom:12}}>📋</div>
                <p>No attendance records found</p>
              </div>
            ) : (
              <table className="marks-table">
                <thead><tr><th>Date</th><th>Day</th><th>Status</th><th>Note</th></tr></thead>
                <tbody>
                  {records.map(r=>{
                    const c=S[r.status]
                    const d=new Date(r.date)
                    return(
                      <tr key={r.date}>
                        <td style={{fontFamily:'JetBrains Mono,monospace',fontWeight:600}}>{r.date}</td>
                        <td style={{color:'#6B7A99'}}>{d.toLocaleDateString('en-PK',{weekday:'long'})}</td>
                        <td><span style={{background:c.bg,color:c.color,padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,display:'inline-flex',alignItems:'center',gap:5}}>{c.icon} {c.label}</span></td>
                        <td style={{color:'#6B7A99',fontSize:13}}>{r.note||'—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
