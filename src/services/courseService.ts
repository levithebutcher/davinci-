import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { COURSES } from '../data/courses';
import type { Course, CourseDomain, CourseLevel } from '../types/course';
import { extractYouTubeId } from '../utils/youtube';

export interface PublicLesson {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  youtube_video_id: string | null;
  duration_minutes: number | null;
  order_index: number;
}

export interface PublicModule {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: PublicLesson[];
}

export interface CourseWithCurriculum extends Course {
  thumbnailUrl?: string | null;
  modules: PublicModule[];
}

interface QueryFilters {
  categorySlug?: string;
  level?: string;
  search?: string;
}

// Helper to convert database response to frontend Course entity
function mapDbCourseToCourse(dbCourse: any): Course {
  const categorySlug = dbCourse.categories?.slug || 'general';
  let domain: CourseDomain = 'general';
  if (['editing', 'color', 'fusion', 'fairlight'].includes(categorySlug)) {
    domain = categorySlug as CourseDomain;
  }

  // Calculate total lessons and total minutes
  let totalLessons = 0;
  let totalMinutes = 0;
  const sampleLessons: Array<{ id: string; title: string; duration: string; originalVideoUrl?: string }> = [];

  // Extract dynamic topics from module names
  const extractedTopics: string[] = [];

  if (Array.isArray(dbCourse.modules)) {
    dbCourse.modules.forEach((mod: any) => {
      if (mod.title) {
        const cleanTitle = mod.title.replace(/^Module \d+:\s*/i, '').trim();
        if (cleanTitle && !extractedTopics.includes(cleanTitle)) {
          extractedTopics.push(cleanTitle);
        }
      }

      if (Array.isArray(mod.lessons)) {
        mod.lessons.forEach((les: any) => {
          totalLessons++;
          totalMinutes += les.duration_minutes || 15;
          if (sampleLessons.length < 4) {
            sampleLessons.push({
              id: les.id,
              title: les.title,
              duration: `${les.duration_minutes || 15}m`,
              originalVideoUrl: les.youtube_video_id ? `https://www.youtube.com/watch?v=${les.youtube_video_id}` : undefined,
            });
          }
        });
      }
    });
  }

  // Fallback domain-specific topics if none extracted
  const domainTopicsMap: Record<string, string[]> = {
    editing: ['Timeline Editing', 'Cut Page', 'Speed Trimming', 'Keyboard Shortcuts'],
    color: ['Primary Wheels', 'Scopes Analysis', 'Color Management', 'CST Nodes'],
    fusion: ['Node Compositing', 'Motion Graphics', 'Masking', 'DRFX Templates'],
    fairlight: ['Dialogue Cleanup', 'Mixer & EQ', 'Dynamics Compression', 'Soundtrack'],
    general: ['Interface Tour', 'Project Setup', 'Full Workflow', 'Deliver Page'],
  };

  const topics = extractedTopics.length >= 2 ? extractedTopics : (domainTopicsMap[domain] || domainTopicsMap.general);

  // Format total duration string
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins || 45}m`;

  return {
    id: dbCourse.id,
    slug: dbCourse.slug,
    title: dbCourse.title,
    description: dbCourse.description || '',
    domain,
    level: (dbCourse.level || 'beginner') as CourseLevel,
    duration: durationStr || '2h 15m',
    lessonsCount: totalLessons,
    featured: Boolean(dbCourse.published),
    creator: {
      name: dbCourse.creators?.name || 'Curated Instructor',
      channelUrl: dbCourse.creators?.channel_url || undefined,
    },
    topics,
    thumbnailUrl: dbCourse.thumbnail_url || undefined,
    bannerSubtext: `Curated curriculum from ${dbCourse.creators?.name || 'industry experts'}`,
    sampleLessons,
  };
}

export const courseService = {
  async getCourses(filters?: QueryFilters): Promise<Course[]> {
    if (!isSupabaseConfigured()) {
      return this.filterLocalCourses(COURSES, filters);
    }

    try {
      let query = supabase
        .from('courses')
        .select(`
          id,
          title,
          slug,
          description,
          level,
          thumbnail_url,
          published,
          categories:category_id (name, slug),
          creators:creator_id (name, channel_url, website_url),
          modules (
            id,
            title,
            order_index,
            lessons (
              id,
              title,
              slug,
              youtube_video_id,
              duration_minutes,
              published,
              order_index
            )
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (filters?.level && filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to local data if database table has not yet been populated
        return this.filterLocalCourses(COURSES, filters);
      }

      let courses = data.map(mapDbCourseToCourse);

      // Apply client-side filters for category and search
      if (filters?.categorySlug && filters.categorySlug !== 'all') {
        courses = courses.filter((c) => c.domain === filters.categorySlug);
      }

      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        courses = courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.creator.name.toLowerCase().includes(q)
        );
      }

      return courses;
    } catch {
      return this.filterLocalCourses(COURSES, filters);
    }
  },

  async getFeaturedCourses(limit = 3): Promise<Course[]> {
    const courses = await this.getCourses();
    return courses.slice(0, limit);
  },

  async getCourseBySlug(slug: string): Promise<Course | null> {
    if (!isSupabaseConfigured()) {
      const local = COURSES.find((c) => c.slug === slug);
      return local || null;
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          slug,
          description,
          level,
          thumbnail_url,
          published,
          categories:category_id (name, slug),
          creators:creator_id (name, channel_url, website_url),
          modules (
            id,
            title,
            order_index,
            lessons (
              id,
              title,
              slug,
              youtube_video_id,
              duration_minutes,
              published,
              order_index
            )
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        const local = COURSES.find((c) => c.slug === slug);
        return local || null;
      }

      return mapDbCourseToCourse(data);
    } catch {
      const local = COURSES.find((c) => c.slug === slug);
      return local || null;
    }
  },

  async getCourseWithCurriculum(slug: string): Promise<CourseWithCurriculum | null> {
    if (!isSupabaseConfigured()) {
      const local = COURSES.find((c) => c.slug === slug);
      if (!local) return null;
      return {
        ...local,
        modules: [
          {
            id: 'm-fallback',
            title: 'Course Curriculum',
            description: local.description,
            order_index: 0,
            lessons: (local.sampleLessons || []).map((l, idx) => ({
              id: l.id,
              title: l.title,
              slug: l.id,
              description: null,
              youtube_video_id: l.originalVideoUrl ? extractYouTubeId(l.originalVideoUrl) : null,
              duration_minutes: parseInt(l.duration) || 15,
              order_index: idx,
            })),
          },
        ],
      };
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          slug,
          description,
          level,
          thumbnail_url,
          published,
          categories:category_id (name, slug),
          creators:creator_id (name, channel_url, website_url),
          modules (
            id,
            title,
            description,
            order_index,
            lessons (
              id,
              title,
              slug,
              description,
              youtube_video_id,
              duration_minutes,
              published,
              order_index
            )
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        return null;
      }

      const baseCourse = mapDbCourseToCourse(data);

      // Sort modules by order_index and lessons inside each module
      const sortedModules = (Array.isArray(data.modules) ? data.modules : [])
        .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((mod: any) => {
          const sortedLessons = (Array.isArray(mod.lessons) ? mod.lessons : [])
            .filter((l: any) => l.published !== false)
            .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((les: any) => ({
              id: les.id,
              title: les.title,
              slug: les.slug || les.id,
              description: les.description || null,
              youtube_video_id: les.youtube_video_id || null,
              duration_minutes: les.duration_minutes || null,
              order_index: les.order_index ?? 0,
            }));

          return {
            id: mod.id,
            title: mod.title,
            description: mod.description || null,
            order_index: mod.order_index ?? 0,
            lessons: sortedLessons,
          };
        });

      return {
        ...baseCourse,
        thumbnailUrl: data.thumbnail_url || null,
        modules: sortedModules,
      };
    } catch (err) {
      console.error('[courseService] getCourseWithCurriculum error:', err);
      return null;
    }
  },

  filterLocalCourses(courses: Course[], filters?: QueryFilters): Course[] {
    return courses.filter((course) => {
      let matchesCategory = true;
      if (filters?.categorySlug && filters.categorySlug !== 'all') {
        if (['beginner', 'intermediate', 'advanced'].includes(filters.categorySlug)) {
          matchesCategory = course.level === filters.categorySlug;
        } else {
          matchesCategory = course.domain === filters.categorySlug;
        }
      }

      let matchesLevel = true;
      if (filters?.level && filters.level !== 'all') {
        matchesLevel = course.level === filters.level;
      }

      let matchesSearch = true;
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        matchesSearch =
          course.title.toLowerCase().includes(q) ||
          course.description.toLowerCase().includes(q) ||
          course.creator.name.toLowerCase().includes(q) ||
          course.topics.some((t) => t.toLowerCase().includes(q));
      }

      return matchesCategory && matchesLevel && matchesSearch;
    });
  },

  // ============================================================================
  // ADMIN CRUD OPERATIONS (Step 4)
  // ============================================================================

  async getAllAdminCourses(): Promise<any[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        description,
        level,
        thumbnail_url,
        published,
        category_id,
        creator_id,
        created_at,
        updated_at,
        categories:category_id (id, name, slug),
        creators:creator_id (id, name),
        modules (
          id,
          lessons (id)
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[courseService] Failed to load admin courses:', error.message);
      throw error;
    }

    return (data || []).map((c: any) => {
      let lessonCount = 0;
      if (Array.isArray(c.modules)) {
        c.modules.forEach((m: any) => {
          if (Array.isArray(m.lessons)) {
            lessonCount += m.lessons.length;
          }
        });
      }
      return {
        ...c,
        modulesCount: c.modules?.length || 0,
        lessonsCount: lessonCount,
      };
    });
  },

  async getAdminCourseById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        description,
        level,
        thumbnail_url,
        published,
        category_id,
        creator_id,
        created_at,
        updated_at,
        categories:category_id (id, name, slug),
        creators:creator_id (id, name, channel_url),
        modules (
          id,
          course_id,
          title,
          description,
          order_index,
          created_at,
          lessons (
            id,
            module_id,
            creator_id,
            title,
            slug,
            description,
            youtube_video_id,
            source_url,
            duration_minutes,
            level,
            order_index,
            published,
            created_at,
            updated_at,
            creators:creator_id (id, name)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('[courseService] Failed to load admin course details:', error.message);
      throw error;
    }

    // Sort modules and lessons by order_index
    if (data?.modules && Array.isArray(data.modules)) {
      data.modules.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));
      data.modules.forEach((mod: any) => {
        if (mod.lessons && Array.isArray(mod.lessons)) {
          mod.lessons.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));
        }
      });
    }

    return data;
  },

  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from('courses').select('id', { count: 'exact', head: true }).eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { count, error } = await query;
    if (error) {
      console.error('[courseService] Slug check error:', error.message);
      return false;
    }
    return count === 0;
  },

  async createCourse(courseData: {
    title: string;
    slug: string;
    description?: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    thumbnail_url?: string | null;
    category_id?: string | null;
    creator_id?: string | null;
    published?: boolean;
  }): Promise<any> {
    const isUnique = await this.isSlugUnique(courseData.slug);
    if (!isUnique) {
      throw new Error(`The slug "${courseData.slug}" is already in use by another course.`);
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title.trim(),
        slug: courseData.slug.trim(),
        description: courseData.description?.trim() || null,
        level: courseData.level,
        thumbnail_url: courseData.thumbnail_url?.trim() || null,
        category_id: courseData.category_id || null,
        creator_id: courseData.creator_id || null,
        published: Boolean(courseData.published),
      })
      .select()
      .single();

    if (error) {
      console.error('[courseService] Failed to create course:', error.message);
      throw error;
    }
    return data;
  },

  async updateCourse(
    id: string,
    updates: {
      title?: string;
      slug?: string;
      description?: string | null;
      level?: 'beginner' | 'intermediate' | 'advanced';
      thumbnail_url?: string | null;
      category_id?: string | null;
      creator_id?: string | null;
      published?: boolean;
    }
  ): Promise<any> {
    if (updates.slug) {
      const isUnique = await this.isSlugUnique(updates.slug, id);
      if (!isUnique) {
        throw new Error(`The slug "${updates.slug}" is already taken by another course.`);
      }
    }

    const payload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (payload.title) payload.title = payload.title.trim();
    if (payload.slug) payload.slug = payload.slug.trim();

    const { data, error } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[courseService] Failed to update course:', error.message);
      throw error;
    }
    return data;
  },

  async toggleCoursePublished(id: string, published: boolean): Promise<any> {
    return this.updateCourse(id, { published });
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      console.error('[courseService] Failed to delete course:', error.message);
      throw error;
    }
  },
};

export type AdminCourseListItem = any;

export const getAllAdminCourses = () => courseService.getAllAdminCourses();
export const getAdminCourseById = (id: string) => courseService.getAdminCourseById(id);
export const isSlugUnique = (slug: string, excludeId?: string) => courseService.isSlugUnique(slug, excludeId);
export const createCourse = (data: any) => courseService.createCourse(data);
export const updateCourse = (id: string, updates: any) => courseService.updateCourse(id, updates);
export const toggleCoursePublished = (id: string, published: boolean) => courseService.toggleCoursePublished(id, published);
export const deleteCourse = (id: string) => courseService.deleteCourse(id);
export const getCourseWithCurriculum = (slug: string) => courseService.getCourseWithCurriculum(slug);



