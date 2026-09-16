export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: 'Beginner' | 'All Levels' | 'Intermediate' | 'Advanced';
  estimatedHours: string;
  coursesCount: number;
  badgeText: string;
  focusArea: 'General' | 'Editing' | 'Color' | 'Fusion' | 'Fairlight';
}
