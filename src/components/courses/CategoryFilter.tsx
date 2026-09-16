import type { CategoryFilterItem } from '../../types/category';

export interface CategoryFilterProps<T extends string = string> {
  categories: CategoryFilterItem<T>[];
  activeCategory: T;
  onSelectCategory: (categoryId: T) => void;
  className?: string;
}

export function CategoryFilter<T extends string = string>({
  categories,
  activeCategory,
  onSelectCategory,
  className = '',
}: CategoryFilterProps<T>) {
  return (
    <div
      className={`category-filter-bar ${className}`.trim()}
      role="tablist"
      aria-label="Filter options"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              border: isActive
                ? '1px solid var(--accent-primary)'
                : '1px solid var(--border-subtle)',
              backgroundColor: isActive
                ? 'var(--accent-subtle)'
                : 'var(--bg-elevated)',
              color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {isActive && (
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            )}
            <span>{cat.label}</span>
            {cat.count !== undefined && (
              <span
                style={{
                  opacity: 0.6,
                  fontSize: '0.7rem',
                }}
              >
                ({cat.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
