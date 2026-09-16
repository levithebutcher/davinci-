import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ASSETS } from '../data/assets';
import type { AssetResource } from '../types/asset';
import type { AssetCategory } from '../types/category';

interface AssetFilters {
  category?: string;
  search?: string;
}

function mapDbAssetToAsset(dbAsset: any): AssetResource {
  const fileFormatGuess =
    dbAsset.category === 'luts'
      ? '.cube (33x33)'
      : dbAsset.category === 'templates' || dbAsset.category === 'transitions'
      ? '.drfx (Resolve Macro)'
      : dbAsset.category === 'sound-effects' || dbAsset.category === 'music'
      ? '.wav (96kHz 24-bit)'
      : dbAsset.category === 'overlays' || dbAsset.category === 'video'
      ? '.mov (ProRes 422)'
      : '.ttf / .otf';

  return {
    id: dbAsset.id,
    title: dbAsset.title,
    category: (dbAsset.category as AssetCategory) || 'luts',
    description: dbAsset.description || '',
    creator: {
      name: dbAsset.creators?.name || 'Verified Creator',
      url: dbAsset.creators?.website_url || dbAsset.creators?.channel_url || undefined,
    },
    license: dbAsset.license_name || 'Free for Commercial Use',
    sourceUrl: dbAsset.source_url || dbAsset.download_url || 'https://example.com',
    fileFormat: fileFormatGuess,
    fileSize: 'Studio Pack',
    previewNote: dbAsset.attribution_required ? 'Attribution Required' : 'Royalty Free',
    tags: [dbAsset.category, 'Resolve', 'Free'],
  };
}

export const assetService = {
  async getAssets(filters?: AssetFilters): Promise<AssetResource[]> {
    if (!isSupabaseConfigured()) {
      return this.filterLocalAssets(ASSETS, filters);
    }

    try {
      let query = supabase
        .from('assets')
        .select(`
          id,
          title,
          slug,
          description,
          category,
          preview_url,
          download_url,
          source_url,
          license_name,
          license_url,
          attribution_required,
          creators:creator_id (name, channel_url, website_url)
        `)
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return this.filterLocalAssets(ASSETS, filters);
      }

      let assets = data.map(mapDbAssetToAsset);

      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        assets = assets.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.creator.name.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return assets;
    } catch {
      return this.filterLocalAssets(ASSETS, filters);
    }
  },

  filterLocalAssets(assets: AssetResource[], filters?: AssetFilters): AssetResource[] {
    return assets.filter((asset) => {
      let matchesCat = true;
      if (filters?.category && filters.category !== 'all') {
        matchesCat = asset.category === filters.category;
      }

      let matchesQuery = true;
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        matchesQuery =
          asset.title.toLowerCase().includes(q) ||
          asset.description.toLowerCase().includes(q) ||
          asset.creator.name.toLowerCase().includes(q) ||
          asset.fileFormat.toLowerCase().includes(q) ||
          asset.tags.some((t) => t.toLowerCase().includes(q));
      }

      return matchesCat && matchesQuery;
    });
  },

  // ============================================================================
  // ADMIN CRUD OPERATIONS (Step 4)
  // ============================================================================

  async getAllAdminAssets(): Promise<any[]> {
    const { data, error } = await supabase
      .from('assets')
      .select(`
        *,
        creators:creator_id (id, name, channel_url, website_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[assetService] Failed to load admin assets:', error.message);
      throw error;
    }
    return data || [];
  },

  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from('assets').select('id', { count: 'exact', head: true }).eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { count, error } = await query;
    if (error) {
      console.error('[assetService] Slug check error:', error.message);
      return false;
    }
    return count === 0;
  },

  async createAsset(assetData: {
    title: string;
    slug: string;
    description?: string | null;
    category: string;
    preview_url?: string | null;
    download_url?: string | null;
    source_url?: string | null;
    creator_id?: string | null;
    license_name?: string | null;
    license_url?: string | null;
    attribution_required?: boolean;
  }): Promise<any> {
    const isUnique = await this.isSlugUnique(assetData.slug);
    if (!isUnique) {
      throw new Error(`The slug "${assetData.slug}" is already in use by another asset.`);
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({
        title: assetData.title.trim(),
        slug: assetData.slug.trim(),
        description: assetData.description?.trim() || null,
        category: assetData.category.trim(),
        preview_url: assetData.preview_url?.trim() || null,
        download_url: assetData.download_url?.trim() || null,
        source_url: assetData.source_url?.trim() || null,
        creator_id: assetData.creator_id || null,
        license_name: assetData.license_name?.trim() || 'Free for Commercial Use',
        license_url: assetData.license_url?.trim() || null,
        attribution_required: Boolean(assetData.attribution_required),
      })
      .select()
      .single();

    if (error) {
      console.error('[assetService] Failed to create asset:', error.message);
      throw error;
    }
    return data;
  },

  async updateAsset(
    id: string,
    updates: {
      title?: string;
      slug?: string;
      description?: string | null;
      category?: string;
      preview_url?: string | null;
      download_url?: string | null;
      source_url?: string | null;
      creator_id?: string | null;
      license_name?: string | null;
      license_url?: string | null;
      attribution_required?: boolean;
    }
  ): Promise<any> {
    if (updates.slug) {
      const isUnique = await this.isSlugUnique(updates.slug, id);
      if (!isUnique) {
        throw new Error(`The slug "${updates.slug}" is already in use by another asset.`);
      }
    }

    const payload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (payload.title) payload.title = payload.title.trim();
    if (payload.slug) payload.slug = payload.slug.trim();

    const { data, error } = await supabase
      .from('assets')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[assetService] Failed to update asset:', error.message);
      throw error;
    }
    return data;
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      console.error('[assetService] Failed to delete asset:', error.message);
      throw error;
    }
  },
};

export const getAllAdminAssets = () => assetService.getAllAdminAssets();
export const isSlugUnique = (slug: string, excludeId?: string) => assetService.isSlugUnique(slug, excludeId);
export const createAsset = (data: any) => assetService.createAsset(data);
export const updateAsset = (id: string, updates: any) => assetService.updateAsset(id, updates);
export const deleteAsset = (id: string) => assetService.deleteAsset(id);


