-- ==============================================================================
-- RESOLVE LEARN — STEP 3: ADMIN AUTHENTICATION & AUTHORIZATION SCHEMA
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. ENABLE ROW LEVEL SECURITY ON PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. HELPER FUNCTION TO CHECK IF CURRENT USER IS AN ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. RLS POLICIES FOR PROFILES
-- Users can view their own profile; admins can view all profiles
DROP POLICY IF EXISTS "Users can read own profile or admin can read all" ON public.profiles;
CREATE POLICY "Users can read own profile or admin can read all"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- Only admins can update profile roles (regular users cannot promote themselves)
DROP POLICY IF EXISTS "Only admin can update profiles" ON public.profiles;
CREATE POLICY "Only admin can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. TRIGGER FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'student')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. ADMIN WRITE POLICIES FOR CONTENT TABLES
-- Normal users can only read published content (established in Step 2).
-- These policies grant INSERT, UPDATE, DELETE permissions strictly to verified admins.

-- Courses write policy
DROP POLICY IF EXISTS "Admin write access to courses" ON public.courses;
CREATE POLICY "Admin write access to courses"
  ON public.courses FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Modules write policy
DROP POLICY IF EXISTS "Admin write access to modules" ON public.modules;
CREATE POLICY "Admin write access to modules"
  ON public.modules FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Lessons write policy
DROP POLICY IF EXISTS "Admin write access to lessons" ON public.lessons;
CREATE POLICY "Admin write access to lessons"
  ON public.lessons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Assets write policy
DROP POLICY IF EXISTS "Admin write access to assets" ON public.assets;
CREATE POLICY "Admin write access to assets"
  ON public.assets FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
