export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseDomain = 'editing' | 'color' | 'fusion' | 'fairlight' | 'general';

export interface Creator {
  name: string;
  role?: string;
  avatarUrl?: string;
  channelUrl?: string;
}

export interface LessonPreview {
  id: string;
  title: string;
  duration: string;
  originalVideoUrl?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  domain: CourseDomain;
  level: CourseLevel;
  duration: string;
  lessonsCount: number;
  creator: Creator;
  featured?: boolean;
  topics: string[];
  thumbnailUrl?: string | null;
  bannerSubtext?: string;
  sampleLessons?: LessonPreview[];
}
