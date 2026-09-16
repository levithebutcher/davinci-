import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Layers } from 'lucide-react';
import { Container } from '../components/common/Container';
import { CourseCard } from '../components/courses/CourseCard';
import { CategoryFilter } from '../components/courses/CategoryFilter';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { courseService } from '../services/courseService';
import { categoryService } from '../services/categoryService';
import type { Course } from '../types/course';
import type { CourseCategory, CategoryFilterItem } from '../types/category';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryParam = (searchParams.get('filter') as CourseCategory) || 'all';

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryFilterItem<CourseCategory>[]>([]);
  const [activeCategory, setActiveCategory] = useState<CourseCategory>(activeCategoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses and categories through the service layer
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedCourses, fetchedCategories] = await Promise.all([
        courseService.getCourses(),
        categoryService.getCategories(),
      ]);
      setCourses(fetchedCourses);
      setCategories(fetchedCategories);
    } catch {
      setError('Something went wrong while loading courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Curriculum Catalog — Resolve Learn';
    loadData();
  }, []);

  // Synchronize when query parameter changes from navigation or browser history
  useEffect(() => {
    const currentParam = (searchParams.get('filter') as CourseCategory) || 'all';
    setActiveCategory(currentParam);
  }, [searchParams]);

  // Handle category change by updating URL search params cleanly
  const handleCategoryChange = (cat: CourseCategory) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('filter');
    } else {
      newParams.set('filter', cat);
    }
    setSearchParams(newParams);
  };

  // Filter courses based on active category and search query
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Category match
      let matchesCategory = true;
      if (activeCategory === 'beginner' || activeCategory === 'intermediate' || activeCategory === 'advanced') {
        matchesCategory = course.level === activeCategory;
      } else if (activeCategory !== 'all') {
        matchesCategory = course.domain === activeCategory;
      }

      // Search query match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.creator.name.toLowerCase().includes(query) ||
        course.topics.some((topic) => topic.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [courses, activeCategory, searchQuery]);

  // Dynamic category counts
  const categoriesWithCounts = useMemo(() => {
    if (categories.length === 0) return [];
    return categories.map((cat) => {
      if (cat.id === 'all') {
        return { ...cat, count: courses.length };
      }
      if (cat.id === 'beginner' || cat.id === 'intermediate' || cat.id === 'advanced') {
        return { ...cat, count: courses.filter((c) => c.level === cat.id).length };
      }
      return { ...cat, count: courses.filter((c) => c.domain === cat.id).length };
    });
  }, [categories, courses]);

  return (
    <div className="courses-page" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header Banner */}
      <div
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-12)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <Container>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Curated Curriculum Catalog
          </div>

          <h1 style={{ marginBottom: '0.75rem' }}>Learn DaVinci Resolve</h1>
          <p
            style={{
              fontSize: 'var(--text-md)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            Structured modules covering every page of the software. From raw timeline assembly and speed editing to studio color science, node compositing, and Fairlight mastering.
          </p>
        </Container>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          position: 'sticky',
          top: '4.25rem',
          zIndex: 40,
          backgroundColor: 'rgba(11, 11, 12, 0.94)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
        }}
      >
        <Container>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <CategoryFilter
                categories={categoriesWithCounts}
                activeCategory={activeCategory}
                onSelectCategory={handleCategoryChange}
              />
            </div>

            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '280px',
              }}
            >
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search courses, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Courses Grid */}
      <Container style={{ paddingTop: 'var(--space-10)' }}>
        {error ? (
          <ErrorMessage
            title="Failed to Load Courses"
            message={error}
            onRetry={loadData}
          />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              <span>
                {loading
                  ? 'Loading courses from database...'
                  : `Showing ${filteredCourses.length} of ${courses.length} published courses`}
              </span>
              <span>Curated from industry experts</span>
            </div>

            {loading ? (
              <div className="grid-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} type="course" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid-3">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: 'var(--space-16) 0',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Layers size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>
                  No courses match your criteria
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Try adjusting your category filter or search keywords.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-hover)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Reset all filters
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};
