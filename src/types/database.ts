export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      creators: {
        Row: {
          id: string;
          name: string;
          channel_url: string | null;
          website_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          channel_url?: string | null;
          website_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          channel_url?: string | null;
          website_url?: string | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          level: 'beginner' | 'intermediate' | 'advanced';
          thumbnail_url: string | null;
          category_id: string | null;
          creator_id: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          level: 'beginner' | 'intermediate' | 'advanced';
          thumbnail_url?: string | null;
          category_id?: string | null;
          creator_id?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          level?: 'beginner' | 'intermediate' | 'advanced';
          thumbnail_url?: string | null;
          category_id?: string | null;
          creator_id?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          creator_id: string | null;
          title: string;
          slug: string | null;
          description: string | null;
          youtube_video_id: string | null;
          source_url: string | null;
          duration_minutes: number | null;
          level: string | null;
          order_index: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          creator_id?: string | null;
          title: string;
          slug?: string | null;
          description?: string | null;
          youtube_video_id?: string | null;
          source_url?: string | null;
          duration_minutes?: number | null;
          level?: string | null;
          order_index?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          creator_id?: string | null;
          title?: string;
          slug?: string | null;
          description?: string | null;
          youtube_video_id?: string | null;
          source_url?: string | null;
          duration_minutes?: number | null;
          level?: string | null;
          order_index?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category: string;
          preview_url: string | null;
          download_url: string | null;
          source_url: string | null;
          creator_id: string | null;
          license_name: string | null;
          license_url: string | null;
          attribution_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          category: string;
          preview_url?: string | null;
          download_url?: string | null;
          source_url?: string | null;
          creator_id?: string | null;
          license_name?: string | null;
          license_url?: string | null;
          attribution_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          category?: string;
          preview_url?: string | null;
          download_url?: string | null;
          source_url?: string | null;
          creator_id?: string | null;
          license_name?: string | null;
          license_url?: string | null;
          attribution_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'student' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'student' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'student' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbCreator = Database['public']['Tables']['creators']['Row'];
export type DbCourse = Database['public']['Tables']['courses']['Row'];
export type DbModule = Database['public']['Tables']['modules']['Row'];
export type DbLesson = Database['public']['Tables']['lessons']['Row'];
export type DbAsset = Database['public']['Tables']['assets']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];

