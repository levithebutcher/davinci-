const STORAGE_PREFIX = 'resolve_learn_progress_';

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
};
