import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FolderArchive, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { 
  getAllAdminAssets, 
  createAsset, 
  updateAsset, 
  deleteAsset,
  isSlugUnique 
} from '../../services/assetService';
import { getCreators } from '../../services/creatorService';
import { slugify } from '../../utils/slugify';
import type { Database } from '../../types/database';

type AssetRow = Database['public']['Tables']['assets']['Row'];
type CreatorRow = Database['public']['Tables']['creators']['Row'];

interface AdminAssetItem extends AssetRow {
  creator?: { name: string } | null;
}

const DEFAULT_CATEGORIES = [
  'LUTs',
  'Project Files',
  'Plugins',
  'Titles & Generators',
  'Sound FX',
  'Transitions',
  'Templates',
];

export const AdminAssetsPage: React.FC = () => {
  const { addToast } = useToast();
  const [assets, setAssets] = useState<AdminAssetItem[]>([]);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRow | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'LUTs',
    description: '',
    preview_url: '',
    download_url: '',
    source_url: '',
    creator_id: '',
    license_name: 'Free for Personal & Commercial Use',
    license_url: '',
    attribution_required: false,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AssetRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsData, creatorsData] = await Promise.all([
        getAllAdminAssets(),
        getCreators(),
      ]);
      setAssets(assetsData);
      setCreators(creatorsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load assets data';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setFormData({
      title: '',
      slug: '',
      category: DEFAULT_CATEGORIES[0],
      description: '',
      preview_url: '',
      download_url: '',
      source_url: '',
      creator_id: creators[0]?.id || '',
      license_name: 'Free for Personal & Commercial Use',
      license_url: '',
      attribution_required: false,
    });
    setSlugManuallyEdited(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset: AssetRow) => {
    setEditingAsset(asset);
    setFormData({
      title: asset.title,
      slug: asset.slug,
      category: asset.category,
      description: asset.description || '',
      preview_url: asset.preview_url || '',
      download_url: asset.download_url || '',
      source_url: asset.source_url || '',
      creator_id: asset.creator_id || '',
      license_name: asset.license_name || 'Free for Personal & Commercial Use',
      license_url: asset.license_url || '',
      attribution_required: Boolean(asset.attribution_required),
    });
    setSlugManuallyEdited(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: slugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Asset title is required');
      return;
    }

    const finalSlug = slugify(formData.slug || formData.title);
    if (!finalSlug) {
      setFormError('Valid slug is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const isUnique = await isSlugUnique(finalSlug, editingAsset?.id);
      if (!isUnique) {
        setFormError(`Slug "${finalSlug}" is already taken. Please choose another.`);
        setSaving(false);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        slug: finalSlug,
        category: formData.category,
        description: formData.description.trim() || null,
        preview_url: formData.preview_url.trim() || null,
        download_url: formData.download_url.trim() || null,
        source_url: formData.source_url.trim() || null,
        creator_id: formData.creator_id || null,
        license_name: formData.license_name.trim() || null,
        license_url: formData.license_url.trim() || null,
        attribution_required: formData.attribution_required,
      };

      if (editingAsset) {
        await updateAsset(editingAsset.id, payload);
        addToast(`Asset "${formData.title}" updated`, 'success');
      } else {
        await createAsset(payload);
        addToast(`Asset "${formData.title}" created`, 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving asset';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteAsset(deleteTarget.id);
      addToast(`Asset "${deleteTarget.title}" deleted`, 'info');
      setDeleteTarget(null);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete asset';
      addToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Distinct categories from existing assets + defaults for filter dropdown
  const availableCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...assets.map((a) => a.category).filter(Boolean)])
  );

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(search.toLowerCase()) ||
      asset.slug.toLowerCase().includes(search.toLowerCase()) ||
      (asset.category && asset.category.toLowerCase().includes(search.toLowerCase())) ||
      (asset.creator?.name && asset.creator.name.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || asset.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-container">
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <FolderArchive size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resource Library
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Studio Assets & LUTs
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            className="admin-icon-btn"
            title="Refresh assets"
            style={{ width: '36px', height: '36px', border: '1px solid var(--border-subtle)' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus size={15} style={{ marginRight: '0.4rem' }} />
            New Asset
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: '2.2rem' }}
            placeholder="Search assets by title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Asset</th>
              <th style={{ width: '15%' }}>Category</th>
              <th style={{ width: '15%' }}>Creator</th>
              <th style={{ width: '18%' }}>License & Attribution</th>
              <th style={{ width: '7%', textAlign: 'center' }}>Link</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <RefreshCw size={16} className="animate-spin" />
                    Loading assets...
                  </div>
                </td>
              </tr>
            ) : filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {search || categoryFilter !== 'ALL'
                      ? 'No assets match your search or filter.'
                      : 'No assets found. Click "New Asset" to add LUTs or Project Files.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {asset.preview_url ? (
                        <img
                          src={asset.preview_url}
                          alt=""
                          style={{
                            width: '44px',
                            height: '28px',
                            borderRadius: 'var(--radius-xs)',
                            objectFit: 'cover',
                            border: '1px solid var(--border-subtle)',
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '44px',
                            height: '28px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            flexShrink: 0,
                          }}
                        >
                          <ImageIcon size={14} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>
                          {asset.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          /{asset.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {asset.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: asset.creator?.name ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {asset.creator?.name || 'Studio Asset'}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {asset.license_name || 'Standard License'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        {asset.attribution_required ? (
                          <span style={{ fontSize: '0.6875rem', color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={11} /> Attribution Req.
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            No attribution req.
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {asset.download_url ? (
                      <a
                        href={asset.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-icon-btn"
                        title="Direct Download Link"
                      >
                        <Download size={14} style={{ color: 'var(--accent-primary)' }} />
                      </a>
                    ) : asset.source_url ? (
                      <a
                        href={asset.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-icon-btn"
                        title="Source Link"
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleOpenEdit(asset)}
                        className="admin-icon-btn"
                        title="Edit asset"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(asset)}
                        className="admin-icon-btn admin-icon-btn-danger"
                        title="Delete asset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Asset Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setIsModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                {editingAsset ? 'Edit Asset' : 'New Asset'}
              </h2>
              <button
                disabled={saving}
                onClick={() => setIsModalOpen(false)}
                className="admin-icon-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {formError && (
                  <div className="admin-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="admin-label">Asset Title *</label>
                    <input
                      type="text"
                      required
                      className="admin-input"
                      placeholder="e.g. Kodak 2383 Film Print LUT"
                      value={formData.title}
                      onChange={handleTitleChange}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="admin-label">Category *</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Slug *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="kodak-2383-film-print-lut"
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData({ ...formData, slug: slugify(e.target.value) });
                    }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Description</label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Describe what is inside this download (format, compatibility, installation instructions)..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="admin-label">Preview Image URL</label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://.../preview.jpg"
                      value={formData.preview_url}
                      onChange={(e) => setFormData({ ...formData, preview_url: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="admin-label">Creator / Source</label>
                    <select
                      className="admin-select"
                      value={formData.creator_id}
                      onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    >
                      <option value="">Studio Original (No creator)</option>
                      {creators.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="admin-label">Download URL (Direct zip/cube)</label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://.../asset.zip"
                      value={formData.download_url}
                      onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="admin-label">Original Source / Author URL</label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://github.com/... or creator website"
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="admin-label">License Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. CC-BY 4.0, MIT, Free for Personal Use"
                      value={formData.license_name}
                      onChange={(e) => setFormData({ ...formData, license_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="admin-label">License URL</label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://creativecommons.org/licenses/..."
                      value={formData.license_url}
                      onChange={(e) => setFormData({ ...formData, license_url: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="attribution_required"
                    checked={formData.attribution_required}
                    onChange={(e) => setFormData({ ...formData, attribution_required: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="attribution_required" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Attribution Required when used in public projects
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingAsset ? 'Save Changes' : 'Create Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Asset"
        message={`Are you sure you want to delete the asset "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Asset"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
