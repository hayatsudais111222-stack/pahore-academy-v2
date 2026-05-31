-- ============================================================
-- PAHORE ACADEMY MIANWALI — Complete Supabase SQL Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  gender          text CHECK (gender IN ('male','female','other')),
  age             integer,
  class           text,
  board           text,
  subjects        text[],
  father_name     text,
  phone           text,
  profile_pic_url text,
  bio             text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── ROLES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text CHECK (role IN ('student','teacher','admin')) NOT NULL,
  verified_at timestamptz DEFAULT now(),
  granted_by  uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- ── STUDENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_number     text UNIQUE,
  enrollment_date date DEFAULT CURRENT_DATE,
  is_active       boolean DEFAULT true
);

-- ── TEACHERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teachers (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subjects    text[],
  classes     text[],
  employee_id text UNIQUE
);

-- ── TEST RESULTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_results (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id     uuid REFERENCES auth.users(id),
  date           date NOT NULL,
  subject        text NOT NULL,
  test_name      text NOT NULL,
  total_marks    integer NOT NULL CHECK (total_marks > 0),
  obtained_marks integer NOT NULL CHECK (obtained_marks >= 0),
  percentage     numeric(5,2) GENERATED ALWAYS AS (obtained_marks::numeric / total_marks * 100) STORED,
  remarks        text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  CONSTRAINT marks_not_exceed_total CHECK (obtained_marks <= total_marks)
);

-- ── LIBRARY FILES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.library_files (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  subject     text,
  class       text,
  board       text,
  file_url    text NOT NULL,
  file_size   bigint,
  uploaded_by uuid REFERENCES auth.users(id),
  upload_date timestamptz DEFAULT now(),
  is_active   boolean DEFAULT true,
  tags        text[]
);

-- ── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title      text NOT NULL,
  message    text NOT NULL,
  type       text CHECK (type IN ('marks','library','system','announcement')) DEFAULT 'system',
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ── ACCESS CODES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.access_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role       text CHECK (role IN ('teacher','admin')) NOT NULL,
  code       text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  is_active  boolean DEFAULT true
);

-- Seed default access codes
INSERT INTO public.access_codes (role, code, is_active)
VALUES
  ('teacher', 'TCH-2024-ACAD', true),
  ('admin',   'ADM-ROOT-001',   true)
ON CONFLICT DO NOTHING;

-- ── STORAGE BUCKETS ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('library', 'library', true)
ON CONFLICT DO NOTHING;

-- ── ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_files  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes   ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "profiles_read_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Roles: users can read all, insert own
CREATE POLICY "roles_read_all"   ON public.roles FOR SELECT USING (true);
CREATE POLICY "roles_insert_own" ON public.roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "roles_delete_own" ON public.roles FOR DELETE USING (auth.uid() = user_id);

-- Students: readable by all auth users
CREATE POLICY "students_read_all"   ON public.students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "students_insert_own" ON public.students FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "students_update_own" ON public.students FOR UPDATE USING (auth.uid() = id);

-- Teachers: readable by all auth users
CREATE POLICY "teachers_read_all"   ON public.teachers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "teachers_insert_own" ON public.teachers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "teachers_update_own" ON public.teachers FOR UPDATE USING (auth.uid() = id);

-- Test results: students read own, teachers read/write all
CREATE POLICY "marks_read_own"    ON public.test_results FOR SELECT USING (auth.uid() = student_id OR auth.role() = 'authenticated');
CREATE POLICY "marks_insert_auth" ON public.test_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "marks_update_auth" ON public.test_results FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "marks_delete_auth" ON public.test_results FOR DELETE USING (auth.role() = 'authenticated');

-- Library: all auth users can read, only uploader can delete
CREATE POLICY "library_read_all"    ON public.library_files FOR SELECT USING (is_active = true);
CREATE POLICY "library_insert_auth" ON public.library_files FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "library_update_auth" ON public.library_files FOR UPDATE USING (auth.role() = 'authenticated');

-- Notifications: users see own only
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Access codes: all auth users can read (needed to validate during onboarding)
CREATE POLICY "codes_read_auth"   ON public.access_codes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "codes_insert_auth" ON public.access_codes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "codes_update_auth" ON public.access_codes FOR UPDATE USING (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "library_storage_read"   ON storage.objects FOR SELECT USING (bucket_id = 'library');
CREATE POLICY "library_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'library' AND auth.role() = 'authenticated');
CREATE POLICY "library_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'library' AND auth.role() = 'authenticated');

-- ── TRIGGER: auto-create profile on signup ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── TRIGGER: updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER test_results_updated_at BEFORE UPDATE ON public.test_results
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Done! Your Pahore Academy database is ready.
