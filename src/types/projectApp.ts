export type PlatformType = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ContentStatus = 'idea' | 'drafting' | 'review' | 'approved' | 'scheduled' | 'published';
export type ContentType = 'feed_single' | 'carousel' | 'reels' | 'story' | 'tiktok_video' | 'short';

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  color?: string;
  tone_of_voice?: string;
  target_audience?: string;
  accounts_count?: number;
  projects_count?: number;
  created_at?: string;
}

export interface SocialAccount {
  id: string;
  brand_id: string;
  brand_name?: string;
  brand_color?: string;
  brand_logo?: string;
  platform: PlatformType;
  handle: string;
  profile_url?: string;
  pic_name?: string;
  followers_count: number;
  monthly_target_posts: number;
  status: 'active' | 'inactive' | 'review';
  notes?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  brand_id?: string;
  brand_name?: string;
  brand_color?: string;
  title: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  priority: TaskPriority;
  start_date?: string;
  due_date?: string;
  progress: number;
  color?: string;
  total_tasks?: number;
  completed_tasks?: number;
  created_at?: string;
}

export interface Task {
  id: string;
  project_id?: string;
  project_title?: string;
  project_color?: string;
  brand_name?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_name?: string;
  due_date?: string;
  tags?: string;
  order_index: number;
  created_at?: string;
}

export interface ContentPillar {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface ContentPost {
  id: string;
  brand_id?: string;
  brand_name?: string;
  brand_color?: string;
  brand_logo?: string;
  social_account_id?: string;
  account_handle?: string;
  account_platform?: PlatformType;
  project_id?: string;
  title: string;
  pillar_id?: string;
  pillar_name?: string;
  platform: PlatformType;
  content_type: ContentType;
  hook?: string;
  caption?: string;
  hashtags?: string;
  call_to_action?: string;
  media_urls?: string[];
  scheduled_at: string;
  status: ContentStatus;
  assignee_copy?: string;
  assignee_design?: string;
  notes?: string;
  published_link?: string;
  created_at?: string;
}

export interface DashboardStats {
  projects: { total: number; in_progress: number; completed: number };
  tasks: { total: number; todo: number; in_progress: number; review: number; done: number };
  posts: { total: number; scheduled: number; approved: number; published: number; in_pipeline: number };
  accounts: { total: number; active: number; total_followers: number };
  upcomingPosts: ContentPost[];
  urgentTasks: Task[];
}
