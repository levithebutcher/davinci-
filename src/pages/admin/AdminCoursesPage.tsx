import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Layers, 
  Video, 
  RefreshCw, 
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { 
  getAllAdminCourses, 
  createCourse, 
  updateCourse, 
  toggleCoursePublished, 
  deleteCourse, 
  isSlugUnique 
} from '../../services/courseService';
import type { AdminCourseListItem } from '../../services/courseService';
import { getAllRawCategories } from '../../services/categoryService';
import { getCreators } from '../../services/creatorService';
import { slugify } from '../../utils/slugify';
import type { Database } from '../../types/database';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CreatorRow = Database['public']['Tables']['creators']['Row'];

export const AdminCoursesPage: React.FC = () => {
  const { addToast } = useToast();
  const [courses, setCourses] = useState<AdminCourseListItem[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourseListItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    thumbnail_url: '',
    category_id: '',
    creator_id: '',
    published: false,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminCourseListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggling status state tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, categoriesData, creatorsData] = await Promise.all([
        getAllAdminCourses(),
        getAllRawCategories(),
        getCreators(),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
      setCreators(creatorsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load courses';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      level: 'beginner',
      thumbnail_url: '',
      category_id: categories[0]?.id || '',
      creator_id: creators[0]?.id || '',
      published: false,
    });
    setSlugManuallyEdited(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: AdminCourseListItem) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      level: course.level,
      thumbnail_url: course.thumbnail_url || '',
      category_id: course.category_id || '',
      creator_id: course.creator_id || '',
      published: Boolean(course.published),
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
      setFormError('Course title is required');
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
      const isUnique = await isSlugUnique(finalSlug, editingCourse?.id);
      if (!isUnique) {
        setFormError(`Slug "${finalSlug}" is already taken. Please choose another.`);
        setSaving(false);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        slug: finalSlug,
        description: formData.description.trim() || null,
        level: formData.level,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        category_id: formData.category_id || null,
        creator_id: formData.creator_id || null,
        published: formData.published,
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
        addToast(`Course "${formData.title}" updated`, 'success');
      } else {
        await createCourse(payload);
        addToast(`Course "${formData.title}" created successfully`, 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving course';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (course: AdminCourseListItem) => {
    setTogglingId(course.id);
    const nextStatus = !course.published;
    try {
      await toggleCoursePublished(course.id, nextStatus);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, published: nextStatus } : c))
      );
      addToast(
        `Course "${course.title}" is now ${nextStatus ? 'Live / Published' : 'Draft'}`,
        nextStatus ? 'success' : 'info'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update publish state';
      addToast(message, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteCourse(deleteTarget.id);
      addToast(`Course "${deleteTarget.title}" deleted`, 'info');
      setDeleteTarget(null);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete course';
      addToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.slug.toLowerCase().includes(search.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(search.toLowerCase())) ||
      (course.category?.name && course.category.name.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || course.category_id === categoryFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && course.published) ||
      (statusFilter === 'DRAFT' && !course.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="admin-container">
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Masterclasses & Courses
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Courses Management
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            className="admin-icon-btn"
            title="Refresh courses"
            style={{ width: '36px', height: '36px', border: '1px solid var(--border-subtle)' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus size={15} style={{ marginRight: '0.4rem' }} />
            New Course
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
            placeholder="Search courses by title, slug..."
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
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="admin-select"
          style={{ width: 'auto', minWidth: '130px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
        >
          <option value="ALL">All Status</option>
          <option value="PUBLISHED">Published Only</option>
          <option value="DRAFT">Draft Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '34%' }}>Course</th>
              <th style={{ width: '13%' }}>Level</th>
              <th style={{ width: '15%' }}>Category</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Curriculum</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Status</th>
              <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <RefreshCw size={16} className="animate-spin" />
                    Loading courses...
                  </div>
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {search || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                      ? 'No courses match your search or filter criteria.'
                      : 'No courses created yet. Click "New Course" to build your first curriculum.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => {
                const moduleCount = course.modules?.length || 0;
                const lessonCount = course.modules?.reduce(
                  (acc: number, m: any) => acc + (m.lessons?.length || 0),
                  0
                ) || 0;

                const levelColors: Record<string, { bg: string; color: string; border: string }> = {
                  beginner: { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
                  intermediate: { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
                  advanced: { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
                };

                const currentLevel = levelColors[course.level] || levelColors.beginner;

                return (
                  <tr key={course.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt=""
                            style={{
                              width: '56px',
                              height: '34px',
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
                              width: '56px',
                              height: '34px',
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
                          <Link
                            to={`/admin/courses/${course.id}`}
                            style={{
                              fontWeight: 600,
                              color: '#ffffff',
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                              display: 'block',
                            }}
                            className="hover:underline"
                          >
                            {course.title}
                          </Link>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            /{course.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          backgroundColor: currentLevel.bg,
                          color: currentLevel.color,
                          border: `1px solid ${currentLevel.border}`,
                        }}
                      >
                        {course.level}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: course.category?.name ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {course.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link
                        to={`/admin/courses/${course.id}`}
                        title="Manage curriculum modules & lessons"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Layers size={11} style={{ color: 'var(--accent-primary)' }} />
                        <span>{moduleCount}m</span>
                        <span style={{ color: 'var(--border-strong)' }}>•</span>
                        <Video size={11} />
                        <span>{lessonCount}l</span>
                      </Link>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleTogglePublished(course)}
                        disabled={togglingId === course.id}
                        title={course.published ? 'Published (Click to set to Draft)' : 'Draft (Click to Publish)'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          backgroundColor: course.published ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.15)',
                          color: course.published ? '#34d399' : '#9ca3af',
                          border: `1px solid ${course.published ? 'rgba(16, 185, 129, 0.35)' : 'rgba(107, 114, 128, 0.3)'}`,
                        }}
                      >
                        {course.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {course.published ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="admin-icon-btn"
                          title="Curriculum Editor"
                        >
                          <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="admin-icon-btn"
                          title="Edit course details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(course)}
                          className="admin-icon-btn admin-icon-btn-danger"
                          title="Delete course"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Course Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setIsModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                {editingCourse ? 'Edit Course Settings' : 'New Course'}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="admin-label">Course Title *</label>
                    <input
                      type="text"
                      required
                      className="admin-input"
                      placeholder="e.g. Master DaVinci Resolve Color Management"
                      value={formData.title}
                      onChange={handleTitleChange}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="admin-label">Difficulty Level *</label>
                    <select
                      className="admin-select"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">URL Slug *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="davinci-resolve-color-management"
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData({ ...formData, slug: slugify(e.target.value) });
                    }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Web URL: /courses/{formData.slug || 'course-slug'}
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Description</label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Comprehensive overview of learning objectives, node structures, and workflows..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="admin-label">Category</label>
                    <select
                      className="admin-select"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">No Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="admin-label">Primary Instructor</label>
                    <select
                      className="admin-select"
                      value={formData.creator_id}
                      onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    >
                      <option value="">Studio Original (No Creator)</option>
                      {creators.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Thumbnail Image URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://images.unsplash.com/... or hosted preview"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="course_published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="course_published" style={{ fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer', fontWeight: 500 }}>
                    Publish Course Immediately (Visible to public visitors)
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
                  {saving ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently delete this course and all its modules and lessons. This action cannot be undone.`}
        confirmLabel="Delete Course"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
