'use client'
import {useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {signUp,upsertProfile} from '@/lib/supabase'
import {useAuthStore} from '@/store'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router=useRouter();const store=useAuthStore()
  const [form,setForm]=useState({email:'',password:'',confirm:'',full_name:''})
  const [loading,setLoading]=useState(false)
  const up=(k:string,v:string)=>setForm(p=>({...p,[k]:v}))
  const handle=async(e:React.FormEvent)=>{
    e.preventDefault()
    if(form.password!==form.confirm){toast.error('Passwords do not match');return}
    if(form.password.length<8){toast.error('Password min 8 characters');return}
    setLoading(true)
    const {data,error}=await signUp(form.email,form.password)
    if(error){toast.error(error.message);setLoading(false);return}
    const user=data.user!;store.setUser(user.id,user.email!)
    const {data:profile}=await upsertProfile({id:user.id,full_name:form.full_name})
    if(profile)store.setProfile(profile)
    toast.success('Account created! Welcome 🎓')
    router.push('/auth/select-role');setLoading(false)
  }
  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0D2461 0%,#1B3A7A 35%,#2349A0 65%,#0D2461 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'10%',left:'12%',width:240,height:240,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,200,66,.12) 0%,transparent 70%)',animation:'float 7s ease-in-out infinite',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <Link href="/" style={{textDecoration:'none',display:'inline-flex',flexDirection:'column',alignItems:'center',gap:12}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.12)',backdropFilter:'blur(20px)',border:'2px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#F5C842',boxShadow:'0 0 60px rgba(245,200,66,.2),0 12px 40px rgba(0,0,0,.25)'}}><img src='https://pncfshbflkmyjengdlyb.supabase.co/storage/v1/object/public/assets/WhatsApp%20Image%202026-05-09%20at%2011.43.04%20AM%20(2).jpeg' alt='Pahore Academy' style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/></div>
            <div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'#FFFFFF'}}>Pahore Academy</div>
              <div style={{color:'rgba(255,255,255,.55)',fontSize:12}}>Mianwali</div>
            </div>
          </Link>
        </div>
        <div style={{background:'rgba(255,255,255,.95)',backdropFilter:'blur(24px)',borderRadius:24,padding:'36px 32px',boxShadow:'0 24px 80px rgba(0,0,0,.25)',border:'1px solid rgba(255,255,255,.9)'}}>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:700,color:'#0D1B35',marginBottom:4}}>Create Account</h2>
          <p style={{color:'#8A96AB',fontSize:13.5,marginBottom:28,fontWeight:500}}>Join Pahore Academy&apos;s digital platform</p>
          <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div><label className="label">Full Name</label><input type="text" value={form.full_name} onChange={e=>up('full_name',e.target.value)} placeholder="Muhammad Ali" className="input-field" required/></div>
            <div><label className="label">Email Address</label><input type="email" value={form.email} onChange={e=>up('email',e.target.value)} placeholder="your@email.com" className="input-field" required/></div>
            <div><label className="label">Password</label><input type="password" value={form.password} onChange={e=>up('password',e.target.value)} placeholder="Min 8 characters" className="input-field" required/></div>
            <div><label className="label">Confirm Password</label><input type="password" value={form.confirm} onChange={e=>up('confirm',e.target.value)} placeholder="Repeat password" className="input-field" required/></div>
            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',padding:'14px',justifyContent:'center',marginTop:4,opacity:loading?0.6:1,fontSize:15,borderRadius:12}}>
              {loading?'Creating...':'Create Account →'}
            </button>
          </form>
          <div style={{height:1,background:'#E4E9F2',margin:'24px 0'}}/>
          <p style={{textAlign:'center',color:'#8A96AB',fontSize:13.5}}>Already have an account? <Link href="/auth/login" style={{color:'#1B3A7A',textDecoration:'none',fontWeight:700}}>Sign in</Link></p>
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  )
}
