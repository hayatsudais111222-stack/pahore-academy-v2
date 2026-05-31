// ============================================================
// PAHORE ACADEMY — All TypeScript Types
// ============================================================

export type Role = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  gender: 'male' | 'female' | 'other' | null
  age: number | null
  class: string | null
  board: string | null
  subjects: string[] | null
  father_name: string | null
  phone: string | null
  profile_pic_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: Role
  verified_at: string | null
  granted_by: string | null
}

export interface Student {
  id: string
  roll_number: string | null
  enrollment_date: string
  is_active: boolean
}

export interface Teacher {
  id: string
  subjects: string[]
  classes: string[]
  employee_id: string | null
}

export interface TestResult {
  id: string
  student_id: string
  teacher_id: string | null
  date: string
  subject: string
  test_name: string
  total_marks: number
  obtained_marks: number
  percentage: number
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface LibraryFile {
  id: string
  title: string
  description: string | null
  subject: string | null
  class: string | null
  board: string | null
  file_url: string
  file_size: number | null
  uploaded_by: string | null
  upload_date: string
  is_active: boolean
  tags: string[] | null
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'marks' | 'library' | 'system' | 'announcement'
  is_read: boolean
  created_at: string
}

export interface AccessCode {
  id: string
  role: 'teacher' | 'admin'
  code: string
  created_by: string | null
  created_at: string
  is_active: boolean
}

// Combined types for display
export interface FullUser {
  user: User
  profile: Profile | null
  roles: Role[]
  student?: Student | null
  teacher?: Teacher | null
}

export interface TestResultWithProfile extends TestResult {
  student_profile?: Profile
  teacher_profile?: Profile
}

// Auth types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  full_name: string
}

export interface StudentOnboardingData {
  class: string
  board: string
  subjects: string[]
  father_name: string
  phone: string
  age: number
  gender: 'male' | 'female' | 'other'
  bio?: string
}

export interface RoleCodeFormData {
  code: string
}

// Analytics types
export interface SubjectAverage {
  subject: string
  average: number
  highest: number
  lowest: number
  count: number
}

export interface StudentRanking {
  student_id: string
  full_name: string
  roll_number: string | null
  average_percentage: number
  rank: number
}

export interface ClassAnalytics {
  total_students: number
  active_students: number
  total_tests: number
  class_average: number
  subject_averages: SubjectAverage[]
  top_students: StudentRanking[]
}

// Table column types
export interface MarksTableRow {
  id: string
  student_name: string
  roll_number: string | null
  subject: string
  test_name: string
  date: string
  total_marks: number
  obtained_marks: number
  percentage: number
  remarks: string | null
}

// AI types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AICalculatorInput {
  marks: Array<{
    subject: string
    obtained: number
    total: number
  }>
  class?: string
}
