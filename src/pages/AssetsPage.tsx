import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FolderDown, ShieldCheck } from 'lucide-react';
import { Container } from '../components/common/Container';
import { AssetCard } from '../components/assets/AssetCard';
import { CategoryFilter } from '../components/courses/CategoryFilter';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { assetService } from '../services/assetService';
import { ASSET_CATEGORIES } from '../data/categories';
import type { AssetResource } from '../types/asset';
import type { AssetCategory } from '../types/category';

export const AssetsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryParam = (searchParams.get('category') as AssetCategory) || 'all';

  const [assets, setAssets] = useState<AssetResource[]>([]);
  const [activeCategory, setActiveCategory] = useState<AssetCategory>(activeCategoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await assetService.getAssets();
      setAssets(fetched);
    } catch {
      setError('Something went wrong while loading assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Free LUTs, Templates & Assets — Resolve Learn';
    loadAssets();
  }, []);

  // Synchronize when query parameter changes from navigation or browser history
  useEffect(() => {
    const currentParam = (searchParams.get('category') as AssetCategory) || 'all';
    setActiveCategory(currentParam);
  }, [searchParams]);

  const handleCategoryChange = (cat: AssetCategory) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory = activeCategory === 'all' || asset.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        asset.title.toLowerCase().includes(query) ||
        asset.description.toLowerCase().includes(query) ||
        asset.creator.name.toLowerCase().includes(query) ||
        asset.fileFormat.toLowerCase().includes(query) ||
        asset.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [assets, activeCategory, searchQuery]);

  const categoriesWithCounts = useMemo(() => {
    return ASSET_CATEGORIES.map((cat) => {
      if (cat.id === 'all') {
        return { ...cat, count: assets.length };
      }
      return { ...cat, count: assets.filter((a) => a.category === cat.id).length };
    });
  }, [assets]);

  return (
    <div className="assets-page" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Banner */}
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
            Free Post-Production Library
          </div>

          <h1 style={{ marginBottom: '0.75rem' }}>Editing Resources & Assets</h1>
          <p
            style={{
              fontSize: 'var(--text-md)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            A curated collection of community-verified 3D LUTs, audio stems, sound effects, motion graphics templates, and vintage film overlays. Free for creators.
          </p>
        </Container>
      </div>

      {/* Notice Banner */}
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.65rem 0',
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}
      >
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--status-beginner)' }} />
            <span>
              All resources link directly to original author repositories or authorized distributor pages.
            </span>
          </div>
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
                placeholder="Search LUTs, SFX, overlays..."
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

      {/* Assets Grid */}
      <Container style={{ paddingTop: 'var(--space-10)' }}>
        {error ? (
          <ErrorMessage
            title="Failed to Load Assets"
            message={error}
            onRetry={loadAssets}
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
                  ? 'Loading assets from database...'
                  : `Showing ${filteredAssets.length} of ${assets.length} assets`}
              </span>
              <span>Verified Licenses</span>
            </div>

            {loading ? (
              <div className="grid-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} type="asset" />
                ))}
              </div>
            ) : filteredAssets.length > 0 ? (
              <div className="grid-3">
                {filteredAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
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
                <FolderDown size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>
                  No assets found
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Try choosing another category tab or clearing your search term.
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
