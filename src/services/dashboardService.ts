import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalLessons: number;
  publishedLessons: number;
  draftLessons: number;
  totalAssets: number;
  totalCategories: number;
  totalCreators: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  type: 'course' | 'lesson' | 'asset';
  updatedAt: string;
  published: boolean;
  link: string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const [
        { count: totalCourses },
        { count: publishedCourses },
        { count: totalLessons },
        { count: publishedLessons },
        { count: totalAssets },
        { count: totalCategories },
        { count: totalCreators },
      ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('assets').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('creators').select('*', { count: 'exact', head: true }),
      ]);

      const totCourses = totalCourses || 0;
      const pubCourses = publishedCourses || 0;
      const totLessons = totalLessons || 0;
      const pubLessons = publishedLessons || 0;

      return {
        totalCourses: totCourses,
        publishedCourses: pubCourses,
        draftCourses: Math.max(0, totCourses - pubCourses),
        totalLessons: totLessons,
        publishedLessons: pubLessons,
        draftLessons: Math.max(0, totLessons - pubLessons),
        totalAssets: totalAssets || 0,
        totalCategories: totalCategories || 0,
        totalCreators: totalCreators || 0,
      };
    } catch (err) {
      console.error('[dashboardService] Failed to load stats:', err);
      throw err;
    }
  },

  async getRecentActivity(): Promise<RecentActivityItem[]> {
    try {
      const [coursesRes, lessonsRes, assetsRes] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, updated_at, published')
          .order('updated_at', { ascending: false })
          .limit(4),
        supabase
          .from('lessons')
          .select('id, module_id, title, updated_at, published, modules(course_id)')
          .order('updated_at', { ascending: false })
          .limit(4),
        supabase
          .from('assets')
          .select('id, title, updated_at')
          .order('updated_at', { ascending: false })
          .limit(4),
      ]);

      const activities: RecentActivityItem[] = [];

      if (coursesRes.data) {
        coursesRes.data.forEach((c) => {
          activities.push({
            id: c.id,
            title: c.title,
            type: 'course',
            updatedAt: c.updated_at,
            published: c.published,
            link: `/admin/courses/${c.id}`,
          });
        });
      }

      if (lessonsRes.data) {
        lessonsRes.data.forEach((l: any) => {
          const courseId = l.modules?.course_id;
          activities.push({
            id: l.id,
            title: l.title,
            type: 'lesson',
            updatedAt: l.updated_at,
            published: l.published,
            link: courseId ? `/admin/courses/${courseId}` : `/admin/courses`,
          });
        });
      }

      if (assetsRes.data) {
        assetsRes.data.forEach((a) => {
          activities.push({
            id: a.id,
            title: a.title,
            type: 'asset',
            updatedAt: a.updated_at,
            published: true,
            link: `/admin/assets`,
          });
        });
      }

      // Sort combined array by updatedAt descending and take top 6
      return activities
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6);
    } catch (err) {
      console.error('[dashboardService] Failed to load recent activity:', err);
      return [];
    }
  },
};
