const STORAGE_PREFIX = 'resolve_learn_progress_';
const LAST_WATCHED_KEY = 'resolve_learn_last_watched';

export interface LastWatchedEntry {
  courseSlug: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  completedCount: number;
  totalLessons: number;
  updatedAt: string; // ISO string
}

export const progressService = {
  getCompletedLessons(courseKey: string): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + courseKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  toggleLesson(courseKey: string, lessonId: string): string[] {
    try {
      const current = this.getCompletedLessons(courseKey);
      const set = new Set(current);
      if (set.has(lessonId)) {
        set.delete(lessonId);
      } else {
        set.add(lessonId);
      }
      const updated = Array.from(set);
      localStorage.setItem(STORAGE_PREFIX + courseKey, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  markCompleted(courseKey: string, lessonId: string): string[] {
    try {
      const current = this.getCompletedLessons(courseKey);
      const set = new Set(current);
      set.add(lessonId);
      const updated = Array.from(set);
      localStorage.setItem(STORAGE_PREFIX + courseKey, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  isLessonCompleted(courseKey: string, lessonId: string): boolean {
    const current = this.getCompletedLessons(courseKey);
    return current.includes(lessonId);
  },

  // ── Continue Watching ──────────────────────────────────────────────────────

  saveLastWatched(entry: LastWatchedEntry): void {
    try {
      const all = this.getAllLastWatched();
      // Remove old entry for this course if exists
      const filtered = all.filter((e) => e.courseSlug !== entry.courseSlug);
      // Add updated entry at front
      filtered.unshift(entry);
      // Keep only last 5 courses
      localStorage.setItem(LAST_WATCHED_KEY, JSON.stringify(filtered.slice(0, 5)));
    } catch {
      // ignore
    }
  },

  getAllLastWatched(): LastWatchedEntry[] {
    try {
      const saved = localStorage.getItem(LAST_WATCHED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  getLastWatched(): LastWatchedEntry | null {
    const all = this.getAllLastWatched();
    return all.length > 0 ? all[0] : null;
  },

  clearCourseProgress(courseSlug: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + courseSlug);
      const all = this.getAllLastWatched().filter((e) => e.courseSlug !== courseSlug);
      localStorage.setItem(LAST_WATCHED_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  },
};
