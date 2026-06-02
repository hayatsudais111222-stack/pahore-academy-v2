import Link from 'next/link'
import Image from 'next/image'

const LOGO = "https://pncfshbflkmyjengdlyb.supabase.co/storage/v1/object/public/assets/WhatsApp%20Image%202026-05-09%20at%2011.43.04%20AM%20(2).jpeg"

export default function LandingPage() {
  const features = [
    {icon:'📊',title:'Marks Management',desc:'Editable spreadsheet-style marks sheets with auto-calculated percentages, grades, and performance trends.',grad:'#EEF2FF',accent:'#1B3A7A'},
    {icon:'👤',title:'Student Profiles',desc:'Complete student records — personal info, class, board, subjects, and full marks history in one elegant view.',grad:'#FFFBEB',accent:'#92400E'},
    {icon:'📚',title:'Digital Library',desc:'Upload and browse PDFs — textbooks, past papers, and notes — organized by subject, class, and board.',grad:'#EEF2FF',accent:'#1B3A7A'},
    {icon:'🤖',title:'AI Study Assistant',desc:'Powered by Claude AI — explains concepts, solves problems, and personalizes guidance for each student.',grad:'#FFFBEB',accent:'#92400E'},
    {icon:'📈',title:'Analytics & Reports',desc:'Deep class analytics, subject rankings, student performance charts, and exportable CSV reports.',grad:'#EEF2FF',accent:'#1B3A7A'},
    {icon:'🔐',title:'Multi-Role System',desc:'One account holds Student + Teacher + Admin roles with a seamless switcher and role-based dashboards.',grad:'#FFFBEB',accent:'#92400E'},
  ]
  const roles = [
    {label:'Student',icon:'🎓',badge:'#EDE9FE',badgeText:'#5B21B6',items:['View complete marks history','Access digital library','AI study assistant','Profile management','Real-time notifications']},
    {label:'Teacher',icon:'📝',badge:'#FEF3C7',badgeText:'#92400E',items:['Enter & edit student marks','Spreadsheet-style sheets','Class reports & charts','Upload library files','AI marks calculator']},
    {label:'Admin',  icon:'⚙️',badge:'#FEE2E2',badgeText:'#991B1B',items:['Full student database','User & role management','Rotate access codes','Analytics dashboard','Export CSV reports']},
  ]

  return (
    <div style={{minHeight:'100vh',background:'#F7F8FC',fontFamily:'Inter,sans-serif',overflowX:'hidden'}}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(1deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes pulse3d{0%,100%{box-shadow:0 0 0 0 rgba(27,58,122,.2),0 20px 60px rgba(0,0,0,.3)}50%{box-shadow:0 0 0 16px rgba(27,58,122,0),0 20px 60px rgba(0,0,0,.3)}}
        @keyframes shimmer{0%{background-position:-300% center}100%{background-position:300% center}}
        @keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
        @keyframes rotateLogo{0%{transform:rotateY(0deg) scale(1)}50%{transform:rotateY(10deg) scale(1.05)}100%{transform:rotateY(0deg) scale(1)}}
        .pa-hero{background:linear-gradient(135deg,#0C1F5C 0%,#1B3A7A 28%,#2349A0 58%,#1A4F9E 80%,#0C1F5C 100%);background-size:300% 300%;animation:gradShift 10s ease infinite}
        .pa-shimmer{background:linear-gradient(90deg,#F5C842,#FBE08A,#E8AB12,#FBE08A,#F5C842);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
        .pa-logo-spin{animation:rotateLogo 4s ease-in-out infinite}
        .pa-orb1{animation:float 6s ease-in-out infinite}
        .pa-orb2{animation:floatB 8s ease-in-out infinite}
        .pa-pulse{animation:pulse3d 3s ease-in-out infinite}
        .pa-fade1{animation:fadeUp .65s cubic-bezier(.22,.68,0,1.2) .05s both}
        .pa-fade2{animation:fadeUp .65s cubic-bezier(.22,.68,0,1.2) .15s both}
        .pa-fade3{animation:fadeUp .65s cubic-bezier(.22,.68,0,1.2) .25s both}
        .pa-fade4{animation:fadeUp .65s cubic-bezier(.22,.68,0,1.2) .35s both}
        .pa-fade5{animation:fadeUp .65s cubic-bezier(.22,.68,0,1.2) .48s both}
        .pa-scale{animation:scaleIn .8s cubic-bezier(.22,.68,0,1.2) both}
        .feat-card{background:#fff;border:1px solid #E4E9F2;border-radius:20px;padding:30px 26px;box-shadow:0 2px 12px rgba(27,58,122,.06);transition:transform .3s cubic-bezier(.22,.68,0,1.2),box-shadow .3s ease;position:relative;overflow:hidden;cursor:default}
        .feat-card:hover{transform:perspective(900px) rotateX(3deg) rotateY(-3deg) translateY(-6px) scale(1.02);box-shadow:0 24px 60px rgba(27,58,122,.14)}
        .role-card{background:rgba(255,255,255,.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:30px 26px;box-shadow:0 8px 32px rgba(0,0,0,.15);transition:transform .3s cubic-bezier(.22,.68,0,1.2),box-shadow .3s ease}
        .role-card:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.25)}
        .btn-hero-gold{background:linear-gradient(135deg,#C9960A,#E8AB12,#F5C842);color:#fff;text-decoration:none;padding:16px 44px;border-radius:14px;font-weight:700;font-size:16px;box-shadow:0 8px 32px rgba(201,150,10,.45);display:inline-flex;align-items:center;gap:8px;transition:all .3s;border:none;cursor:pointer}
        .btn-hero-ghost{background:rgba(255,255,255,.14);color:#fff;text-decoration:none;padding:16px 44px;border-radius:14px;font-weight:700;font-size:16px;border:1.5px solid rgba(255,255,255,.38);backdrop-filter:blur(10px);display:inline-flex;align-items:center;gap:8px;transition:all .3s}
        .btn-hero-gold:hover{box-shadow:0 12px 40px rgba(201,150,10,.55);transform:translateY(-2px)}
        .btn-hero-ghost:hover{background:rgba(255,255,255,.22);transform:translateY(-2px)}
        .nav-pill{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:200;width:calc(100% - 48px);max-width:1100px;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(255,255,255,.92);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(228,233,242,.85);border-radius:22px;box-shadow:0 8px 40px rgba(27,58,122,.1)}
        .nav-link{color:#3D4F6B;text-decoration:none;font-size:13.5px;font-weight:500;transition:color .2s}
        .nav-link:hover{color:#1B3A7A}
        .logo-ring{border-radius:50%;padding:5px;background:linear-gradient(135deg,rgba(245,200,66,.5),rgba(255,255,255,.2),rgba(245,200,66,.5));box-shadow:0 0 40px rgba(245,200,66,.3),0 8px 32px rgba(0,0,0,.3)}
        @media(max-width:700px){.nav-pill > div:nth-child(2){display:none}}
        @media(max-width:500px){.btn-hero-gold,.btn-hero-ghost{padding:14px 28px;font-size:14px}}
      `}</style>

      {/* NAV */}
      <nav className="nav-pill">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:42,height:42,borderRadius:'50%',overflow:'hidden',border:'2px solid #C9960A',boxShadow:'0 3px 12px rgba(27,58,122,.25)',flexShrink:0}}>
            <img src={LOGO} alt="Pahore Academy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
          <div>
            <div style={{fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:15,color:'#1B3A7A',lineHeight:1.2}}>Pahore Academy</div>
            <div style={{color:'#8A96AB',fontSize:11,fontWeight:500}}>Mianwali</div>
          </div>
        </div>
        <div style={{display:'flex',gap:28,alignItems:'center'}}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#roles"    className="nav-link">Roles</a>
          <a href="#about"    className="nav-link">About</a>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Link href="/auth/login"    style={{color:'#1B3A7A',textDecoration:'none',fontSize:13.5,padding:'9px 20px',border:'1.5px solid rgba(27,58,122,.22)',borderRadius:10,fontWeight:700,background:'#EEF2FF'}}>Sign In</Link>
          <Link href="/auth/register" style={{background:'linear-gradient(135deg,#1B3A7A,#2349A0)',color:'#fff',textDecoration:'none',fontSize:13.5,padding:'9px 22px',borderRadius:10,fontWeight:700,boxShadow:'0 4px 16px rgba(27,58,122,.28)'}}>Get Started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pa-hero" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'130px 24px 110px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:800,height:800,borderRadius:'50%',border:'1px solid rgba(255,255,255,.05)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:1100,height:1100,borderRadius:'50%',border:'1px solid rgba(255,255,255,.03)',pointerEvents:'none'}}/>
        <div className="pa-orb1" style={{position:'absolute',top:'18%',right:'14%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,200,66,.18) 0%,transparent 68%)',pointerEvents:'none'}}/>
        <div className="pa-orb2" style={{position:'absolute',bottom:'22%',left:'10%',width:260,height:260,borderRadius:'50%',background:'radial-gradient(circle,rgba(100,150,255,.14) 0%,transparent 68%)',pointerEvents:'none'}}/>

        <div style={{position:'relative',zIndex:1,maxWidth:820}}>
          {/* REAL LOGO */}
          <div className="pa-scale" style={{marginBottom:36}}>
            <div className="pa-pulse logo-ring" style={{width:150,height:150,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div className="pa-logo-spin" style={{width:140,height:140,borderRadius:'50%',overflow:'hidden',border:'3px solid rgba(245,200,66,.6)'}}>
                <img src={LOGO} alt="Pahore Academy Mianwali" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
            </div>
          </div>

          <div className="pa-fade1" style={{color:'rgba(245,200,66,.9)',fontSize:11,fontWeight:700,letterSpacing:'.24em',textTransform:'uppercase',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
            <span style={{display:'inline-block',height:1,width:44,background:'rgba(245,200,66,.38)'}}/>
            Est. 2024 · Mianwali, Punjab, Pakistan
            <span style={{display:'inline-block',height:1,width:44,background:'rgba(245,200,66,.38)'}}/>
          </div>

          <h1 className="pa-fade2" style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(46px,8vw,86px)',fontWeight:700,lineHeight:1.06,color:'#FFFFFF',marginBottom:12,textShadow:'0 4px 28px rgba(0,0,0,.22)'}}>Pahore Academy</h1>
          <h2 className="pa-shimmer pa-fade3" style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(28px,5vw,50px)',fontWeight:700,marginBottom:30}}>Mianwali</h2>

          <p className="pa-fade4" style={{color:'rgba(255,255,255,.76)',fontSize:17,lineHeight:1.9,marginBottom:52,maxWidth:580,marginLeft:'auto',marginRight:'auto'}}>
            A complete digital management platform — student records, marks tracking, digital library, and AI-powered learning. Trusted by 3,000+ students.
          </p>

          <div className="pa-fade5" style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:76}}>
            <Link href="/auth/register" className="btn-hero-gold">🎓 Join the Academy</Link>
            <Link href="/auth/login"    className="btn-hero-ghost">Sign In →</Link>
          </div>

          <div className="pa-fade5" style={{display:'flex',background:'rgba(255,255,255,.09)',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:'1px solid rgba(255,255,255,.14)',borderRadius:22,maxWidth:500,margin:'0 auto',overflow:'hidden'}}>
            {[['3,000+','Students'],['14+','Subjects'],['100%','Digital'],['AI','Powered']].map(([n,l],i)=>(
              <div key={l} style={{flex:1,textAlign:'center',padding:'20px 10px',borderRight:i<3?'1px solid rgba(255,255,255,.1)':'none'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:24,fontWeight:700,color:'#F5C842',marginBottom:3}}>{n}</div>
                <div style={{color:'rgba(255,255,255,.52)',fontSize:9.5,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:700}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{position:'absolute',bottom:0,left:0,right:0,lineHeight:0}}>
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" style={{display:'block',width:'100%'}}>
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#F7F8FC"/>
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:'100px 24px 60px',background:'#F7F8FC'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#EEF2FF,#E4ECFF)',color:'#1B3A7A',fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',padding:'7px 20px',borderRadius:999,marginBottom:18,border:'1px solid rgba(27,58,122,.1)',boxShadow:'0 2px 10px rgba(27,58,122,.08)'}}>✦ Platform Features</div>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(30px,5vw,48px)',fontWeight:700,color:'#0D1B35',marginBottom:14}}>Everything in One Place</h2>
          <p style={{color:'#3D4F6B',fontSize:16,maxWidth:500,margin:'0 auto',lineHeight:1.8}}>Built for Pahore Academy Mianwali — complete digital management from one powerful platform.</p>
          <div style={{height:3,background:'linear-gradient(90deg,transparent,#C9960A,transparent)',maxWidth:160,margin:'24px auto 0',borderRadius:99}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:22,maxWidth:1040,margin:'0 auto'}}>
          {features.map(({icon,title,desc,grad,accent})=>(
            <div key={title} className="feat-card">
              <div style={{width:58,height:58,borderRadius:16,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:20,boxShadow:`0 6px 20px ${grad}cc`}}>{icon}</div>
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:19,fontWeight:700,color:'#0D1B35',marginBottom:10}}>{title}</h3>
              <p style={{color:'#3D4F6B',fontSize:13.5,lineHeight:1.82}}>{desc}</p>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${accent}55,transparent)`}}/>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" style={{background:'linear-gradient(135deg,#0D2461 0%,#1B3A7A 40%,#2349A0 100%)',padding:'90px 24px 115px',position:'relative',overflow:'hidden',marginTop:50}}>
        <div style={{position:'absolute',top:0,right:0,width:520,height:520,borderRadius:'50%',background:'rgba(255,255,255,.035)',pointerEvents:'none'}}/>
        <div style={{textAlign:'center',marginBottom:56,position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(245,200,66,.13)',color:'#F5C842',fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',padding:'7px 20px',borderRadius:999,marginBottom:18,border:'1px solid rgba(245,200,66,.22)'}}>✦ Access Levels</div>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(28px,5vw,44px)',fontWeight:700,color:'#FFFFFF'}}>Three Roles, One Platform</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24,maxWidth:960,margin:'0 auto',position:'relative',zIndex:1}}>
          {roles.map(({label,icon,badge,badgeText,items})=>(
            <div key={label} className="role-card">
              <div style={{fontSize:46,textAlign:'center',marginBottom:14,filter:'drop-shadow(0 4px 10px rgba(0,0,0,.22))'}}>{icon}</div>
              <div style={{textAlign:'center',marginBottom:22}}><span style={{background:badge,color:badgeText,padding:'4px 16px',borderRadius:999,fontSize:12,fontWeight:700,letterSpacing:'.04em'}}>{label}</span></div>
              <ul style={{listStyle:'none'}}>
                {items.map(item=>(
                  <li key={item} style={{color:'rgba(255,255,255,.82)',fontSize:13.5,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',gap:10,alignItems:'flex-start',lineHeight:1.45}}>
                    <span style={{color:'#F5C842',fontSize:12,marginTop:2,flexShrink:0}}>✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0,lineHeight:0}}>
          <svg viewBox="0 0 1440 70" xmlns="http://www.w3.org/2000/svg" style={{display:'block',width:'100%'}}>
            <path d="M0,35 C360,70 1080,0 1440,35 L1440,70 L0,70 Z" fill="#F7F8FC"/>
          </svg>
        </div>
      </section>

      {/* CTA */}
      <section id="about" style={{padding:'100px 24px',textAlign:'center',background:'#F7F8FC'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <div className="pa-pulse" style={{width:100,height:100,borderRadius:'50%',overflow:'hidden',margin:'0 auto 28px',border:'3px solid #C9960A',boxShadow:'0 12px 40px rgba(27,58,122,.32)'}}>
            <img src={LOGO} alt="Pahore Academy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(28px,5vw,44px)',fontWeight:700,color:'#0D1B35',marginBottom:18}}>Ready to Get Started?</h2>
          <p style={{color:'#3D4F6B',fontSize:16,lineHeight:1.88,marginBottom:46}}>Join Pahore Academy Mianwali&apos;s digital platform today. Create your account in seconds and access everything — marks, library, AI, and more.</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/auth/register" style={{background:'linear-gradient(135deg,#1B3A7A,#2349A0)',color:'#fff',textDecoration:'none',padding:'16px 44px',borderRadius:14,fontWeight:700,fontSize:16,display:'inline-block',boxShadow:'0 8px 32px rgba(27,58,122,.32)'}}>Create Your Account →</Link>
            <Link href="/auth/login"    style={{background:'#EEF2FF',color:'#1B3A7A',textDecoration:'none',padding:'16px 44px',borderRadius:14,fontWeight:700,fontSize:16,display:'inline-block',border:'1.5px solid rgba(27,58,122,.18)'}}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'linear-gradient(135deg,#0D2461,#1B3A7A)',padding:'44px 24px',textAlign:'center'}}>
        <div style={{width:60,height:60,borderRadius:'50%',overflow:'hidden',margin:'0 auto 14px',border:'2px solid rgba(245,200,66,.5)'}}>
          <img src={LOGO} alt="Pahore Academy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>
        <div style={{fontFamily:'Playfair Display,serif',color:'#F5C842',fontSize:22,fontWeight:700,marginBottom:8}}>Pahore Academy Mianwali</div>
        <div style={{color:'rgba(255,255,255,.38)',fontSize:12,marginBottom:24}}>© 2024 · All Rights Reserved · Mianwali, Punjab, Pakistan</div>
      </footer>
    </div>
  )
}
