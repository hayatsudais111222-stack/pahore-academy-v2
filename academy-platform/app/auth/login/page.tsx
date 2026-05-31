'use client'
import {useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {signIn,getProfile,getUserRoles} from '@/lib/supabase'
import {useAuthStore} from '@/store'
import type {Role} from '@/types'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router=useRouter();const store=useAuthStore()
  const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [loading,setLoading]=useState(false)
  const handle=async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true)
    const {data,error}=await signIn(email,pw)
    if(error){toast.error(error.message);setLoading(false);return}
    const user=data.user!;store.setUser(user.id,user.email!)
    const {data:profile}=await getProfile(user.id);if(profile)store.setProfile(profile)
    const {data:rolesData}=await getUserRoles(user.id)
    const roles=rolesData?.map((r:{role:Role})=>r.role)||[]
    store.setRoles(roles)
    if(!roles.length)router.push('/auth/select-role')
    else router.push(`/dashboard/${roles.includes('admin')?'admin':roles.includes('teacher')?'teacher':'student'}`)
    setLoading(false)
  }
  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0D2461 0%,#1B3A7A 35%,#2349A0 65%,#0D2461 100%)',backgroundSize:'300% 300%',display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'15%',right:'15%',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,200,66,.15) 0%,transparent 70%)',animation:'float 6s ease-in-out infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'15%',left:'10%',width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(100,150,255,.12) 0%,transparent 70%)',animation:'floatB 8s ease-in-out infinite',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <Link href="/" style={{textDecoration:'none',display:'inline-flex',flexDirection:'column',alignItems:'center',gap:12}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.12)',backdropFilter:'blur(20px)',border:'2px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#F5C842',boxShadow:'0 0 60px rgba(245,200,66,.2),0 12px 40px rgba(0,0,0,.25)',animation:'pulse3d 3s ease-in-out infinite'}}>PA</div>
            <div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'#FFFFFF'}}>Pahore Academy</div>
              <div style={{color:'rgba(255,255,255,.55)',fontSize:12,fontWeight:500}}>Mianwali</div>
            </div>
          </Link>
        </div>
        <div style={{background:'rgba(255,255,255,.95)',backdropFilter:'blur(24px)',borderRadius:24,padding:'36px 32px',boxShadow:'0 24px 80px rgba(0,0,0,.25),0 4px 16px rgba(0,0,0,.1)',border:'1px solid rgba(255,255,255,.9)'}}>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#0D1B35',marginBottom:4}}>Welcome back</h2>
          <p style={{color:'#8A96AB',fontSize:13.5,marginBottom:28,fontWeight:500}}>Sign in to your academy account</p>
          <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:18}}>
            <div><label className="label">Email Address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" className="input-field" required/></div>
            <div><label className="label">Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" className="input-field" required/></div>
            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',padding:'14px',justifyContent:'center',marginTop:4,opacity:loading?0.6:1,fontSize:15,borderRadius:12}}>
              {loading?'Signing In...':'Sign In →'}
            </button>
          </form>
          <div style={{height:1,background:'#E4E9F2',margin:'24px 0'}}/>
          <p style={{textAlign:'center',color:'#8A96AB',fontSize:13.5}}>No account? <Link href="/auth/register" style={{color:'#1B3A7A',textDecoration:'none',fontWeight:700}}>Create one</Link></p>
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes pulse3d{0%,100%{box-shadow:0 0 60px rgba(245,200,66,.2),0 12px 40px rgba(0,0,0,.25)}50%{box-shadow:0 0 60px rgba(245,200,66,.2),0 12px 40px rgba(0,0,0,.25),0 0 0 12px rgba(255,255,255,.06)}}`}</style>
    </div>
  )
}
