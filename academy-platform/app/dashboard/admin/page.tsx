'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function AdminDashboardPage() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ students:0, teachers:0, admins:0, tests:0, files:0, avg:0 })
  const [classData, setClassData] = useState<{name:string;count:number}[]>([])

  useEffect(() => {
    const load = async () => {
      const [roles, tests, lib, profiles, marks] = await Promise.all([
        supabase.from('roles').select('role'),
        supabase.from('test_results').select('id',{count:'exact'}),
        supabase.from('library_files').select('id',{count:'exact'}).eq('is_active',true),
        supabase.from('profiles').select('class'),
        supabase.from('test_results').select('percentage'),
      ])
      const r = roles.data||[]
      const pcts = (marks.data||[]).map((x:{percentage:number})=>x.percentage)
      setStats({
        students: r.filter((x:{role:string})=>x.role==='student').length,
        teachers: r.filter((x:{role:string})=>x.role==='teacher').length,
        admins:   r.filter((x:{role:string})=>x.role==='admin').length,
        tests: tests.count||0, files: lib.count||0,
        avg: pcts.length?+(pcts.reduce((a:number,b:number)=>a+b,0)/pcts.length).toFixed(1):0,
      })
      const cc:Record<string,number>={}
      ;(profiles.data||[]).forEach((p:{class:string})=>{ if(p.class) cc[p.class]=(cc[p.class]||0)+1 })
      setClassData(Object.entries(cc).map(([name,count])=>({name:name.replace('Class ','Cls '),count})).sort((a,b)=>b.count-a.count).slice(0,8))
    }
    load()
  }, [])

  const COLORS = ['#1B3A7A','#2349A0','#3A63C8','#C9960A','#E8AB12','#5B21B6','#1B6B38','#C53030']

  const adminActions = [
    {href:'/dashboard/admin/students',  icon:'🎓', title:'Student Database', desc:'View and manage all students',     bg:'#EEF2FF',  color:'#1B3A7A'},
    {href:'/dashboard/admin/users',     icon:'👥', title:'User Management',  desc:'Manage roles and accounts',       bg:'#F0FDF4',  color:'#1B6B38'},
    {href:'/dashboard/admin/analytics', icon:'📈', title:'Analytics',        desc:'Performance insights & charts',   bg:'#FFFBEB',  color:'#92400E'},
    {href:'/dashboard/admin/codes',     icon:'🔐', title:'Access Codes',     desc:'Rotate teacher & admin codes',    bg:'#FFF5F5',  color:'#991B1B'},
    {href:'/dashboard/admin/export',    icon:'📤', title:'Export Data',      desc:'Download CSV reports',            bg:'#F5F3FF',  color:'#5B21B6'},
    {href:'/dashboard/admin/library',   icon:'📚', title:'Library',          desc:'Manage all files',                bg:'#FFF8F0',  color:'#92400E'},
  ]

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}}>
      <Sidebar />
      <Topbar title="Admin Dashboard" subtitle="Pahore Academy Mianwali — Command Centre" />
      <main style={{marginLeft:260,paddingTop:66}}>
        <div style={{padding:'28px'}} className="page-enter">

          {/* Admin banner */}
          <div style={{
            background:'linear-gradient(135deg,#1A0808 0%,#4A0E0E 35%,#7B1A1A 70%,#991B1B 100%)',
            borderRadius:22,padding:'24px 28px',marginBottom:24,
            boxShadow:'0 8px 32px rgba(153,27,27,.28)',position:'relative',overflow:'hidden',
          }} className="anim-up">
            <div style={{position:'absolute',top:-40,right:-40,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,.05)',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:18,position:'relative',zIndex:1}}>
              <div style={{width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,.15)',border:'2.5px solid rgba(255,165,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,color:'#FFA500',fontFamily:'Playfair Display,serif',flexShrink:0,boxShadow:'0 0 25px rgba(255,165,0,.2)'}}>
                {profile?.full_name?.[0]||'A'}
              </div>
              <div style={{flex:1}}>
                <h2 style={{fontFamily:'Playfair Display,serif',fontSize:20,fontWeight:700,color:'#fff',margin:'0 0 4px'}}>{profile?.full_name}</h2>
                <p style={{color:'rgba(255,255,255,.65)',fontSize:13,margin:0}}>System Administrator · Pahore Academy Mianwali</p>
                <span className="badge-admin" style={{marginTop:6,display:'inline-block'}}>Admin</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:14,marginBottom:24}}>
            {[
              {icon:'🎓',label:'Students',  value:stats.students, iconBg:'linear-gradient(135deg,#1B3A7A,#2349A0)'},
              {icon:'📝',label:'Teachers',  value:stats.teachers, iconBg:'linear-gradient(135deg,#92400E,#B45309)'},
              {icon:'⚙️',label:'Admins',    value:stats.admins,   iconBg:'linear-gradient(135deg,#991B1B,#C53030)'},
              {icon:'📊',label:'Tests',     value:stats.tests,    iconBg:'linear-gradient(135deg,#C9960A,#E8AB12)'},
              {icon:'📚',label:'Library',   value:stats.files,    iconBg:'linear-gradient(135deg,#5B21B6,#7C3AED)'},
              {icon:'📈',label:'Avg Score', value:stats.avg+'%',  iconBg:'linear-gradient(135deg,#1B6B38,#2D9A52)'},
            ].map(({icon,label,value,iconBg},i)=>(
              <div key={label} className={`stat-card anim-up d${i+1}`} style={{textAlign:'center'}}>
                <div className="stat-icon" style={{background:iconBg,margin:'0 auto 12px'}}>{icon}</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#1B3A7A'}}>{value}</div>
                <div style={{color:'#6B7A99',fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginTop:3}}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
            {/* Chart */}
            <div className="card anim-up d3">
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,marginBottom:20}}>Students by Class</h3>
              {classData.length>0?(
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={classData} barCategoryGap="30%">
                    <XAxis dataKey="name" tick={{fill:'#6B7A99',fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:'#6B7A99',fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:'#fff',border:'1px solid #DDE3F0',borderRadius:12,boxShadow:'0 8px 24px rgba(27,58,122,.12)',fontFamily:'Inter,sans-serif',fontSize:13}}/>
                    <Bar dataKey="count" radius={[8,8,0,0]}>
                      {classData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ):(
                <div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'#6B7A99',fontSize:13}}>No class data yet</div>
              )}
            </div>

            {/* Admin actions */}
            <div className="card anim-up d4">
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,marginBottom:16}}>Admin Actions</h3>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {adminActions.slice(0,4).map(({href,icon,title,desc,bg,color})=>(
                  <Link key={href} href={href} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'11px 14px',borderRadius:12,
                    background:bg,border:'1px solid '+color+'18',
                    textDecoration:'none',transition:'all .22s cubic-bezier(.22,.68,0,1.2)',
                  }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateX(4px)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px '+color+'20'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateX(0)';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
                    <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:13.5,fontWeight:700,color:'#0D1B35',margin:'0 0 1px'}}>{title}</p>
                      <p style={{fontSize:11.5,color:'#6B7A99',margin:0}}>{desc}</p>
                    </div>
                    <span style={{color:color,fontSize:14,fontWeight:700}}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* All action grid */}
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,fontWeight:700,marginBottom:16}} className="anim-up d5">All Admin Tools</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:14}}>
            {adminActions.map(({href,icon,title,desc,bg,color},i)=>(
              <Link key={href} href={href} style={{
                background:bg,border:'1px solid '+color+'20',borderRadius:16,
                padding:'20px 18px',textDecoration:'none',
                transition:'all .3s cubic-bezier(.22,.68,0,1.2)',
                boxShadow:'0 2px 8px '+color+'10',
              }} className={`anim-up d${i+1}`}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-5px) scale(1.02)';(e.currentTarget as HTMLElement).style.boxShadow='0 14px 36px '+color+'22'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0) scale(1)';(e.currentTarget as HTMLElement).style.boxShadow='0 2px 8px '+color+'10'}}>
                <span style={{fontSize:28,display:'block',marginBottom:10,filter:'drop-shadow(0 2px 4px rgba(0,0,0,.1))'}}>{icon}</span>
                <p style={{fontSize:14,fontWeight:700,color:'#0D1B35',margin:'0 0 4px',fontFamily:'Playfair Display,serif'}}>{title}</p>
                <p style={{fontSize:11.5,color:'#6B7A99',margin:0,lineHeight:1.55}}>{desc}</p>
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
        .d1{animation-delay:.07s}.d2{animation-delay:.14s}.d3{animation-delay:.21s}.d4{animation-delay:.28s}.d5{animation-delay:.38s}.d6{animation-delay:.5s}
        .stat-card{background:#fff!important;border:1px solid #DDE3F0!important}
      `}</style>
    </div>
  )
}
