export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'Master Admin' | 'Admin' | 'Staff';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  full_name: string;
  position: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ContentPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin';
export type ContentType = 'reels' | 'carousel' | 'feed_single' | 'story' | 'tiktok_video' | 'short';
export type ContentStatus = 'idea' | 'drafting' | 'review' | 'approved' | 'scheduled' | 'published';

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed';

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  color?: string;
  tone_of_voice?: string;
  target_audience?: string;
}

export interface Project {
  id: string;
  brand_id?: string;
  brand_name?: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: TaskPriority;
  start_date?: string;
  due_date?: string;
  progress: number;
  color?: string;
  task_count?: number;
  completed_task_count?: number;
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
  order_index?: number;
  created_at?: string;
}

export interface ContentPillar {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface ContentPost {
  id: string;
  brand_id?: string;
  brand_name?: string;
  brand_color?: string;
  brand_logo?: string;
  project_id?: string;
  project_title?: string;
  title: string;
  pillar_id?: string;
  pillar_name?: string;
  platform: ContentPlatform;
  content_type: ContentType;
  hook?: string;
  caption?: string;
  hashtags?: string;
  call_to_action?: string;
  media_urls?: string;
  scheduled_at: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  meet_link?: string;
  location?: string;
  color?: string;
  status: ContentStatus;
  assignee_copy?: string;
  assignee_design?: string;
  notes?: string;
  published_link?: string;
  created_at?: string;
}

export interface DbStatus {
  success: boolean;
  message: string;
  latencyMs: number;
  database?: string;
  version?: string;
  serverTime?: string;
  host?: string;
  port?: string;
  tablesCount?: number;
  tables?: string[];
}
