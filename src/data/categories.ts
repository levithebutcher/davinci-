import type { CourseCategory, AssetCategory, CategoryFilterItem } from '../types/category';

export const COURSE_CATEGORIES: CategoryFilterItem<CourseCategory>[] = [
  { id: 'all', label: 'All Courses' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'editing', label: 'Editing' },
  { id: 'color', label: 'Color' },
  { id: 'fusion', label: 'Fusion' },
  { id: 'fairlight', label: 'Fairlight' },
];

export const ASSET_CATEGORIES: CategoryFilterItem<AssetCategory>[] = [
  { id: 'all', label: 'All Resources' },
  { id: 'luts', label: 'LUTs' },
  { id: 'templates', label: 'Templates' },
  { id: 'sound-effects', label: 'Sound Effects' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'transitions', label: 'Transitions' },
  { id: 'music', label: 'Music' },
  { id: 'video', label: 'Video Footage' },
  { id: 'fonts', label: 'Fonts' },
];
