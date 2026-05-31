'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function TeacherDashboardPage() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ students: 0, tests: 0, files: 0, avg: 0 })
  useEffect(() => {
    const load = async () => {
      const [s, t, l, m] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('test_results').select('id', { count: 'exact' }),
        supabase.from('library_files').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('test_results').select('percentage'),
      ])
      const pcts = (m.data||[]).map((x:{percentage:number})=>x.percentage)
      setStats({ students: s.count||0, tests: t.count||0, files: l.count||0, avg: pcts.length?+(pcts.reduce((a:number,b:number)=>a+b,0)/pcts.length).toFixed(1):0 })
    }
    load()
  }, [])

  const actions = [
    { href:'/dashboard/teacher/marks',         icon:'📝', title:'Enter Marks',     desc:'Add or edit student results',           bg:'linear-gradient(135deg,#EEF2FF,#E0E8FF)',  border:'rgba(27,58,122,.15)',  color:'#1B3A7A' },
    { href:'/dashboard/teacher/roster',        icon:'👥', title:'Student Roster',  desc:'View all your students',                bg:'linear-gradient(135deg,#F0FDF4,#DCFCE7)',  border:'rgba(27,107,56,.15)',  color:'#1B6B38' },
    { href:'/dashboard/teacher/reports',       icon:'📊', title:'Reports',         desc:'Charts and class analytics',            bg:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',  border:'rgba(201,150,10,.15)', color:'#92400E' },
    { href:'/dashboard/teacher/library',       icon:'📚', title:'Library',         desc:'Upload PDFs and resources',             bg:'linear-gradient(135deg,#F5F3FF,#EDE9FE)',  border:'rgba(91,33,182,.15)',  color:'#5B21B6' },
    { href:'/dashboard/teacher/ai-calculator', icon:'🤖', title:'AI Calculator',   desc:'Smart marks analysis',                  bg:'linear-gradient(135deg,#FFF5F5,#FEE2E2)',  border:'rgba(197,48,48,.15)',  color:'#991B1B' },
  ]

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar />
      <Topbar title={`Good day, ${profile?.full_name?.split(' ')[0]||'Teacher'} 👋`} subtitle="Pahore Academy Mianwali — Teacher Portal" />
      <main style={{marginLeft:260,paddingTop:66}}>
        <div style={{padding:'28px'}} className="page-enter">

          {/* Teacher banner */}
          <div style={{
            background:'linear-gradient(135deg,#92400E 0%,#B45309 40%,#D97706 80%,#F59E0B 100%)',
            borderRadius:22,padding:'24px 28px',marginBottom:24,
            boxShadow:'0 8px 32px rgba(146,64,14,.25)',position:'relative',overflow:'hidden',
          }} className="anim-up">
            <div style={{position:'absolute',top:-30,right:-30,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,.07)',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:18,position:'relative',zIndex:1}}>
              <div style={{width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,.2)',border:'2.5px solid rgba(255,255,255,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,color:'#fff',fontFamily:'Playfair Display,serif',boxShadow:'0 4px 16px rgba(0,0,0,.15)',flexShrink:0}}>
                {profile?.full_name?.[0]||'T'}
              </div>
              <div style={{flex:1}}>
                <h2 style={{fontFamily:'Playfair Display,serif',fontSize:20,fontWeight:700,color:'#fff',margin:'0 0 4px'}}>{profile?.full_name}</h2>
                <p style={{color:'rgba(255,255,255,.75)',fontSize:13,margin:0}}>Teacher · Pahore Academy Mianwali</p>
                <span className="badge-teacher" style={{marginTop:6,display:'inline-block'}}>Teacher</span>
              </div>
              <Link href="/dashboard/teacher/marks" style={{background:'rgba(255,255,255,.2)',color:'#fff',textDecoration:'none',padding:'10px 22px',borderRadius:11,fontWeight:700,fontSize:13.5,border:'1px solid rgba(255,255,255,.4)',backdropFilter:'blur(8px)',transition:'all .2s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.32)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.2)'}}>
                Enter Marks →
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
            {[
              {icon:'🎓',label:'Total Students',value:stats.students,iconBg:'linear-gradient(135deg,#1B3A7A,#2349A0)'},
              {icon:'📝',label:'Tests Recorded', value:stats.tests,   iconBg:'linear-gradient(135deg,#92400E,#B45309)'},
              {icon:'📚',label:'Library Files',  value:stats.files,   iconBg:'linear-gradient(135deg,#5B21B6,#7C3AED)'},
              {icon:'📈',label:'Class Average',  value:stats.avg+'%', iconBg:'linear-gradient(135deg,#1B6B38,#2D9A52)'},
            ].map(({icon,label,value,iconBg},i)=>(
              <div key={label} className={`stat-card anim-up d${i+1}`}>
                <div className="stat-icon" style={{background:iconBg}}>{icon}</div>
                <div className="stat-val">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Action cards */}
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,fontWeight:700,marginBottom:16}} className="anim-up d3">Quick Actions</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
            {actions.map(({href,icon,title,desc,bg,border,color},i)=>(
              <Link key={href} href={href} style={{
                background:bg,border:`1px solid ${border}`,
                borderRadius:18,padding:'22px 20px',textDecoration:'none',
                transition:'all .3s cubic-bezier(.22,.68,0,1.2)',
                boxShadow:`0 2px 10px ${border}`,
                display:'block',
              }} className={`anim-up d${i+2}`}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-6px) scale(1.02)';(e.currentTarget as HTMLElement).style.boxShadow=`0 16px 40px ${border}`}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0) scale(1)';(e.currentTarget as HTMLElement).style.boxShadow=`0 2px 10px ${border}`}}>
                <div style={{fontSize:32,marginBottom:12,filter:'drop-shadow(0 3px 6px rgba(0,0,0,.12))',transition:'transform .3s cubic-bezier(.34,1.56,.64,1)'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.2) rotate(-8deg)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1) rotate(0deg)'}}>
                  {icon}
                </div>
                <h4 style={{fontFamily:'Playfair Display,serif',fontSize:16,fontWeight:700,color:'#0D1B35',margin:'0 0 6px'}}>{title}</h4>
                <p style={{color:'#6B7A99',fontSize:12.5,margin:0,lineHeight:1.6}}>{desc}</p>
                <div style={{marginTop:14,fontSize:12,fontWeight:700,color:color,display:'flex',alignItems:'center',gap:4}}>
                  Open <span style={{transition:'transform .2s',display:'inline-block'}}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <style>{`
        @keyframes pageIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .page-enter{animation:pageIn .45s cubic-bezier(.22,.68,0,1.15) both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .anim-up{animation:fadeUp .55s cubic-bezier(.22,.68,0,1.2) both}
        .d1{animation-delay:.07s}.d2{animation-delay:.14s}.d3{animation-delay:.21s}.d4{animation-delay:.28s}.d5{animation-delay:.38s}
      `}</style>
    </div>
  )
}
