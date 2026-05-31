// ============================================================
// Supabase client — all DB calls go through this file
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (use only in API routes)
export const createAdminClient = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

// ---- Auth helpers ----

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export async function getUser() {
  return supabase.auth.getUser()
}

// ---- Profile helpers ----

export async function getProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function upsertProfile(profile: Record<string, unknown>) {
  return supabase.from('profiles').upsert(profile).select().single()
}

// ---- Roles helpers ----

export async function getUserRoles(userId: string) {
  return supabase.from('roles').select('role').eq('user_id', userId)
}

export async function addRole(userId: string, role: string, grantedBy?: string) {
  return supabase.from('roles').insert({
    user_id: userId,
    role,
    verified_at: new Date().toISOString(),
    granted_by: grantedBy || userId,
  })
}

// ---- Students helpers ----

export async function getAllStudents() {
  return supabase
    .from('profiles')
    .select(`
      *,
      students!inner(*),
      roles!inner(role)
    `)
    .eq('roles.role', 'student')
    .eq('students.is_active', true)
}

export async function getStudentByRoll(rollNumber: string) {
  return supabase
    .from('students')
    .select(`*, profiles(*)`)
    .eq('roll_number', rollNumber)
    .single()
}

// ---- Marks helpers ----

export async function getStudentMarks(studentId: string) {
  return supabase
    .from('test_results')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
}

export async function insertTestResult(result: Record<string, unknown>) {
  return supabase.from('test_results').insert(result).select().single()
}

export async function updateTestResult(id: string, updates: Record<string, unknown>) {
  return supabase.from('test_results').update(updates).eq('id', id).select().single()
}

export async function deleteTestResult(id: string) {
  return supabase.from('test_results').delete().eq('id', id)
}

export async function getClassMarks(className: string) {
  return supabase
    .from('test_results')
    .select(`*, profiles!test_results_student_id_fkey(full_name, class)`)
    .eq('profiles.class', className)
}

// ---- Library helpers ----

export async function getLibraryFiles(filters?: { subject?: string; class?: string; board?: string }) {
  let query = supabase.from('library_files').select('*').eq('is_active', true).order('upload_date', { ascending: false })
  if (filters?.subject) query = query.eq('subject', filters.subject)
  if (filters?.class) query = query.eq('class', filters.class)
  if (filters?.board) query = query.eq('board', filters.board)
  return query
}

export async function uploadLibraryFile(file: File, meta: Record<string, unknown>) {
  // Upload file to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`
  const { data: storageData, error: storageError } = await supabase.storage
    .from('library')
    .upload(fileName, file)

  if (storageError) return { data: null, error: storageError }

  const { data: { publicUrl } } = supabase.storage.from('library').getPublicUrl(fileName)

  return supabase.from('library_files').insert({
    ...meta,
    file_url: publicUrl,
    file_size: file.size,
    upload_date: new Date().toISOString(),
  }).select().single()
}

// ---- Notifications helpers ----

export async function getUserNotifications(userId: string) {
  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
}

export async function markNotificationRead(id: string) {
  return supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export async function createNotification(notification: Record<string, unknown>) {
  return supabase.from('notifications').insert(notification)
}

// ---- Access codes ----

export async function validateAccessCode(code: string, role: 'teacher' | 'admin') {
  const { data, error } = await supabase
    .from('access_codes')
    .select('*')
    .eq('code', code)
    .eq('role', role)
    .eq('is_active', true)
    .single()
  return { valid: !error && !!data, data, error }
}

export async function rotateAccessCode(role: 'teacher' | 'admin', newCode: string, adminId: string) {
  // Deactivate old codes
  await supabase.from('access_codes').update({ is_active: false }).eq('role', role)
  // Create new code
  return supabase.from('access_codes').insert({
    role, code: newCode, created_by: adminId, is_active: true,
  })
}
