'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { getStudentMarks } from '@/lib/supabase'
import { gradeColor, gradeLabel, formatDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Link from 'next/link'
import type { TestResult } from '@/types'

export default function StudentDashboardPage() {
  const { profile, userId, unreadCount } = useAuthStore()
  const [marks, setMarks] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) getStudentMarks(userId).then(({ data }) => { setMarks(data || []); setLoading(false) })
  }, [userId])

  const avg = marks.length ? +(marks.reduce((s,m)=>s+m.percentage,0)/marks.length).toFixed(1) : 0
  const highest = marks.length ? Math.max(...marks.map(m=>m.percentage)) : 0
  const recent = [...marks].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,5)
  const chartData = [...marks].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()).slice(-8).map(m=>({name:m.subject.slice(0,4),score:+m.percentage.toFixed(1)}))
  const bySubject = marks.reduce((acc,m)=>{if(!acc[m.subject])acc[m.subject]=[];acc[m.subject].push(m.percentage);return acc},{} as Record<string,number[]>)

  const stats = [
    {icon:'📝',label:'Total Tests',value:marks.length,color:'#EEF2FF',iconBg:'linear-gradient(135deg,#1B3A7A,#2349A0)',change:'All time'},
    {icon:'📊',label:'Average Score',value:avg+'%',color:'#FFFBEB',iconBg:'linear-gradient(135deg,#C9960A,#E8AB12)',change:gradeLabel(avg)+' Grade'},
    {icon:'🏆',label:'Highest Score',value:highest.toFixed(1)+'%',color:'#F0FDF4',iconBg:'linear-gradient(135deg,#1B6B38,#2D9A52)',change:'Personal best'},
    {icon:'🔔',label:'Notifications',value:unreadCount,color:'#FFF5F5',iconBg:'linear-gradient(135deg,#C53030,#E53E3E)',change:'Unread'},
  ]

  const quickLinks = [
    {href:'/dashboard/student/marks',  icon:'📊',label:'View All Marks',  bg:'#EEF2FF',color:'#1B3A7A'},
    {href:'/dashboard/student/library',icon:'📚',label:'Open Library',    bg:'#F5F3FF',color:'#5B21B6'},
    {href:'/dashboard/student/ai',     icon:'🤖',label:'Ask AI',          bg:'#FFFBEB',color:'#92400E'},
    {href:'/dashboard/student/profile',icon:'👤',label:'Edit Profile',    bg:'#F0FDF4',color:'#1B6B38'},
  ]

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar />
      <Topbar title={`Welcome back, ${profile?.full_name?.split(' ')[0]||'Student'} 👋`} subtitle={new Date().toLocaleDateString('en-PK',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} />
      <main style={{marginLeft:260,paddingTop:66,transition:'margin .3s cubic-bezier(.22,.68,0,1.2)'}}>
        <div style={{padding:'28px 28px 40px'}} className="page-enter">

          {/* Profile banner */}
          <div style={{
            background:'linear-gradient(135deg,#0C1F5C 0%,#1B3A7A 40%,#2349A0 70%,#3A63C8 100%)',
            borderRadius:22,padding:'24px 28px',marginBottom:24,
            position:'relative',overflow:'hidden',
            boxShadow:'0 8px 32px rgba(27,58,122,.28)',
          }} className="anim-up">
            {/* Decorative circles */}
            <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.05)',pointerEvents:'none'}}/>
            <div style={{position:'absolute',bottom:-30,right:120,width:150,height:150,borderRadius:'50%',background:'rgba(245,200,66,.07)',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:18,position:'relative',zIndex:1}}>
              <div style={{
                width:64,height:64,borderRadius:'50%',flexShrink:0,
                background:'rgba(255,255,255,.18)',
                border:'2.5px solid rgba(245,200,66,.6)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:26,fontWeight:800,color:'#F5C842',
                fontFamily:'Playfair Display,serif',
                boxShadow:'0 0 30px rgba(245,200,66,.22)',
                transition:'transform .3s cubic-bezier(.34,1.56,.64,1)',
              }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.1)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)'}}>
                {profile?.full_name?.[0]||'S'}
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4,flexWrap:'wrap'}}>
                  <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'#FFFFFF',margin:0}}>{profile?.full_name||'Student'}</h2>
                  <span className="badge-student">Student</span>
                </div>
                <p style={{color:'rgba(255,255,255,.7)',fontSize:13,margin:0}}>{profile?.class||'Class not set'} · {profile?.board||'Board not set'} Board · Pahore Academy Mianwali</p>
              </div>
              <Link href="/dashboard/student/profile" style={{
                background:'rgba(255,255,255,.15)',color:'#fff',textDecoration:'none',
                padding:'9px 20px',borderRadius:10,fontWeight:600,fontSize:13,
                border:'1px solid rgba(255,255,255,.3)',
                transition:'all .22s',backdropFilter:'blur(8px)',
              }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.25)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.15)'}}>
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {stats.map(({icon,label,value,color,iconBg,change},i)=>(
              <div key={label} className={`stat-card anim-up d${i+1}`}>
                <div className="stat-icon" style={{background:iconBg}}>{icon}</div>
                <div className="stat-val">{value}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-change stat-neu">{change}</div>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:20,marginBottom:24}}>
            {/* Performance chart */}
            <div className="card anim-up d2">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,margin:0}}>Performance Trend</h3>
                <span style={{fontSize:11,color:'#6B7A99',background:'#F0F4FF',padding:'4px 10px',borderRadius:99,fontWeight:600}}>Last 8 tests</span>
              </div>
              {chartData.length>0?(
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B3A7A" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#1B3A7A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{fill:'#6B7A99',fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{fill:'#6B7A99',fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:12,color:'#0D1B35',boxShadow:'0 8px 24px rgba(27,58,122,.12)',fontFamily:'Inter,sans-serif',fontSize:13}}/>
                    <Area type="monotone" dataKey="score" stroke="#1B3A7A" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{fill:'#1B3A7A',r:4,strokeWidth:2,stroke:'#fff'}} activeDot={{r:6,fill:'#C9960A',stroke:'#fff',strokeWidth:2}}/>
                  </AreaChart>
                </ResponsiveContainer>
              ):(
                <div style={{height:180,display:'flex',alignItems:'center',justifyContent:'center',color:'#6B7A99',flexDirection:'column',gap:8}}>
                  <div style={{fontSize:36}}>📊</div>
                  <p style={{fontSize:13}}>No marks data yet</p>
                </div>
              )}
            </div>

            {/* Subject performance */}
            <div className="card anim-up d3">
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,marginBottom:18}}>By Subject</h3>
              {Object.keys(bySubject).length>0?(
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {Object.entries(bySubject).slice(0,5).map(([subj,pcts])=>{
                    const a=+(pcts.reduce((s,p)=>s+p,0)/pcts.length).toFixed(1)
                    return(
                      <div key={subj}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                          <span style={{fontSize:12.5,fontWeight:600,color:'#2D3F5E'}}>{subj}</span>
                          <span style={{fontSize:12,fontWeight:700,color:gradeColor(a),fontFamily:'JetBrains Mono,monospace'}}>{a}%</span>
                        </div>
                        <div className="grade-bar">
                          <div className="grade-fill" style={{width:`${a}%`,background:`linear-gradient(90deg,${gradeColor(a)},${gradeColor(a)}99)`}}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ):(
                <div style={{textAlign:'center',color:'#6B7A99',padding:'32px 0',fontSize:13}}>No subject data yet</div>
              )}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
            {/* Recent marks */}
            <div className="card anim-up d4" style={{padding:0,overflow:'hidden'}}>
              <div style={{padding:'18px 22px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #DDE3F0'}}>
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,margin:0}}>Recent Tests</h3>
                <Link href="/dashboard/student/marks" style={{fontSize:12,color:'#1B3A7A',textDecoration:'none',fontWeight:700,background:'#EEF2FF',padding:'4px 12px',borderRadius:99,transition:'all .2s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#1B3A7A';(e.currentTarget as HTMLElement).style.color='#fff'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#EEF2FF';(e.currentTarget as HTMLElement).style.color='#1B3A7A'}}>
                  View all →
                </Link>
              </div>
              {loading?(
                <div style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
                  {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:52}}/>)}
                </div>
              ):recent.length>0?(
                <div>
                  {recent.map((m,i)=>{
                    const p=+m.percentage.toFixed(1)
                    return(
                      <div key={m.id} style={{
                        display:'flex',alignItems:'center',justifyContent:'space-between',
                        padding:'12px 22px',borderBottom:i<recent.length-1?'1px solid #DDE3F0':'none',
                        transition:'background .15s',cursor:'default',
                      }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#F0F4FF'}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}}>
                        <div>
                          <p style={{fontSize:13.5,fontWeight:600,color:'#0D1B35',margin:'0 0 2px'}}>{m.test_name}</p>
                          <p style={{fontSize:11.5,color:'#6B7A99',margin:0}}>{m.subject} · {formatDate(m.date)}</p>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <p style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700,fontSize:15,color:gradeColor(p),margin:'0 0 2px'}}>{m.obtained_marks}/{m.total_marks}</p>
                          <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:99,background:gradeColor(p)+'18',color:gradeColor(p)}}>{p}% · {gradeLabel(p)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ):(
                <div style={{padding:'40px 22px',textAlign:'center',color:'#6B7A99'}}>
                  <div style={{fontSize:32,marginBottom:8}}>📝</div>
                  <p style={{fontSize:13}}>No marks yet</p>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="anim-up d5">
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,marginBottom:14}}>Quick Actions</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {quickLinks.map(({href,icon,label,bg,color})=>(
                  <Link key={href} href={href} style={{
                    background:bg,border:'1px solid '+color+'22',
                    borderRadius:16,padding:'18px 16px',textDecoration:'none',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:10,
                    transition:'all .3s cubic-bezier(.22,.68,0,1.2)',
                    boxShadow:'0 2px 8px '+color+'12',
                  }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-4px) scale(1.03)';(e.currentTarget as HTMLElement).style.boxShadow='0 12px 28px '+color+'22'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0) scale(1)';(e.currentTarget as HTMLElement).style.boxShadow='0 2px 8px '+color+'12'}}>
                    <span style={{fontSize:28,filter:'drop-shadow(0 2px 4px rgba(0,0,0,.12))'}}>{icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:color,textAlign:'center'}}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes pageIn{from{opacity:0;transform:translateY(20px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
        .page-enter{animation:pageIn .45s cubic-bezier(.22,.68,0,1.15) both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .anim-up{animation:fadeUp .55s cubic-bezier(.22,.68,0,1.2) both}
        .d1{animation-delay:.07s}.d2{animation-delay:.14s}.d3{animation-delay:.21s}.d4{animation-delay:.28s}.d5{animation-delay:.38s}
        .stat-card{transition:all .3s cubic-bezier(.22,.68,0,1.2)!important}
        .stat-card:hover{transform:translateY(-5px) scale(1.02)!important}
      `}</style>
    </div>
  )
}
