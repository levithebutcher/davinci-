-- ==============================================================================
-- RESOLVE LEARN — INITIAL DATABASE SCHEMA & ROW LEVEL SECURITY
-- Step 2: Database foundation with RLS policies and seed data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creators table
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  channel_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table (Course -> Modules)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table (Module -> Lessons)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  youtube_video_id TEXT, -- Sample ID, no YouTube API needed
  source_url TEXT,
  duration_minutes INTEGER,
  level TEXT,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  preview_url TEXT,
  download_url TEXT,
  source_url TEXT,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  license_name TEXT,
  license_url TEXT,
  attribution_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(published);
CREATE INDEX IF NOT EXISTS idx_assets_slug ON assets(slug);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- 5. PUBLIC READ-ONLY POLICIES
-- Anyone can view categories
DROP POLICY IF EXISTS "Public read access to categories" ON categories;
CREATE POLICY "Public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Anyone can view public creators
DROP POLICY IF EXISTS "Public read access to creators" ON creators;
CREATE POLICY "Public read access to creators"
  ON creators FOR SELECT
  USING (true);

-- Only published courses are viewable publicly
DROP POLICY IF EXISTS "Public read access to published courses" ON courses;
CREATE POLICY "Public read access to published courses"
  ON courses FOR SELECT
  USING (published = true);

-- Modules are viewable only if their parent course is published
DROP POLICY IF EXISTS "Public read access to modules of published courses" ON modules;
CREATE POLICY "Public read access to modules of published courses"
  ON modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
        AND courses.published = true
    )
  );

-- Only published lessons are viewable publicly
DROP POLICY IF EXISTS "Public read access to published lessons" ON lessons;
CREATE POLICY "Public read access to published lessons"
  ON lessons FOR SELECT
  USING (published = true);

-- Anyone can view assets
DROP POLICY IF EXISTS "Public read access to assets" ON assets;
CREATE POLICY "Public read access to assets"
  ON assets FOR SELECT
  USING (true);

-- NO INSERT, UPDATE, OR DELETE POLICIES CREATED FOR PUBLIC (Admin writes will be handled in later steps)

-- ==============================================================================
-- 6. SEED DATA
-- ==============================================================================

-- Seed Categories
INSERT INTO categories (id, name, slug, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Editing', 'editing', 'Timeline editing, cut page fast assembly, trimming, and multi-cam workflows.'),
  ('22222222-2222-2222-2222-222222222222', 'Color', 'color', 'Primary wheels, scopes, color space transforms (CST), and studio look development.'),
  ('33333333-3333-3333-3333-333333333333', 'Fusion', 'fusion', 'Node-based compositing, screen replacement, planar tracking, and title design.'),
  ('44444444-4444-4444-4444-444444444444', 'Fairlight', 'fairlight', 'Broadcast dialogue cleanup, compression, equalizer curves, and loudness compliance.')
ON CONFLICT (slug) DO NOTHING;

-- Seed Creators
INSERT INTO creators (id, name, channel_url, website_url) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Casey Faris', 'https://youtube.com', 'https://caseyfaris.com'),
  ('c0000002-0000-0000-0000-000000000002', 'Darren Mostyn', 'https://youtube.com', 'https://darrenmostyn.co.uk'),
  ('c0000003-0000-0000-0000-000000000003', 'Cullen Kelly', 'https://youtube.com', 'https://cullenkelly.com'),
  ('c0000004-0000-0000-0000-000000000004', 'Patrick Stirling', 'https://youtube.com', 'https://patrickstirling.com'),
  ('c0000005-0000-0000-0000-000000000005', 'Jason Yadlovski', 'https://youtube.com', 'https://jasonyadlovski.com'),
  ('c0000006-0000-0000-0000-000000000006', 'Resolve Studio Lab', 'https://github.com', NULL)
ON CONFLICT DO NOTHING;

-- Seed Courses
INSERT INTO courses (id, title, slug, description, level, category_id, creator_id, published) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'DaVinci Resolve Fundamentals', 'davinci-resolve-fundamentals', 'A complete introduction to the all-in-one post-production suite. Learn project setup, media ingestion, cut vs. edit page, and your first export.', 'beginner', '11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', true),
  ('d0000002-0000-0000-0000-000000000002', 'Complete Editing Workflow', 'complete-editing-workflow', 'Master professional timeline navigation, ripple edits, slip and slide trimming, keyboard shortcuts, and sync sound workflows.', 'beginner', '11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', true),
  ('d0000003-0000-0000-0000-000000000003', 'Color Grading Fundamentals', 'color-grading-fundamentals', 'Demystify color science. Understand lift/gamma/gain wheels, scopes (waveform, vectorscope, parade), primary vs. log controls, and clean contrast.', 'beginner', '22222222-2222-2222-2222-222222222222', 'c0000003-0000-0000-0000-000000000003', true),
  ('d0000004-0000-0000-0000-000000000004', 'Fusion Essentials', 'fusion-essentials', 'Step into node-based compositing without fear. Learn how nodes flow, merge operations, masks, keyframes, and simple title motion graphics.', 'intermediate', '33333333-3333-3333-3333-333333333333', 'c0000004-0000-0000-0000-000000000004', true),
  ('d0000005-0000-0000-0000-000000000005', 'Fairlight Audio Basics', 'fairlight-audio-basics', 'Elevate your productions with pristine audio. Master dialogue EQ, vocal compressor sidechains, track busses, and loudness standard compliance.', 'beginner', '44444444-4444-4444-4444-444444444444', 'c0000005-0000-0000-0000-000000000005', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed Modules for Course 1
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Module 01: Project Setup & Ingestion', 'Establishing libraries and importing media.', 1),
  ('b0000002-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'Module 02: Cut & Edit Mechanics', 'Rough cuts, timeline tools, and trimming.', 2)
ON CONFLICT DO NOTHING;

-- Seed Lessons for Module 1
INSERT INTO lessons (id, module_id, creator_id, title, slug, description, youtube_video_id, duration_minutes, level, order_index, published) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Setting Up Your Database & Project Archive', 'database-and-project-archive', 'How DaVinci Resolve manages project libraries on your drive.', 'SAMPLE_vid_01', 12, 'beginner', 1, true),
  ('e0000002-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Media Ingest, Smart Bins & Metadata', 'media-ingest-and-smart-bins', 'Tagging footage and setting up smart search bins.', 'SAMPLE_vid_02', 18, 'beginner', 2, true)
ON CONFLICT DO NOTHING;

-- Seed Assets
INSERT INTO assets (id, title, slug, description, category, preview_url, download_url, source_url, creator_id, license_name, attribution_required) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Kodak 2383 Film Print Emulation LUT', 'kodak-2383-lut', 'Accurate 3D LUT modeled on legendary 35mm film print stock for rich split tones and gentle highlight roll-off.', 'luts', NULL, 'https://example.com/assets/kodak-2383', 'https://example.com/assets/kodak-2383', 'c0000006-0000-0000-0000-000000000006', 'Free for Commercial Use (CC-BY 4.0)', true),
  ('a0000002-0000-0000-0000-000000000002', 'Cinematic Title & Lower Thirds Pack', 'cinematic-titles-pack', 'Minimalist editorial title templates with customizable fonts, tracking speed, and auto-scaling bounding boxes.', 'templates', NULL, 'https://example.com/assets/editorial-titles', 'https://example.com/assets/editorial-titles', 'c0000004-0000-0000-0000-000000000004', 'Free for Personal & Commercial Use', false),
  ('a0000003-0000-0000-0000-000000000003', 'Foley & Whoosh Transition SFX Kit', 'whoosh-sfx-kit', 'High-definition 96kHz/24-bit sound effects designed for clean edit points, subtle impacts, and UI feedback.', 'sound-effects', NULL, 'https://example.com/assets/whoosh-sfx', 'https://example.com/assets/whoosh-sfx', 'c0000005-0000-0000-0000-000000000005', 'Royalty Free (CC0 Public Domain)', false),
  ('a0000004-0000-0000-0000-000000000004', '35mm Authentic Film Grain & Dust Overlay', '35mm-film-grain', 'Scanned from genuine Kodak 5219 negative film stock. 4K ProRes 422 seamless loop ready for overlay blend mode.', 'overlays', NULL, 'https://example.com/assets/35mm-grain', 'https://example.com/assets/35mm-grain', 'c0000006-0000-0000-0000-000000000006', 'Free for Commercial Projects', true),
  ('a0000005-0000-0000-0000-000000000005', 'Smooth Whip Pan & Zoom Transitions', 'whip-pan-transitions', 'Natural optical blur transitions with motion blur calculation that seamlessly connect moving camera shots.', 'transitions', NULL, 'https://example.com/assets/whip-pan', 'https://example.com/assets/whip-pan', 'c0000006-0000-0000-0000-000000000006', 'Free (Attribution Appreciated)', true),
  ('a0000006-0000-0000-0000-000000000006', 'Ambient Cinematic Soundtrack Suite', 'ambient-soundtrack-suite', 'Deep modular synthesizer pads and organic string drones crafted for documentaries, tech breakdowns, and essays.', 'music', NULL, 'https://example.com/assets/ambient-suite', 'https://example.com/assets/ambient-suite', 'c0000005-0000-0000-0000-000000000005', 'Free for Non-Commercial & Indie Videos', true)
ON CONFLICT (slug) DO NOTHING;
