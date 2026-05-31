// ============================================================
// Zustand global state — lightweight, no heavy context tree
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, Role, Notification } from '@/types'

interface AuthState {
  userId: string | null
  email: string | null
  profile: Profile | null
  roles: Role[]
  activeRole: Role | null
  notifications: Notification[]
  unreadCount: number
  // Actions
  setUser: (userId: string, email: string) => void
  setProfile: (profile: Profile) => void
  setRoles: (roles: Role[]) => void
  setActiveRole: (role: Role) => void
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAllRead: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      email: null,
      profile: null,
      roles: [],
      activeRole: null,
      notifications: [],
      unreadCount: 0,

      setUser: (userId, email) => set({ userId, email }),

      setProfile: (profile) => set({ profile }),

      setRoles: (roles) => set({
        roles,
        // Auto-set active role: prefer admin > teacher > student
        activeRole: roles.includes('admin') ? 'admin'
          : roles.includes('teacher') ? 'teacher'
          : roles.includes('student') ? 'student'
          : null,
      }),

      setActiveRole: (role) => {
        // Only allow switching to a role the user actually has
        if (get().roles.includes(role)) set({ activeRole: role })
      },

      setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.is_read).length,
      }),

      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
      })),

      markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      })),

      clearAuth: () => set({
        userId: null,
        email: null,
        profile: null,
        roles: [],
        activeRole: null,
        notifications: [],
        unreadCount: 0,
      }),
    }),
    {
      name: 'pahore-academy-auth',
      partialize: (state) => ({
        // Persist minimal state — session truth comes from Supabase
        activeRole: state.activeRole,
      }),
    }
  )
)

// UI state (not persisted)
interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
