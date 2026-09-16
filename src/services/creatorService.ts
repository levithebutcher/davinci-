import { supabase } from '../lib/supabase';
import type { DbCreator } from '../types/database';

export const creatorService = {
  async getCreators(): Promise<DbCreator[]> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[creatorService] Failed to load creators:', error.message);
      throw error;
    }
    return (data as DbCreator[]) || [];
  },

  async createCreator(creatorData: {
    name: string;
    channel_url?: string | null;
    website_url?: string | null;
  }): Promise<DbCreator> {
    const { data, error } = await supabase
      .from('creators')
      .insert({
        name: creatorData.name.trim(),
        channel_url: creatorData.channel_url?.trim() || null,
        website_url: creatorData.website_url?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[creatorService] Failed to create creator:', error.message);
      throw error;
    }
    return data as DbCreator;
  },

  async updateCreator(
    id: string,
    updates: { name?: string; channel_url?: string | null; website_url?: string | null }
  ): Promise<DbCreator> {
    const payload: any = { ...updates };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.channel_url !== undefined) payload.channel_url = payload.channel_url?.trim() || null;
    if (payload.website_url !== undefined) payload.website_url = payload.website_url?.trim() || null;

    const { data, error } = await supabase
      .from('creators')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[creatorService] Failed to update creator:', error.message);
      throw error;
    }
    return data as DbCreator;
  },

  async deleteCreator(id: string): Promise<void> {
    const { error } = await supabase.from('creators').delete().eq('id', id);
    if (error) {
      console.error('[creatorService] Failed to delete creator:', error.message);
      throw error;
    }
  },
};

export const getCreators = () => creatorService.getCreators();
export const createCreator = (data: any) => creatorService.createCreator(data);
export const updateCreator = (id: string, updates: any) => creatorService.updateCreator(id, updates);
export const deleteCreator = (id: string) => creatorService.deleteCreator(id);

