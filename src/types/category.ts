export type CourseCategory =
  | 'all'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'editing'
  | 'color'
  | 'fusion'
  | 'fairlight';

export type AssetCategory =
  | 'all'
  | 'video'
  | 'music'
  | 'sound-effects'
  | 'luts'
  | 'overlays'
  | 'transitions'
  | 'templates'
  | 'fonts';

export interface CategoryFilterItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}
