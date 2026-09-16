import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { COURSE_CATEGORIES } from '../data/categories';
import type { CategoryFilterItem, CourseCategory } from '../types/category';

export interface CategoryWithCount extends CategoryFilterItem<CourseCategory> {
  id: CourseCategory;
  label: string;
  count?: number;
}

export const categoryService = {
  async getCategories(): Promise<CategoryFilterItem<CourseCategory>[]> {
    if (!isSupabaseConfigured()) {
      return COURSE_CATEGORIES;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error || !data || data.length === 0) {
        // Fallback to local definitions if table has not been migrated yet
        return COURSE_CATEGORIES;
      }

      const mapped: CategoryFilterItem<CourseCategory>[] = [
        { id: 'all', label: 'All Courses' },
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' },
        ...(data as Array<{ slug: string; name: string }>).map((cat) => ({
          id: (cat.slug.toLowerCase() as CourseCategory),
          label: cat.name,
        })),
      ];

      return mapped;
    } catch {
      return COURSE_CATEGORIES;
    }
  },

  // ============================================================================
  // ADMIN CRUD OPERATIONS (Step 4)
  // ============================================================================

  async getAllRawCategories(): Promise<any[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        courses:courses (id)
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('[categoryService] Failed to load raw categories:', error.message);
      throw error;
    }

    return (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      created_at: cat.created_at,
      coursesCount: Array.isArray(cat.courses) ? cat.courses.length : 0,
    }));
  },

  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from('categories').select('id', { count: 'exact', head: true }).eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { count, error } = await query;
    if (error) {
      console.error('[categoryService] Slug check error:', error.message);
      return false;
    }
    return count === 0;
  },

  async createCategory(catData: {
    name: string;
    slug: string;
    description?: string | null;
  }): Promise<any> {
    const isUnique = await this.isSlugUnique(catData.slug);
    if (!isUnique) {
      throw new Error(`The slug "${catData.slug}" is already in use by another category.`);
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: catData.name.trim(),
        slug: catData.slug.trim(),
        description: catData.description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[categoryService] Failed to create category:', error.message);
      throw error;
    }
    return data;
  },

  async updateCategory(
    id: string,
    updates: { name?: string; slug?: string; description?: string | null }
  ): Promise<any> {
    if (updates.slug) {
      const isUnique = await this.isSlugUnique(updates.slug, id);
      if (!isUnique) {
        throw new Error(`The slug "${updates.slug}" is already in use by another category.`);
      }
    }

    const payload: any = { ...updates };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.slug) payload.slug = payload.slug.trim();

    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[categoryService] Failed to update category:', error.message);
      throw error;
    }
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    // Safety check: verify no courses depend on this category
    const { count, error: countError } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      console.error('[categoryService] Dependency check failed:', countError.message);
      throw countError;
    }

    if (count && count > 0) {
      throw new Error(
        `Cannot delete this category because ${count} course(s) are assigned to it. Please reassign or delete those courses first.`
      );
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('[categoryService] Failed to delete category:', error.message);
      throw error;
    }
  },
};

export const getAllRawCategories = () => categoryService.getAllRawCategories();
export const isSlugUnique = (slug: string, excludeId?: string) => categoryService.isSlugUnique(slug, excludeId);
export const createCategory = (data: any) => categoryService.createCategory(data);
export const updateCategory = (id: string, updates: any) => categoryService.updateCategory(id, updates);
export const deleteCategory = (id: string) => categoryService.deleteCategory(id);


