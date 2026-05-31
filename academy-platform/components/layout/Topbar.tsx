'use client'
import { useAuthStore, useUIStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { profile, roles, unreadCount, clearAuth } = useAuthStore()
  const { sidebarCollapsed } = useUIStore()
  const router = useRouter()
  const logout = async () => {
    await supabase.auth.signOut(); clearAuth()
    toast.success('Signed out'); router.push('/auth/login')
  }
  return (
    <header style={{
      position:'fixed',right:0,top:0,zIndex:30,
      left:sidebarCollapsed?68:260,height:66,
      background:'rgba(255,255,255,.96)',
      backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
      borderBottom:'1px solid #DDE3F0',
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 28px',
      transition:'left .3s cubic-bezier(.22,.68,0,1.2)',
      boxShadow:'0 2px 16px rgba(27,58,122,.07)',
    }}>
      <div style={{animation:'fadeDown .4s cubic-bezier(.22,.68,0,1.2) both'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:19,fontWeight:700,color:'#0D1B35',lineHeight:1.2}}>{title}</div>
        {subtitle&&<div style={{color:'#6B7A99',fontSize:12,marginTop:1,fontWeight:500}}>{subtitle}</div>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        {/* Notification bell */}
        <Link href="/dashboard/student/notifications" style={{
          position:'relative',textDecoration:'none',
          width:40,height:40,borderRadius:11,
          background:'#F0F4FF',border:'1px solid #DDE3F0',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:18,transition:'all .22s cubic-bezier(.22,.68,0,1.2)',
          boxShadow:'0 1px 4px rgba(27,58,122,.08)',
        }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.1) rotate(-8deg)';(e.currentTarget as HTMLElement).style.background='#EEF2FF'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1) rotate(0deg)';(e.currentTarget as HTMLElement).style.background='#F0F4FF'}}>
          🔔
          {unreadCount>0&&(
            <span style={{
              position:'absolute',top:-4,right:-4,
              width:18,height:18,borderRadius:'50%',
              background:'linear-gradient(135deg,#C53030,#E53E3E)',
              color:'#fff',fontSize:9,fontWeight:800,
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 2px 8px rgba(197,48,48,.4)',
              animation:'scaleInPop .4s cubic-bezier(.34,1.56,.64,1)',
            }}>
              {unreadCount>9?'9+':unreadCount}
            </span>
          )}
        </Link>

        {/* Role badges */}
        <div style={{display:'flex',gap:5}}>
          {roles.map(r=><span key={r} className={`badge-${r}`}>{r}</span>)}
        </div>

        {/* Avatar */}
        <div style={{
          width:38,height:38,borderRadius:'50%',
          background:'linear-gradient(135deg,#1B3A7A,#2349A0)',
          color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
          fontWeight:800,fontSize:15,flexShrink:0,cursor:'pointer',
          boxShadow:'0 3px 12px rgba(27,58,122,.28)',
          transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
        }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.12)';(e.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(27,58,122,.4)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)';(e.currentTarget as HTMLElement).style.boxShadow='0 3px 12px rgba(27,58,122,.28)'}}>
          {profile?.full_name?.[0]||'?'}
        </div>

        <button onClick={logout} className="btn-ghost"
          style={{padding:'8px 16px',fontSize:13,fontWeight:600}}>
          Sign out
        </button>
      </div>
      <style>{`
        @keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleInPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </header>
  )
}
