'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import { gradeColor, gradeLabel, formatDate } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

type Status = 'present'|'absent'|'half_day'|'leave'
const S = {
  present:  {label:'Present',  color:'#1B6B38', bg:'#E6F4EA', icon:'✅'},
  absent:   {label:'Absent',   color:'#C53030', bg:'#FEE2E2', icon:'❌'},
  half_day: {label:'Half Day', color:'#92400E', bg:'#FEF3C7', icon:'🕐'},
  leave:    {label:'Leave',    color:'#5B21B6', bg:'#EDE9FE', icon:'📋'},
}

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Record<string,string|number|string[]|null>>({})
  const [marks, setMarks] = useState<{subject:string;test_name:string;date:string;obtained_marks:number;total_marks:number;percentage:number;remarks:string}[]>([])
  const [attendance, setAttendance] = useState<{date:string;status:Status;note:string}[]>([])
  const [attFilter, setAttFilter] = useState<'week'|'month'|'year'|'all'>('month')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'marks'|'attendance'>('overview')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const [{ data: p }, { data: m }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('test_results').select('*').eq('student_id', id).order('date',{ascending:false}),
        supabase.from('students').select('*').eq('id', id).single(),
      ])
      setProfile({...(p||{}), ...(s||{})})
      setMarks(m||[])
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!id) return
    const loadAtt = async () => {
      const now = new Date()
      let from = ''
      if (attFilter==='week')  from = new Date(new Date().setDate(now.getDate()-7)).toISOString().split('T')[0]
      if (attFilter==='month') from = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      if (attFilter==='year')  from = `${new Date().getFullYear()}-01-01`
      let q = supabase.from('attendance').select('date,status,note').eq('user_id',id).order('date',{ascending:false})
      if (from) q = q.gte('date', from)
      const { data } = await q
      setAttendance(data||[])
    }
    loadAtt()
  }, [id, attFilter])

  const avg = marks.length ? +(marks.reduce((s,m)=>s+m.percentage,0)/marks.length).toFixed(1) : 0
  const attPct = attendance.length ? Math.round(attendance.filter(a=>a.status==='present').length/attendance.length*100) : 0
  const chartData = [...marks].reverse().slice(-8).map(m=>({name:m.subject.slice(0,4), score:+m.percentage.toFixed(1)}))

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar/><Topbar title="Student Profile"/>
      <main style={{marginLeft:260,paddingTop:66,padding:'94px 28px 28px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:20}}>
          <div className="skeleton" style={{height:400,borderRadius:18}}/>
          <div className="skeleton" style={{height:400,borderRadius:18}}/>
        </div>
      </main>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar/><Topbar title="Student Profile" subtitle={(profile.full_name as string)||''}/>
      <main style={{marginLeft:260,paddingTop:66}}>
        <div style={{padding:28}}>

          {/* Back */}
          <Link href="/dashboard/admin/students" style={{display:'inline-flex',alignItems:'center',gap:6,color:'#1B3A7A',textDecoration:'none',fontSize:13,fontWeight:600,marginBottom:20,background:'#EEF2FF',padding:'7px 14px',borderRadius:9}}>
            ← Back to Students
          </Link>

          {/* Profile header */}
          <div style={{background:'linear-gradient(135deg,#0C1F5C,#1B3A7A,#2349A0)',borderRadius:22,padding:'28px',marginBottom:20,position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(27,58,122,.28)'}}>
            <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.05)',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:20,position:'relative',zIndex:1,flexWrap:'wrap'}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.18)',border:'2.5px solid rgba(245,200,66,.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:800,color:'#F5C842',fontFamily:'Playfair Display,serif',flexShrink:0}}>
                {(profile.full_name as string)?.[0]||'?'}
              </div>
              <div style={{flex:1}}>
                <h2 style={{fontFamily:'Playfair Display,serif',fontSize:24,fontWeight:700,color:'#fff',margin:'0 0 4px'}}>{profile.full_name as string}</h2>
                <p style={{color:'rgba(255,255,255,.7)',fontSize:13,margin:0}}>{profile.class as string} · {profile.board as string} Board · Roll: {profile.roll_number as string || 'N/A'}</p>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <span className="badge-student">Student</span>
                  {profile.is_active ? <span style={{background:'#E6F4EA',color:'#1B6B38',padding:'3px 12px',borderRadius:999,fontSize:11,fontWeight:700}}>Active</span> : <span style={{background:'#FEE2E2',color:'#C53030',padding:'3px 12px',borderRadius:999,fontSize:11,fontWeight:700}}>Inactive</span>}
                </div>
              </div>
              <div style={{display:'flex',gap:12}}>
                <div style={{textAlign:'center',background:'rgba(255,255,255,.1)',borderRadius:14,padding:'14px 20px'}}>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#F5C842'}}>{avg}%</div>
                  <div style={{color:'rgba(255,255,255,.6)',fontSize:10,textTransform:'uppercase',letterSpacing:'.1em'}}>Avg Score</div>
                </div>
                <div style={{textAlign:'center',background:'rgba(255,255,255,.1)',borderRadius:14,padding:'14px 20px'}}>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#F5C842'}}>{attPct}%</div>
                  <div style={{color:'rgba(255,255,255,.6)',fontSize:10,textTransform:'uppercase',letterSpacing:'.1em'}}>Attendance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            {(['overview','marks','attendance'] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 22px',borderRadius:11,cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:14,transition:'all .2s',textTransform:'capitalize',
                background:tab===t?'linear-gradient(135deg,#1B3A7A,#2349A0)':'#fff',
                color:tab===t?'#fff':'#6B7A99',
                boxShadow:tab===t?'0 4px 16px rgba(27,58,122,.25)':'0 2px 8px rgba(27,58,122,.06)',
                border:tab===t?'1px solid transparent':'1px solid #DDE3F0',
              }}>{t==='overview'?'👤 Overview':t==='marks'?'📊 Marks History':'📋 Attendance'}</button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab==='overview'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div className="card">
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,marginBottom:16}}>Personal Info</h3>
                {[["Father's Name",profile.father_name],['Phone',profile.phone],['Age',profile.age],['Gender',profile.gender],['Enrollment',profile.enrollment_date]].map(([l,v])=>(
                  <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #EEF2FF'}}>
                    <span style={{color:'#6B7A99',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</span>
                    <span style={{color:'#0D1B35',fontSize:13,fontWeight:600,textTransform:'capitalize'}}>{v ? String(v) : '—'}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,marginBottom:16}}>Academic Info</h3>
                {[['Class',profile.class],['Board',profile.board],['Roll Number',profile.roll_number]].map(([l,v])=>(
                  <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #EEF2FF'}}>
                    <span style={{color:'#6B7A99',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</span>
                    <span style={{color:'#0D1B35',fontSize:13,fontWeight:600}}>{v ? String(v) : '—'}</span>
                  </div>
                ))}
                <div style={{marginTop:12}}>
                  <div style={{color:'#6B7A99',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Subjects</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {(profile.subjects as string[]||[]).map(s=><span key={s} style={{background:'#EEF2FF',color:'#1B3A7A',padding:'3px 10px',borderRadius:6,fontSize:12,fontWeight:600}}>{s}</span>)}
                    {!(profile.subjects as string[]||[]).length&&<span style={{color:'#9AA5B4',fontSize:13}}>None set</span>}
                  </div>
                </div>
              </div>
              <div className="card" style={{gridColumn:'1/-1'}}>
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,marginBottom:16}}>Performance Chart</h3>
                {chartData.length>0?(
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1B3A7A" stopOpacity={0.15}/><stop offset="95%" stopColor="#1B3A7A" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="name" tick={{fill:'#9AA5B4',fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[0,100]} tick={{fill:'#9AA5B4',fontSize:11}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:12,boxShadow:'0 8px 24px rgba(27,58,122,.12)',fontFamily:'Inter,sans-serif'}}/>
                      <Area type="monotone" dataKey="score" stroke="#1B3A7A" strokeWidth={2.5} fill="url(#g)" dot={{fill:'#1B3A7A',r:4,stroke:'#fff',strokeWidth:2}} activeDot={{r:6,fill:'#C9960A'}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                ):<div style={{height:180,display:'flex',alignItems:'center',justifyContent:'center',color:'#9AA5B4'}}>No marks data</div>}
              </div>
            </div>
          )}

          {/* MARKS TAB */}
          {tab==='marks'&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
                {[['Total Tests',marks.length,'📝','#1B3A7A'],['Average',avg+'%','📊',gradeColor(avg)],['Highest',marks.length?Math.max(...marks.map(m=>m.percentage)).toFixed(1)+'%':'—','🏆','#1B6B38'],['Grade',gradeLabel(avg),'⭐',gradeColor(avg)]].map(([l,v,icon,color])=>(
                  <div key={String(l)} style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:16,padding:'18px',textAlign:'center',boxShadow:'0 2px 8px rgba(27,58,122,.06)'}}>
                    <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:700,color:color as string}}>{v}</div>
                    <div style={{color:'#6B7A99',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 12px rgba(27,58,122,.06)'}}>
                {marks.length===0?<div style={{textAlign:'center',padding:'60px',color:'#6B7A99'}}><div style={{fontSize:48,marginBottom:12}}>📊</div><p>No marks yet</p></div>:(
                  <table className="marks-table">
                    <thead><tr><th>Date</th><th>Test</th><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {marks.map(m=>{
                        const p=+m.percentage.toFixed(1)
                        return(
                          <tr key={m.date+m.subject}>
                            <td style={{color:'#9AA5B4'}}>{formatDate(m.date)}</td>
                            <td style={{fontWeight:600,color:'#0D1B35'}}>{m.test_name}</td>
                            <td style={{color:'#6B7A99'}}>{m.subject}</td>
                            <td style={{fontFamily:'JetBrains Mono,monospace'}}>{m.obtained_marks}/{m.total_marks}</td>
                            <td><span style={{fontWeight:700,color:gradeColor(p),fontFamily:'JetBrains Mono,monospace'}}>{p}%</span></td>
                            <td><span style={{background:gradeColor(p)+'18',color:gradeColor(p),padding:'3px 10px',borderRadius:99,fontSize:12,fontWeight:700}}>{gradeLabel(p)}</span></td>
                            <td style={{color:'#9AA5B4',fontSize:12}}>{m.remarks||'—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {tab==='attendance'&&(
            <div>
              <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
                <span style={{color:'#6B7A99',fontSize:13,fontWeight:600}}>Show:</span>
                {(['week','month','year','all'] as const).map(f=>(
                  <button key={f} className={`chip${attFilter===f?' active':''}`} onClick={()=>setAttFilter(f)}>{f==='all'?'All Time':f==='week'?'This Week':f==='month'?'This Month':'This Year'}</button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:20}}>
                {Object.entries(S).map(([k,c])=>(
                  <div key={k} style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:16,padding:'16px',textAlign:'center',boxShadow:'0 2px 8px rgba(27,58,122,.06)'}}>
                    <div style={{fontSize:24,marginBottom:6}}>{c.icon}</div>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:c.color}}>{attendance.filter(a=>a.status===k).length}</div>
                    <div style={{color:'#6B7A99',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>{c.label}</div>
                  </div>
                ))}
                <div style={{background:'linear-gradient(135deg,#1B3A7A,#2349A0)',borderRadius:16,padding:'16px',textAlign:'center',boxShadow:'0 4px 16px rgba(27,58,122,.25)'}}>
                  <div style={{fontSize:24,marginBottom:6}}>📈</div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#F5C842'}}>{attPct}%</div>
                  <div style={{color:'rgba(255,255,255,.7)',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>Rate</div>
                </div>
              </div>
              <div style={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 12px rgba(27,58,122,.06)'}}>
                {attendance.length===0?<div style={{textAlign:'center',padding:'60px',color:'#6B7A99'}}><div style={{fontSize:48,marginBottom:12}}>📋</div><p>No attendance records</p></div>:(
                  <table className="marks-table">
                    <thead><tr><th>Date</th><th>Day</th><th>Status</th><th>Note</th></tr></thead>
                    <tbody>
                      {attendance.map(a=>{
                        const c=S[a.status]
                        return(
                          <tr key={a.date}>
                            <td style={{fontFamily:'JetBrains Mono,monospace',fontWeight:600}}>{a.date}</td>
                            <td style={{color:'#6B7A99'}}>{new Date(a.date).toLocaleDateString('en-PK',{weekday:'long'})}</td>
                            <td><span style={{background:c.bg,color:c.color,padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,display:'inline-flex',alignItems:'center',gap:5}}>{c.icon} {c.label}</span></td>
                            <td style={{color:'#6B7A99',fontSize:12}}>{a.note||'—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
