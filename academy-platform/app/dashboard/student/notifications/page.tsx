'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { getUserNotifications, markNotificationRead } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'

const typeIcon: Record<string, string> = { marks: '📊', library: '📚', system: '⚙️', announcement: '📢' }
const typeColor: Record<string, string> = { marks: '#C9A84C', library: '#5B4FCF', system: '#9AA5B4', announcement: '#C9A84C' }

export default function NotificationsPage() {
  const { userId, notifications, setNotifications, markAllRead } = useAuthStore()

  useEffect(() => {
    if (!userId) return
    getUserNotifications(userId).then(({ data }) => {
      if (data) setNotifications(data)
    })
  }, [userId, setNotifications])

  const handleMarkRead = async () => {
    if (!userId) return
    const unread = notifications.filter(n => !n.is_read)
    await Promise.all(unread.map(n => markNotificationRead(n.id)))
    markAllRead()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Notifications" subtitle={`${notifications.filter(n => !n.is_read).length} unread`} />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <p className="text-text-muted text-sm">{notifications.length} total notifications</p>
            {notifications.some(n => !n.is_read) && (
              <button onClick={handleMarkRead} className="btn-secondary text-sm px-4 py-2 rounded-xl">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="card py-16 text-center">
              <div className="text-5xl mb-4">🔔</div>
              <p className="font-heading text-xl text-text-primary mb-2">All caught up!</p>
              <p className="text-text-muted">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="card flex gap-4 transition-all"
                  style={{ borderColor: !n.is_read ? typeColor[n.type] + '80' : undefined, opacity: n.is_read ? 0.7 : 1 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                    style={{ background: typeColor[n.type] + '22' }}>
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-text-primary font-medium text-sm">{n.title}</h4>
                      {!n.is_read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: typeColor[n.type] }} />}
                    </div>
                    <p className="text-text-secondary text-sm">{n.message}</p>
                    <p className="text-text-muted text-xs mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
