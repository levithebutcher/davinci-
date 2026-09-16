-- ==============================================================================
-- RESOLVE LEARN — STEP 4: ADMIN CRUD RLS POLICIES FOR CATEGORIES & CREATORS
-- ==============================================================================

-- Categories admin write policy
DROP POLICY IF EXISTS "Admin write access to categories" ON public.categories;
CREATE POLICY "Admin write access to categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Creators admin write policy
DROP POLICY IF EXISTS "Admin write access to creators" ON public.creators;
CREATE POLICY "Admin write access to creators"
  ON public.creators FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
