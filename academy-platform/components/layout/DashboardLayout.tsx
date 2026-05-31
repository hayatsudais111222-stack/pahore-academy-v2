import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <Sidebar />
      <Topbar title={title} subtitle={subtitle} />
      <main
        className="transition-all pt-[60px]"
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
