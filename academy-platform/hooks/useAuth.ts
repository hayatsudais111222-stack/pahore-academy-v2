'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getProfile, getUserRoles } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import type { Role } from '@/types'

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const store = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Initialize session from Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        store.setUser(session.user.id, session.user.email!)
        // Load profile
        const { data: profile } = await getProfile(session.user.id)
        if (profile) store.setProfile(profile)
        // Load roles
        const { data: rolesData } = await getUserRoles(session.user.id)
        if (rolesData) store.setRoles(rolesData.map((r: { role: Role }) => r.role))
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        store.clearAuth()
        router.push('/auth/login')
      } else if (session?.user) {
        store.setUser(session.user.id, session.user.email!)
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    store.clearAuth()
    router.push('/auth/login')
  }

  return {
    ...store,
    loading,
    logout,
    isAuthenticated: !!store.userId,
    hasRole: (role: Role) => store.roles.includes(role),
  }
}
