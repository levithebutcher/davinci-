import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tags, 
  Layers, 
  BookOpen, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { 
  getAllRawCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  isSlugUnique 
} from '../../services/categoryService';
import { slugify } from '../../utils/slugify';
import type { Database } from '../../types/database';
import { supabase } from '../../lib/supabase';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface CategoryWithCount extends CategoryRow {
  courseCount?: number;
}

export const AdminCategoriesPage: React.FC = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllRawCategories();

      // Fetch course counts per category
      const { data: coursesData } = await supabase
        .from('courses')
        .select('category_id');

      const countMap: Record<string, number> = {};
      if (coursesData) {
        coursesData.forEach((c: { category_id: string | null }) => {
          if (c.category_id) {
            countMap[c.category_id] = (countMap[c.category_id] || 0) + 1;
          }
        });
      }

      const withCounts: CategoryWithCount[] = data.map((cat) => ({
        ...cat,
        courseCount: countMap[cat.id] || 0,
      }));

      setCategories(withCounts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setSlugManuallyEdited(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryRow) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setSlugManuallyEdited(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: slugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    const finalSlug = slugify(formData.slug || formData.name);
    if (!finalSlug) {
      setFormError('Valid slug is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const isUnique = await isSlugUnique(finalSlug, editingCategory?.id);
      if (!isUnique) {
        setFormError(`Slug "${finalSlug}" is already taken. Please choose another.`);
        setSaving(false);
        return;
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          slug: finalSlug,
          description: formData.description.trim() || null,
        });
        addToast(`Category "${formData.name}" updated successfully`, 'success');
      } else {
        await createCategory({
          name: formData.name.trim(),
          slug: finalSlug,
          description: formData.description.trim() || null,
        });
        addToast(`Category "${formData.name}" created successfully`, 'success');
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving category';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.courseCount && deleteTarget.courseCount > 0) {
      addToast(`Cannot delete category: ${deleteTarget.courseCount} course(s) are still assigned to it.`, 'error');
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      addToast(`Category "${deleteTarget.name}" deleted`, 'info');
      setDeleteTarget(null);
      loadCategories();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      addToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-container">
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Tags size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Taxonomy Management
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Categories
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadCategories}
            className="admin-icon-btn"
            title="Refresh categories"
            style={{ width: '36px', height: '36px', border: '1px solid var(--border-subtle)' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus size={15} style={{ marginRight: '0.4rem' }} />
            New Category
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
            placeholder="Search categories by name, slug..."
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
              <th style={{ width: '25%' }}>Name</th>
              <th style={{ width: '20%' }}>Slug</th>
              <th style={{ width: '30%' }}>Description</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Courses</th>
              <th style={{ width: '13%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <RefreshCw size={16} className="animate-spin" />
                    Loading categories from database...
                  </div>
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {search ? 'No categories match your search criteria.' : 'No categories found. Click "New Category" to create one.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      /{cat.slug}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.description || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: cat.courseCount && cat.courseCount > 0 ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-primary)',
                        color: cat.courseCount && cat.courseCount > 0 ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <BookOpen size={11} />
                      {cat.courseCount || 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="admin-icon-btn"
                        title="Edit category"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="admin-icon-btn admin-icon-btn-danger"
                        title="Delete category"
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

      {/* Category Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                {editingCategory ? 'Edit Category' : 'New Category'}
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
                  <label className="admin-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="e.g. Color Grading"
                    value={formData.name}
                    onChange={handleNameChange}
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">URL Slug *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      className="admin-input"
                      placeholder="e.g. color-grading"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    Used in web URLs: /courses?category={formData.slug || 'category-slug'}
                  </span>
                </div>

                <div>
                  <label className="admin-label">Description (Optional)</label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Brief description of courses in this category..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Category"
        message={
          deleteTarget?.courseCount && deleteTarget.courseCount > 0
            ? `Cannot delete "${deleteTarget?.name}" because ${deleteTarget?.courseCount} course(s) are linked to it. Please reassign or delete these courses first.`
            : `Are you sure you want to delete the category "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel={deleteTarget?.courseCount && deleteTarget.courseCount > 0 ? 'Understood' : 'Delete Category'}
        isDestructive={!(deleteTarget?.courseCount && deleteTarget.courseCount > 0)}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
