import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
export const metadata: Metadata = { title:'Pahore Academy Mianwali', description:'Academy Management Platform — Pahore Academy Mianwali' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      </head>
      <body style={{background:'#F7F8FC',color:'#0D1B35',fontFamily:'Inter,sans-serif'}}>
        {children}
        <Toaster position="top-right" toastOptions={{style:{background:'#FFFFFF',color:'#0D1B35',border:'1px solid #E4E9F2',borderRadius:'14px',fontFamily:'Inter,sans-serif',boxShadow:'0 8px 32px rgba(27,58,122,.12)',fontSize:'14px'},success:{iconTheme:{primary:'#1B3A7A',secondary:'#FFFFFF'}},error:{iconTheme:{primary:'#C53030',secondary:'#FFFFFF'}}}}/>
      </body>
    </html>
  )
}
