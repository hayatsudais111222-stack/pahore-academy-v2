'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'

const navMap: Record<string, {href:string;icon:string;label:string;color:string}[]> = {
  student:[
    {href:'/dashboard/student',               icon:'🏠',label:'Dashboard',    color:'#EEF2FF'},
    {href:'/dashboard/student/profile',       icon:'👤',label:'My Profile',   color:'#F0FDF4'},
    {href:'/dashboard/student/marks',         icon:'📊',label:'My Marks',     color:'#FFFBEB'},
    {href:'/dashboard/student/library',       icon:'📚',label:'Library',      color:'#FFF5F5'},
    {href:'/dashboard/student/ai',            icon:'🤖',label:'AI Assistant', color:'#F5F3FF'},
    {href:'/dashboard/student/notifications', icon:'🔔',label:'Notifications',color:'#FFF8F0'},
  ],
  teacher:[
    {href:'/dashboard/teacher',               icon:'🏠',label:'Dashboard',    color:'#EEF2FF'},
    {href:'/dashboard/teacher/roster',        icon:'👥',label:'Students',     color:'#F0FDF4'},
    {href:'/dashboard/teacher/marks',         icon:'📝',label:'Marks Entry',  color:'#FFFBEB'},
    {href:'/dashboard/teacher/reports',       icon:'📊',label:'Reports',      color:'#FFF5F5'},
    {href:'/dashboard/teacher/library',       icon:'📚',label:'Library',      color:'#F5F3FF'},
    {href:'/dashboard/teacher/ai-calculator', icon:'🤖',label:'AI Calculator',color:'#FFF8F0'},
  ],
  admin:[
    {href:'/dashboard/admin',                 icon:'🏠',label:'Dashboard',    color:'#EEF2FF'},
    {href:'/dashboard/admin/students',        icon:'🎓',label:'Students DB',  color:'#F0FDF4'},
    {href:'/dashboard/admin/users',           icon:'👥',label:'Users',        color:'#FFFBEB'},
    {href:'/dashboard/admin/analytics',       icon:'📈',label:'Analytics',    color:'#FFF5F5'},
    {href:'/dashboard/admin/library',         icon:'📚',label:'Library',      color:'#F5F3FF'},
    {href:'/dashboard/admin/codes',           icon:'🔐',label:'Access Codes', color:'#FFF8F0'},
    {href:'/dashboard/admin/export',          icon:'📤',label:'Export Data',  color:'#F0F4FF'},
  ],
}

export default function Sidebar() {
  const pathname = usePathname()
  const {activeRole,roles,setActiveRole,profile} = useAuthStore()
  const {sidebarCollapsed,toggleSidebar} = useUIStore()
  const items = navMap[activeRole||'student']||[]

  return (
    <aside style={{
      position:'fixed',top:0,left:0,bottom:0,zIndex:40,
      width:sidebarCollapsed?68:260,
      background:'#FFFFFF',
      borderRight:'1px solid #DDE3F0',
      display:'flex',flexDirection:'column',
      transition:'width .3s cubic-bezier(.22,.68,0,1.2)',
      overflow:'hidden',
      boxShadow:'4px 0 24px rgba(27,58,122,.07)',
    }}>
      {/* Logo header */}
      <div style={{
        padding:'18px 14px',
        borderBottom:'1px solid #DDE3F0',
        display:'flex',alignItems:'center',gap:12,
        background:'linear-gradient(135deg,#0C1F5C 0%,#1B3A7A 50%,#2349A0 100%)',
        flexShrink:0,
      }}>
        <div style={{
          width:40,height:40,borderRadius:'50%',flexShrink:0,
          background:'rgba(255,255,255,.18)',
          border:'2px solid rgba(245,200,66,.6)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:'Playfair Display,serif',fontWeight:700,
          color:'#F5C842',fontSize:15,
          boxShadow:'0 0 20px rgba(245,200,66,.25),0 3px 10px rgba(0,0,0,.2)',
          transition:'all .3s cubic-bezier(.34,1.56,.64,1)',
          cursor:'pointer',
        }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.12) rotate(-5deg)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1) rotate(0deg)'}}>
          PA
        </div>
        {!sidebarCollapsed&&(
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:14,color:'#FFFFFF',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.2}}>Pahore Academy</div>
            <div style={{color:'rgba(255,255,255,.55)',fontSize:10.5,fontWeight:500,marginTop:1}}>Mianwali</div>
          </div>
        )}
        <button onClick={toggleSidebar} style={{
          marginLeft:'auto',background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',
          color:'rgba(255,255,255,.8)',cursor:'pointer',fontSize:14,
          flexShrink:0,padding:'5px 8px',lineHeight:1,
          borderRadius:8,transition:'all .2s',fontFamily:'Inter,sans-serif',
        }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.25)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.12)'}}>
          {sidebarCollapsed?'›':'‹'}
        </button>
      </div>

      {/* Role switcher */}
      {roles.length>1&&!sidebarCollapsed&&(
        <div style={{padding:'10px 12px 8px',borderBottom:'1px solid #DDE3F0',background:'#F7F9FF',flexShrink:0}}>
          <div style={{color:'#6B7A99',fontSize:9,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:8,paddingLeft:2}}>Switch Role</div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {roles.map(r=>(
              <button key={r} onClick={()=>setActiveRole(r)} style={{
                fontSize:11,padding:'4px 12px',borderRadius:8,cursor:'pointer',
                fontWeight:700,textTransform:'capitalize',fontFamily:'Inter,sans-serif',
                border:'none',transition:'all .22s cubic-bezier(.22,.68,0,1.2)',
                background:activeRole===r?'linear-gradient(135deg,#1B3A7A,#2349A0)':'#EEF2FF',
                color:activeRole===r?'#FFFFFF':'#1B3A7A',
                boxShadow:activeRole===r?'0 3px 10px rgba(27,58,122,.28)':'none',
                transform:activeRole===r?'translateY(-1px)':'none',
              }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{flex:1,overflowY:'auto',padding:'12px 8px'}}>
        {!sidebarCollapsed&&(
          <div style={{color:'#6B7A99',fontSize:9,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',padding:'4px 6px 10px'}}>
            {activeRole} Menu
          </div>
        )}
        {items.map(({href,icon,label,color})=>{
          const active=pathname===href
          return(
            <Link key={href} href={href}
              className={cn('sb-item',active&&'active')}
              title={sidebarCollapsed?label:undefined}
              style={{justifyContent:sidebarCollapsed?'center':'flex-start'}}>
              <div style={{
                width:32,height:32,borderRadius:9,
                background:active?'linear-gradient(135deg,#1B3A7A,#2349A0)':color,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:15,flexShrink:0,
                boxShadow:active?'0 3px 10px rgba(27,58,122,.25)':'0 1px 4px rgba(27,58,122,.08)',
                transition:'all .22s cubic-bezier(.22,.68,0,1.2)',
              }}>
                {icon}
              </div>
              {!sidebarCollapsed&&<span style={{position:'relative',zIndex:1,fontWeight:active?700:500}}>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      {!sidebarCollapsed&&(
        <div style={{padding:'14px 14px',borderTop:'1px solid #DDE3F0',display:'flex',alignItems:'center',gap:10,background:'#F7F9FF',flexShrink:0}}>
          <div style={{
            width:36,height:36,borderRadius:'50%',
            background:'linear-gradient(135deg,#1B3A7A,#2349A0)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff',fontWeight:800,fontSize:14,flexShrink:0,
            boxShadow:'0 3px 12px rgba(27,58,122,.28)',
            transition:'transform .25s cubic-bezier(.34,1.56,.64,1)',
            cursor:'pointer',
          }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.12)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)'}}>
            {profile?.full_name?.[0]||'?'}
          </div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:'#0D1B35',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.full_name||'User'}</div>
            <div style={{fontSize:10.5,color:'#6B7A99',textTransform:'capitalize',fontWeight:500}}>{activeRole}</div>
          </div>
        </div>
      )}
    </aside>
  )
}
