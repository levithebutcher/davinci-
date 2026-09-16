import { supabase } from '../lib/supabase';
import type { DbLesson } from '../types/database';
import { extractYouTubeId } from '../utils/youtube';

export interface LessonCreateInput {
  module_id: string;
  creator_id?: string | null;
  title: string;
  slug?: string | null;
  description?: string | null;
  youtube_video_id?: string | null;
  source_url?: string | null;
  duration_minutes?: number | null;
  level?: string | null;
  order_index?: number;
  published?: boolean;
}

export interface LessonUpdateInput {
  creator_id?: string | null;
  title?: string;
  slug?: string | null;
  description?: string | null;
  youtube_video_id?: string | null;
  source_url?: string | null;
  duration_minutes?: number | null;
  level?: string | null;
  order_index?: number;
  published?: boolean;
}

export const lessonService = {
  async getLessonsByModule(moduleId: string): Promise<DbLesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[lessonService] Failed to load lessons:', error.message);
      throw error;
    }
    return (data as DbLesson[]) || [];
  },

  async createLesson(input: LessonCreateInput): Promise<DbLesson> {
    // If order_index not provided, place at the end of the module
    let order = input.order_index;
    if (order === undefined) {
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', input.module_id);
      order = count || 0;
    }

    // Process YouTube input: extract 11-char ID or preserve
    const parsedYoutubeId = extractYouTubeId(input.youtube_video_id) || input.youtube_video_id?.trim() || null;

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        module_id: input.module_id,
        creator_id: input.creator_id || null,
        title: input.title.trim(),
        slug: input.slug?.trim() || null,
        description: input.description?.trim() || null,
        youtube_video_id: parsedYoutubeId,
        source_url: input.source_url?.trim() || null,
        duration_minutes: input.duration_minutes ? Number(input.duration_minutes) : null,
        level: input.level || 'all_levels',
        order_index: order,
        published: Boolean(input.published),
      })
      .select()
      .single();

    if (error) {
      console.error('[lessonService] Failed to create lesson:', error.message);
      throw error;
    }
    return data as DbLesson;
  },

  async updateLesson(id: string, updates: LessonUpdateInput): Promise<DbLesson> {
    const payload: any = { ...updates, updated_at: new Date().toISOString() };

    if (payload.title) payload.title = payload.title.trim();
    if (payload.slug !== undefined) payload.slug = payload.slug?.trim() || null;
    if (payload.description !== undefined) payload.description = payload.description?.trim() || null;
    if (payload.source_url !== undefined) payload.source_url = payload.source_url?.trim() || null;
    if (payload.duration_minutes !== undefined) {
      payload.duration_minutes = payload.duration_minutes ? Number(payload.duration_minutes) : null;
    }
    if (payload.youtube_video_id !== undefined) {
      payload.youtube_video_id = extractYouTubeId(payload.youtube_video_id) || payload.youtube_video_id?.trim() || null;
    }

    const { data, error } = await supabase
      .from('lessons')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[lessonService] Failed to update lesson:', error.message);
      throw error;
    }
    return data as DbLesson;
  },

  async toggleLessonPublished(id: string, published: boolean): Promise<DbLesson> {
    return this.updateLesson(id, { published });
  },

  async deleteLesson(id: string): Promise<void> {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) {
      console.error('[lessonService] Failed to delete lesson:', error.message);
      throw error;
    }
  },

  async reorderLessons(moduleId: string, orderedLessonIds: string[]): Promise<void> {
    const updates = orderedLessonIds.map((id, index) =>
      supabase
        .from('lessons')
        .update({ order_index: index })
        .eq('id', id)
        .eq('module_id', moduleId)
    );

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) {
      console.error('[lessonService] Failed to reorder lessons:', firstError.error.message);
      throw firstError.error;
    }
  },
};

export const getLessonsByModule = (moduleId: string) => lessonService.getLessonsByModule(moduleId);
export const createLesson = (input: LessonCreateInput) => lessonService.createLesson(input);
export const updateLesson = (id: string, updates: LessonUpdateInput) => lessonService.updateLesson(id, updates);
export const toggleLessonPublished = (id: string, published: boolean) => lessonService.toggleLessonPublished(id, published);
export const deleteLesson = (id: string) => lessonService.deleteLesson(id);
export const reorderLessons = (moduleId: string, orderedLessonIds: string[]) =>
  lessonService.reorderLessons(moduleId, orderedLessonIds);

