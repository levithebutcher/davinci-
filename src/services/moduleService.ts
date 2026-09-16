import { supabase } from '../lib/supabase';
import type { DbModule } from '../types/database';

export interface AdminModuleWithLessons extends DbModule {
  lessons: any[];
}

export const moduleService = {
  async getModulesByCourse(courseId: string): Promise<AdminModuleWithLessons[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*, lessons (*)')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[moduleService] Failed to load modules:', error.message);
      throw error;
    }

    const sorted = (data || []).map((m: any) => ({
      ...m,
      lessons: Array.isArray(m.lessons)
        ? m.lessons.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
        : [],
    }));

    return sorted as AdminModuleWithLessons[];
  },

  async createModule(moduleData: {
    course_id: string;
    title: string;
    description?: string | null;
    order_index?: number;
  }): Promise<DbModule> {
    let order = moduleData.order_index;
    if (order === undefined) {
      const { count } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', moduleData.course_id);
      order = count || 0;
    }

    const { data, error } = await supabase
      .from('modules')
      .insert({
        course_id: moduleData.course_id,
        title: moduleData.title.trim(),
        description: moduleData.description?.trim() || null,
        order_index: order,
      })
      .select()
      .single();

    if (error) {
      console.error('[moduleService] Failed to create module:', error.message);
      throw error;
    }
    return data as DbModule;
  },

  async updateModule(
    id: string,
    updates: { title?: string; description?: string | null; order_index?: number }
  ): Promise<DbModule> {
    const payload: any = { ...updates };
    if (payload.title) payload.title = payload.title.trim();
    if (payload.description !== undefined) {
      payload.description = payload.description?.trim() || null;
    }

    const { data, error } = await supabase
      .from('modules')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[moduleService] Failed to update module:', error.message);
      throw error;
    }
    return data as DbModule;
  },

  async deleteModule(id: string): Promise<void> {
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) {
      console.error('[moduleService] Failed to delete module:', error.message);
      throw error;
    }
  },

  async reorderModules(courseId: string, orderedModuleIds: string[]): Promise<void> {
    const updates = orderedModuleIds.map((id, index) =>
      supabase
        .from('modules')
        .update({ order_index: index })
        .eq('id', id)
        .eq('course_id', courseId)
    );

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) {
      console.error('[moduleService] Failed to reorder modules:', firstError.error.message);
      throw firstError.error;
    }
  },
};

export const getModulesByCourse = (courseId: string) => moduleService.getModulesByCourse(courseId);
export const createModule = (data: any) => moduleService.createModule(data);
export const updateModule = (id: string, data: any) => moduleService.updateModule(id, data);
export const deleteModule = (id: string) => moduleService.deleteModule(id);
export const reorderModules = (courseId: string, orderedModuleIds: string[]) =>
  moduleService.reorderModules(courseId, orderedModuleIds);
