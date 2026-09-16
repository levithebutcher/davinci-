import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  ExternalLink, 
  Globe, 
  RefreshCw, 
  AlertCircle,
  Video
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { 
  getCreators, 
  createCreator, 
  updateCreator, 
  deleteCreator 
} from '../../services/creatorService';
import type { Database } from '../../types/database';
import { supabase } from '../../lib/supabase';

type CreatorRow = Database['public']['Tables']['creators']['Row'];

interface CreatorWithCount extends CreatorRow {
  courseCount?: number;
  assetCount?: number;
}

export const AdminCreatorsPage: React.FC = () => {
  const { addToast } = useToast();
  const [creators, setCreators] = useState<CreatorWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<CreatorRow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    channel_url: '',
    website_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CreatorWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    setLoading(true);
    try {
      const data = await getCreators();

      // Fetch linked courses and assets counts
      const [coursesRes, assetsRes] = await Promise.all([
        supabase.from('courses').select('creator_id'),
        supabase.from('assets').select('creator_id'),
      ]);

      const courseCountMap: Record<string, number> = {};
      coursesRes.data?.forEach((c: { creator_id: string | null }) => {
        if (c.creator_id) {
          courseCountMap[c.creator_id] = (courseCountMap[c.creator_id] || 0) + 1;
        }
      });

      const assetCountMap: Record<string, number> = {};
      assetsRes.data?.forEach((a: { creator_id: string | null }) => {
        if (a.creator_id) {
          assetCountMap[a.creator_id] = (assetCountMap[a.creator_id] || 0) + 1;
        }
      });

      const withCounts: CreatorWithCount[] = data.map((cr: any) => ({
        ...cr,
        courseCount: courseCountMap[cr.id] || 0,
        assetCount: assetCountMap[cr.id] || 0,
      }));

      setCreators(withCounts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load creators';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCreator(null);
    setFormData({ name: '', channel_url: '', website_url: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (creator: CreatorRow) => {
    setEditingCreator(creator);
    setFormData({
      name: creator.name,
      channel_url: creator.channel_url || '',
      website_url: creator.website_url || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Creator name is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingCreator) {
        await updateCreator(editingCreator.id, {
          name: formData.name.trim(),
          channel_url: formData.channel_url.trim() || null,
          website_url: formData.website_url.trim() || null,
        });
        addToast(`Creator "${formData.name}" updated`, 'success');
      } else {
        await createCreator({
          name: formData.name.trim(),
          channel_url: formData.channel_url.trim() || null,
          website_url: formData.website_url.trim() || null,
        });
        addToast(`Creator "${formData.name}" added`, 'success');
      }

      setIsModalOpen(false);
      loadCreators();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving creator';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteCreator(deleteTarget.id);
      addToast(`Creator "${deleteTarget.name}" deleted`, 'info');
      setDeleteTarget(null);
      loadCreators();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete creator';
      addToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCreators = creators.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.channel_url && c.channel_url.toLowerCase().includes(search.toLowerCase())) ||
    (c.website_url && c.website_url.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-container">
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Users size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instructor & Channel Directory
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Content Creators
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadCreators}
            className="admin-icon-btn"
            title="Refresh creators"
            style={{ width: '36px', height: '36px', border: '1px solid var(--border-subtle)' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus size={15} style={{ marginRight: '0.4rem' }} />
            New Creator
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: '2.2rem' }}
            placeholder="Search creators by name, link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Creator Name</th>
              <th style={{ width: '27%' }}>YouTube Channel</th>
              <th style={{ width: '22%' }}>Website</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Content</th>
              <th style={{ width: '13%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <RefreshCw size={16} className="animate-spin" />
                    Loading creators...
                  </div>
                </td>
              </tr>
            ) : filteredCreators.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {search ? 'No creators match your search.' : 'No creators found in directory. Add your first creator!'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredCreators.map((creator) => (
                <tr key={creator.id}>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-primary)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          flexShrink: 0,
                        }}
                      >
                        {creator.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{creator.name}</span>
                    </div>
                  </td>
                  <td>
                    {creator.channel_url ? (
                      <a
                        href={creator.channel_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: '#f87171',
                          textDecoration: 'none',
                          fontSize: '0.8125rem',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Video size={14} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{creator.channel_url.replace(/^https?:\/\/(www\.)?youtube\.com\/?/, '') || 'Channel'}</span>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {creator.website_url ? (
                      <a
                        href={creator.website_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.8125rem',
                          maxWidth: '180px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Globe size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{creator.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <span
                        title={`${creator.courseCount || 0} courses`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <Video size={10} />
                        {creator.courseCount || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleOpenEdit(creator)}
                        className="admin-icon-btn"
                        title="Edit creator"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(creator)}
                        className="admin-icon-btn admin-icon-btn-danger"
                        title="Delete creator"
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

      {/* Creator Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                {editingCreator ? 'Edit Creator' : 'New Creator'}
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

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Creator / Channel Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="e.g. Casey Faris, Cullen Kelly"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">YouTube Channel URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://www.youtube.com/@channel"
                    value={formData.channel_url}
                    onChange={(e) => setFormData({ ...formData, channel_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Website / Portfolio URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://creator-website.com"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  />
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
                  {saving ? 'Saving...' : editingCreator ? 'Save Changes' : 'Add Creator'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Creator"
        message={`Are you sure you want to delete "${deleteTarget?.name}" from the directory? Courses or assets citing this creator will have their creator field set to unassigned.`}
        confirmLabel="Delete Creator"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
