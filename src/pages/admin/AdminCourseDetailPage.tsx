import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Video, 
  Clock, 
  Layers, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Play
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { YouTubePreview } from '../../components/admin/YouTubePreview';
import { useToast } from '../../contexts/ToastContext';
import { 
  getAdminCourseById, 
  toggleCoursePublished 
} from '../../services/courseService';
import { 
  getModulesByCourse, 
  createModule, 
  updateModule, 
  deleteModule, 
  reorderModules 
} from '../../services/moduleService';
import type { AdminModuleWithLessons } from '../../services/moduleService';
import { 
  createLesson, 
  updateLesson, 
  toggleLessonPublished, 
  deleteLesson, 
  reorderLessons 
} from '../../services/lessonService';
import { extractYouTubeId } from '../../utils/youtube';
import { slugify } from '../../utils/slugify';
import type { Database } from '../../types/database';

type LessonRow = Database['public']['Tables']['lessons']['Row'];
type CourseRow = Database['public']['Tables']['courses']['Row'] & {
  category?: { name: string; slug: string } | null;
  creator?: { name: string } | null;
};

export const AdminCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [course, setCourse] = useState<CourseRow | null>(null);
  const [modules, setModules] = useState<AdminModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);

  // Module Modal States
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<AdminModuleWithLessons | null>(null);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '' });
  const [savingModule, setSavingModule] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  // Lesson Modal States
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonRow | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    slug: '',
    description: '',
    videoInput: '', // Can be URL or ID
    duration_minutes: 0,
    published: true,
  });
  const [extractedVideoId, setExtractedVideoId] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Confirm delete states
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<AdminModuleWithLessons | null>(null);
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<LessonRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!courseId) {
      navigate('/admin/courses');
      return;
    }
    loadCurriculum();
  }, [courseId]);

  const loadCurriculum = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseData, modulesData] = await Promise.all([
        getAdminCourseById(courseId),
        getModulesByCourse(courseId),
      ]);
      setCourse(courseData);
      setModules(modulesData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load course curriculum';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCoursePublish = async () => {
    if (!course) return;
    const nextState = !course.published;
    try {
      await toggleCoursePublished(course.id, nextState);
      setCourse({ ...course, published: nextState });
      addToast(
        `Course is now ${nextState ? 'Live / Published' : 'Draft'}`,
        nextState ? 'success' : 'info'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update course status';
      addToast(message, 'error');
    }
  };

  // --- MODULE ACTIONS ---
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleFormData({ title: '', description: '' });
    setModuleError(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: AdminModuleWithLessons) => {
    setEditingModule(mod);
    setModuleFormData({
      title: mod.title,
      description: mod.description || '',
    });
    setModuleError(null);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !moduleFormData.title.trim()) {
      setModuleError('Module title is required');
      return;
    }

    setSavingModule(true);
    setModuleError(null);

    try {
      if (editingModule) {
        await updateModule(editingModule.id, {
          title: moduleFormData.title.trim(),
          description: moduleFormData.description.trim() || null,
        });
        addToast(`Module "${moduleFormData.title}" updated`, 'success');
      } else {
        const nextOrder = modules.length;
        await createModule({
          course_id: courseId,
          title: moduleFormData.title.trim(),
          description: moduleFormData.description.trim() || null,
          order_index: nextOrder,
        });
        addToast(`Module "${moduleFormData.title}" added to curriculum`, 'success');
      }

      setIsModuleModalOpen(false);
      loadCurriculum();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving module';
      setModuleError(message);
    } finally {
      setSavingModule(false);
    }
  };

  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
    if (!courseId) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const reordered = [...modules];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setModules(reordered); // optimistic update

    try {
      await reorderModules(courseId, reordered.map((m) => m.id));
      addToast('Module order updated', 'info');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reorder modules';
      addToast(message, 'error');
      loadCurriculum();
    }
  };

  const handleDeleteModuleConfirm = async () => {
    if (!deleteModuleTarget) return;
    setIsDeleting(true);
    try {
      await deleteModule(deleteModuleTarget.id);
      addToast(`Module "${deleteModuleTarget.title}" deleted`, 'info');
      setDeleteModuleTarget(null);
      loadCurriculum();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete module';
      addToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- LESSON ACTIONS ---
  const handleOpenAddLesson = (moduleId: string) => {
    setTargetModuleId(moduleId);
    setEditingLesson(null);
    setLessonFormData({
      title: '',
      slug: '',
      description: '',
      videoInput: '',
      duration_minutes: 10,
      published: true,
    });
    setExtractedVideoId(null);
    setLessonError(null);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: LessonRow, moduleId: string) => {
    setTargetModuleId(moduleId);
    setEditingLesson(lesson);
    const videoId = lesson.youtube_video_id || '';
    setLessonFormData({
      title: lesson.title,
      slug: lesson.slug || '',
      description: lesson.description || '',
      videoInput: videoId,
      duration_minutes: lesson.duration_minutes || 0,
      published: Boolean(lesson.published),
    });
    setExtractedVideoId(videoId || null);
    setLessonError(null);
    setIsLessonModalOpen(true);
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLessonFormData((prev) => ({ ...prev, videoInput: val }));
    const extracted = extractYouTubeId(val);
    setExtractedVideoId(extracted);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId || !lessonFormData.title.trim()) {
      setLessonError('Lesson title is required');
      return;
    }

    setSavingLesson(true);
    setLessonError(null);

    const finalSlug = slugify(lessonFormData.slug || lessonFormData.title);
    const videoId = extractedVideoId || (lessonFormData.videoInput.trim().length === 11 ? lessonFormData.videoInput.trim() : null);

    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, {
          title: lessonFormData.title.trim(),
          slug: finalSlug,
          description: lessonFormData.description.trim() || null,
          youtube_video_id: videoId,
          duration_minutes: Number(lessonFormData.duration_minutes) || null,
          published: lessonFormData.published,
        });
        addToast(`Lesson "${lessonFormData.title}" updated`, 'success');
      } else {
        const parentModule = modules.find((m) => m.id === targetModuleId);
        const nextOrder = parentModule?.lessons?.length || 0;

        await createLesson({
          module_id: targetModuleId,
          title: lessonFormData.title.trim(),
          slug: finalSlug,
          description: lessonFormData.description.trim() || null,
          youtube_video_id: videoId,
          duration_minutes: Number(lessonFormData.duration_minutes) || null,
          order_index: nextOrder,
          published: lessonFormData.published,
        });
        addToast(`Lesson "${lessonFormData.title}" added`, 'success');
      }

      setIsLessonModalOpen(false);
      loadCurriculum();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving lesson';
      setLessonError(message);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleToggleLessonPublish = async (lesson: LessonRow) => {
    const nextState = !lesson.published;
    try {
      await toggleLessonPublished(lesson.id, nextState);
      setModules((prev) =>
        prev.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((l: any) => (l.id === lesson.id ? { ...l, published: nextState } : l)),
        }))
      );
      addToast(
        `Lesson "${lesson.title}" is now ${nextState ? 'Live' : 'Draft'}`,
        nextState ? 'success' : 'info'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update lesson status';
      addToast(message, 'error');
    }
  };

  const handleMoveLesson = async (moduleId: string, lessonIndex: number, direction: 'up' | 'down') => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= mod.lessons.length) return;

    const reorderedLessons = [...mod.lessons];
    const temp = reorderedLessons[lessonIndex];
    reorderedLessons[lessonIndex] = reorderedLessons[targetIndex];
    reorderedLessons[targetIndex] = temp;

    // Optimistic update
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons: reorderedLessons } : m))
    );

    try {
      await reorderLessons(moduleId, reorderedLessons.map((l) => l.id));
      addToast('Lesson order saved', 'info');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reorder lessons';
      addToast(message, 'error');
      loadCurriculum();
    }
  };

  const handleDeleteLessonConfirm = async () => {
    if (!deleteLessonTarget) return;
    setIsDeleting(true);
    try {
      await deleteLesson(deleteLessonTarget.id);
      addToast(`Lesson "${deleteLessonTarget.title}" deleted`, 'info');
      setDeleteLessonTarget(null);
      loadCurriculum();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete lesson';
      addToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} className="animate-spin" />
          <span>Loading course curriculum...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <AlertCircle size={32} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Course Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The requested course does not exist.</p>
        <Button variant="primary" to="/admin/courses">
          Return to Courses
        </Button>
      </div>
    );
  }

  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  const totalMinutes = modules.reduce(
    (acc: number, m: any) =>
      acc + (m.lessons?.reduce((sub: number, l: any) => sub + (l.duration_minutes || 0), 0) || 0),
    0
  );

  return (
    <div className="admin-container">
      {/* Back button & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Link
          to="/admin/courses"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.8125rem',
          }}
          className="hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Courses
        </Link>
        <span style={{ color: 'var(--border-strong)', fontSize: '0.8125rem' }}>/</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{course.title}</span>
      </div>

      {/* Course Header Banner */}
      <div className="admin-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                fontWeight: 600,
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {course.level}
            </span>
            {course.category && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • {course.category.name}
              </span>
            )}
            {course.creator && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Instructor: {course.creator.name}
              </span>
            )}
          </div>

          <h1 className="admin-banner-title" style={{ margin: '0 0 0.4rem 0' }}>
            {course.title}
          </h1>

          <p className="admin-banner-desc" style={{ marginBottom: '1rem' }}>
            {course.description || 'No description set for this course.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} style={{ color: 'var(--accent-primary)' }} />
              <span><strong>{modules.length}</strong> Modules</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Video size={14} style={{ color: 'var(--accent-primary)' }} />
              <span><strong>{totalLessons}</strong> Lessons</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
              <span><strong>{totalMinutes}</strong> Total Minutes</span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={handleToggleCoursePublish}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: course.published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
              color: course.published ? '#34d399' : '#9ca3af',
              border: `1px solid ${course.published ? 'rgba(16, 185, 129, 0.4)' : 'rgba(107, 114, 128, 0.35)'}`,
            }}
          >
            {course.published ? <Eye size={14} /> : <EyeOff size={14} />}
            {course.published ? 'Live On Site' : 'Draft / Hidden'}
          </button>

          <Button variant="primary" size="sm" onClick={handleOpenAddModule}>
            <Plus size={14} style={{ marginRight: '0.3rem' }} />
            Add Module
          </Button>
        </div>
      </div>

      {/* Curriculum Modules Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
            Curriculum Structure
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Modules & lessons are delivered sequentially to students in this order
          </span>
        </div>

        {modules.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <Layers size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.4rem' }}>
              No modules in this course yet
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.25rem' }}>
              Create your first learning module (e.g. "Module 1: Color Science Foundation") to start adding lessons.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenAddModule}>
              <Plus size={14} style={{ marginRight: '0.3rem' }} />
              Create First Module
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {modules.map((mod, modIdx) => (
              <div
                key={mod.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                {/* Module Bar */}
                <div
                  style={{
                    padding: '0.85rem 1.25rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'rgba(229, 57, 53, 0.1)',
                      }}
                    >
                      M{modIdx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9375rem' }}>
                        {mod.title}
                      </div>
                      {mod.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {mod.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Module Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {/* Move Up / Down */}
                    <button
                      disabled={modIdx === 0}
                      onClick={() => handleMoveModule(modIdx, 'up')}
                      className="admin-icon-btn"
                      title="Move Module Up"
                      style={{ opacity: modIdx === 0 ? 0.3 : 1 }}
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      disabled={modIdx === modules.length - 1}
                      onClick={() => handleMoveModule(modIdx, 'down')}
                      className="admin-icon-btn"
                      title="Move Module Down"
                      style={{ opacity: modIdx === modules.length - 1 ? 0.3 : 1 }}
                    >
                      <MoveDown size={13} />
                    </button>

                    <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 0.2rem' }} />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddLesson(mod.id)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Plus size={12} style={{ marginRight: '0.25rem' }} />
                      Add Lesson
                    </Button>

                    <button
                      onClick={() => handleOpenEditModule(mod)}
                      className="admin-icon-btn"
                      title="Edit module title"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteModuleTarget(mod)}
                      className="admin-icon-btn admin-icon-btn-danger"
                      title="Delete module"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Lessons inside Module */}
                <div style={{ padding: '0.5rem 0' }}>
                  {mod.lessons.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      No lessons in this module yet. Click "+ Add Lesson" above.
                    </div>
                  ) : (
                    <div>
                      {mod.lessons.map((lesson: any, lesIdx: number) => (
                        <div
                          key={lesson.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 1.25rem',
                            borderBottom: lesIdx === mod.lessons.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                            backgroundColor: lesIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6875rem',
                                color: 'var(--text-muted)',
                                width: '20px',
                                textAlign: 'center',
                              }}
                            >
                              {lesIdx + 1}.
                            </span>

                            <div>
                              <div style={{ fontWeight: 500, color: '#ffffff', fontSize: '0.8125rem' }}>
                                {lesson.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
                                {lesson.duration_minutes && (
                                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Clock size={10} /> {lesson.duration_minutes}m
                                  </span>
                                )}
                                {lesson.youtube_video_id ? (
                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      color: '#f87171',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      fontFamily: 'var(--font-mono)',
                                    }}
                                  >
                                    <Play size={11} /> {lesson.youtube_video_id}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                    No video set
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Lesson Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {/* Lesson publish switch */}
                            <button
                              onClick={() => handleToggleLessonPublish(lesson)}
                              title={lesson.published ? 'Lesson Published' : 'Lesson Draft'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.625rem',
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                backgroundColor: lesson.published ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                color: lesson.published ? '#34d399' : '#9ca3af',
                                border: `1px solid ${lesson.published ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.25)'}`,
                              }}
                            >
                              {lesson.published ? <Eye size={10} /> : <EyeOff size={10} />}
                              {lesson.published ? 'Live' : 'Draft'}
                            </button>

                            {/* Move Up/Down */}
                            <button
                              disabled={lesIdx === 0}
                              onClick={() => handleMoveLesson(mod.id, lesIdx, 'up')}
                              className="admin-icon-btn"
                              title="Move Lesson Up"
                              style={{ opacity: lesIdx === 0 ? 0.3 : 1, width: '24px', height: '24px' }}
                            >
                              <MoveUp size={12} />
                            </button>
                            <button
                              disabled={lesIdx === mod.lessons.length - 1}
                              onClick={() => handleMoveLesson(mod.id, lesIdx, 'down')}
                              className="admin-icon-btn"
                              title="Move Lesson Down"
                              style={{ opacity: lesIdx === mod.lessons.length - 1 ? 0.3 : 1, width: '24px', height: '24px' }}
                            >
                              <MoveDown size={12} />
                            </button>

                            <button
                              onClick={() => handleOpenEditLesson(lesson, mod.id)}
                              className="admin-icon-btn"
                              title="Edit lesson details & YouTube video"
                              style={{ width: '24px', height: '24px' }}
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => setDeleteLessonTarget(lesson)}
                              className="admin-icon-btn admin-icon-btn-danger"
                              title="Delete lesson"
                              style={{ width: '24px', height: '24px' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Module Create/Edit Modal */}
      {isModuleModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !savingModule && setIsModuleModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                {editingModule ? 'Edit Module' : 'Add New Module'}
              </h2>
              <button
                disabled={savingModule}
                onClick={() => setIsModuleModalOpen(false)}
                className="admin-icon-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModule}>
              <div className="admin-modal-body">
                {moduleError && (
                  <div className="admin-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{moduleError}</span>
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Module Title *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="e.g. Module 1: Color Science & Color Wheels"
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="admin-label">Description (Optional)</label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Brief description of what will be learned in this module..."
                    rows={3}
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={savingModule}
                  onClick={() => setIsModuleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingModule}
                >
                  {savingModule ? 'Saving...' : editingModule ? 'Save Changes' : 'Add Module'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Create/Edit Modal with Realtime YouTube Preview */}
      {isLessonModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !savingLesson && setIsLessonModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <button
                disabled={savingLesson}
                onClick={() => setIsLessonModalOpen(false)}
                className="admin-icon-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson}>
              <div className="admin-modal-body">
                {lessonError && (
                  <div className="admin-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{lessonError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="admin-label">Lesson Title *</label>
                    <input
                      type="text"
                      required
                      className="admin-input"
                      placeholder="e.g. Primary Wheels vs Primaries Bars"
                      value={lessonFormData.title}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="admin-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input"
                      placeholder="e.g. 15"
                      value={lessonFormData.duration_minutes || ''}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, duration_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* YouTube Video URL / ID with Live Preview */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">YouTube Video (URL or 11-character ID)</label>
                  <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="https://www.youtube.com/watch?v=... or youtu.be/... or 11-char ID"
                      value={lessonFormData.videoInput}
                      onChange={handleVideoInputChange}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Supports youtu.be, standard youtube.com watch links, shorts, or raw IDs</span>
                    {extractedVideoId && (
                      <span style={{ color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} /> Valid ID: {extractedVideoId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Live YouTube Preview Card */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Video Preview</label>
                  <YouTubePreview videoId={extractedVideoId} title={lessonFormData.title || 'Lesson Video'} />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Description / Lesson Notes</label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Key concepts, download links, timecodes, or workflow notes for this lesson..."
                    rows={3}
                    value={lessonFormData.description}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input
                    type="checkbox"
                    id="lesson_published"
                    checked={lessonFormData.published}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, published: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="lesson_published" style={{ fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer' }}>
                    Lesson is Active & Visible in course syllabus
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={savingLesson}
                  onClick={() => setIsLessonModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingLesson}
                >
                  {savingLesson ? 'Saving...' : editingLesson ? 'Save Changes' : 'Add Lesson'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Module Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModuleTarget)}
        title="Delete Module"
        message={`Are you sure you want to delete "${deleteModuleTarget?.title}"? All ${deleteModuleTarget?.lessons.length || 0} lessons inside this module will be permanently deleted.`}
        confirmLabel="Delete Module"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteModuleConfirm}
        onCancel={() => setDeleteModuleTarget(null)}
      />

      {/* Delete Lesson Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteLessonTarget)}
        title="Delete Lesson"
        message={`Are you sure you want to delete the lesson "${deleteLessonTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Lesson"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteLessonConfirm}
        onCancel={() => setDeleteLessonTarget(null)}
      />
    </div>
  );
};
