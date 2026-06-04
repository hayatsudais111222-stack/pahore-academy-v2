'use client'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Status = 'present'|'absent'|'half_day'|'leave'
interface StudentRow { id:string; full_name:string; class:string; roll_number:string|null; status:Status; note:string }

const S = {
  present:  {label:'Present',  color:'#1B6B38', bg:'#E6F4EA', icon:'✅'},
  absent:   {label:'Absent',   color:'#C53030', bg:'#FEE2E2', icon:'❌'},
  half_day: {label:'Half Day', color:'#92400E', bg:'#FEF3C7', icon:'🕐'},
  leave:    {label:'Leave',    color:'#5B21B6', bg:'#EDE9FE', icon:'📋'},
}

export default function TeacherAttendancePage() {
  const { userId } = useAuthStore()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [filterClass, setFilterClass] = useState('all')
  const [classes, setClasses] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: profiles }, { data: studentData }, { data: existing }] = await Promise.all([
      supabase.from('profiles').select('id,full_name,class').order('full_name'),
      supabase.from('students').select('id,roll_number').eq('is_active', true),
      supabase.from('attendance').select('user_id,status,note').eq('date', date).eq('user_type','student'),
    ])
    const rollMap: Record<string,string|null> = {}
    studentData?.forEach((s:{id:string;roll_number:string|null}) => { rollMap[s.id] = s.roll_number })
    const existMap: Record<string,{status:Status;note:string}> = {}
    existing?.forEach((a:{user_id:string;status:Status;note:string}) => { existMap[a.user_id] = {status:a.status, note:a.note||''} })
    const rows: StudentRow[] = (profiles||[]).map((p:{id:string;full_name:string;class:string}) => ({
      id:p.id, full_name:p.full_name||'Unknown', class:p.class||'—',
      roll_number:rollMap[p.id]||null,
      status:existMap[p.id]?.status||'present',
      note:existMap[p.id]?.note||'',
    }))
    setStudents(rows)
    setClasses([...new Set(rows.map(r=>r.class).filter(c=>c!=='—'))].sort())
    setLoading(false)
  }, [date])

  useEffect(() => { load() }, [load])

  const setStatus = (id:string, status:Status) => setStudents(p=>p.map(s=>s.id===id?{...s,status}:s))
  const setNote   = (id:string, note:string)   => setStudents(p=>p.map(s=>s.id===id?{...s,note}:s))
  const markAll   = (status:Status) => { setStudents(p=>p.map(s=>({...s,status}))); toast.success(`All → ${S[status].label}`) }

  const save = async () => {
    if(!userId) return
    setSaving(true)
    const list = filtered.map(s=>({ user_id:s.id, marked_by:userId, date, status:s.status, note:s.note||null, user_type:'student', class:s.class }))
    const {error} = await supabase.from('attendance').upsert(list,{onConflict:'user_id,date'})
    if(error){ toast.error(error.message); setSaving(false); return }
    toast.success(`✅ Saved for ${list.length} students!`)
    setSaving(false)
  }

  const filtered = students.filter(s=>{
    const mc = filterClass==='all'||s.class===filterClass
    const ms = !search||s.full_name.toLowerCase().includes(search.toLowerCase())||(s.roll_number||'').includes(search)
    return mc&&ms
  })
  const stats = Object.fromEntries(Object.keys(S).map(k=>[k, filtered.filter(s=>s.status===k).length]))

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar/>
      <Topbar title="Student Attendance" subtitle="Mark daily attendance"/>
      <main style={{marginLeft:260,paddingTop:66}}>
        <div style={{padding:28}}>

          {/* Controls */}
          <div className="card" style={{marginBottom:20,display:'flex',gap:16,flexWrap:'wrap',alignItems:'flex-end'}}>
            <div>
              <label className="label">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input-field" style={{width:180}}/>
            </div>
            <div style={{flex:1}}>
              <label className="label">Class</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <button className={`chip${filterClass==='all'?' active':''}`} onClick={()=>setFilterClass('all')}>All</button>
                {classes.map(c=><button key={c} className={`chip${filterClass===c?' active':''}`} onClick={()=>setFilterClass(c)}>{c}</button>)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {Object.entries(S).map(([k,c])=>(
              <div key={k} onClick={()=>markAll(k as Status)} style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:16,padding:'18px 20px',textAlign:'center',cursor:'pointer',transition:'all .25s',boxShadow:'0 2px 8px rgba(27,58,122,.06)'}}>
                <div style={{fontSize:28,marginBottom:8}}>{c.icon}</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:32,fontWeight:700,color:c.color}}>{stats[k]}</div>
                <div style={{color:'#6B7A99',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginTop:3}}>{c.label}</div>
                <div style={{fontSize:10,color:'#9AA5B4',marginTop:4}}>Click to mark all</div>
              </div>
            ))}
          </div>

          {/* Search + quick mark */}
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..." className="input-field" style={{flex:1,minWidth:200}}/>
            {Object.entries(S).map(([k,c])=>(
              <button key={k} onClick={()=>markAll(k as Status)} style={{padding:'7px 14px',borderRadius:9,border:'none',cursor:'pointer',background:c.bg,color:c.color,fontSize:12,fontWeight:700,transition:'all .2s'}}>
                {c.icon} All {c.label}
              </button>
            ))}
          </div>

          {/* Sheet */}
          <div style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 12px rgba(27,58,122,.06)'}}>
            {loading ? (
              <div style={{padding:24}}>{[...Array(5)].map((_,i)=><div key={i} className="skeleton" style={{height:56,marginBottom:8,borderRadius:10}}/>)}</div>
            ) : filtered.length===0 ? (
              <div style={{textAlign:'center',padding:'60px 24px',color:'#6B7A99'}}>
                <div style={{fontSize:48,marginBottom:12}}>👥</div>
                <p>No students found</p>
              </div>
            ) : (
              <div style={{overflowX:'auto'}}>
                <table className="marks-table">
                  <thead><tr><th>#</th><th>Student</th><th>Roll</th><th>Class</th><th>Status</th><th>Note</th></tr></thead>
                  <tbody>
                    {filtered.map((s,i)=>{
                      const c=S[s.status]
                      return(
                        <tr key={s.id}>
                          <td style={{color:'#9AA5B4',fontSize:12}}>{i+1}</td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <div style={{width:32,height:32,borderRadius:'50%',background:c.bg,border:`2px solid ${c.color}44`,display:'flex',alignItems:'center',justifyContent:'center',color:c.color,fontWeight:800,fontSize:13,flexShrink:0}}>{s.full_name[0]}</div>
                              <span style={{fontWeight:600,color:'#0D1B35'}}>{s.full_name}</span>
                            </div>
                          </td>
                          <td style={{fontFamily:'JetBrains Mono,monospace',color:'#9AA5B4',fontSize:12}}>{s.roll_number||'—'}</td>
                          <td><span style={{background:'#EEF2FF',color:'#1B3A7A',padding:'3px 10px',borderRadius:6,fontSize:12,fontWeight:600}}>{s.class}</span></td>
                          <td>
                            <div style={{display:'flex',gap:5}}>
                              {Object.entries(S).map(([k,c])=>(
                                <button key={k} onClick={()=>setStatus(s.id,k as Status)} style={{padding:'5px 10px',borderRadius:8,border:`1.5px solid ${s.status===k?c.color:'transparent'}`,cursor:'pointer',background:s.status===k?c.bg:'#F7F9FF',color:s.status===k?c.color:'#9AA5B4',fontSize:11,fontWeight:700,transition:'all .15s',transform:s.status===k?'scale(1.06)':'scale(1)'}}>
                                  {c.icon} {c.label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td><input type="text" value={s.note} onChange={e=>setNote(s.id,e.target.value)} placeholder="Note..." className="input-field" style={{fontSize:12,padding:'6px 10px',minWidth:140}}/></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:12,alignItems:'center'}}>
            <span style={{background:'#EEF2FF',borderRadius:10,padding:'9px 16px',fontSize:13,color:'#1B3A7A',fontWeight:600}}>{filtered.length} students · {date}</span>
            <button onClick={save} disabled={saving} className="btn-primary" style={{padding:'12px 32px',opacity:saving?.7:1}}>
              {saving?'⏳ Saving...':'💾 Save Attendance'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
