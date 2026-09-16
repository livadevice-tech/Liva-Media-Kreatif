export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'Master Admin' | 'Team';

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
  project_type?: 'Internal' | 'Client' | string;
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

export type TaskVisibility = 'public' | 'private';

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
  visibility?: TaskVisibility;
  assignee_name?: string;
  due_date?: string;
  tags?: string;
  links?: string;
  subtasks?: string;
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
  assignees?: string[];
  notes?: string;
  published_link?: string;
  created_at?: string;
}

export interface AssetFileItem {
  id: string;
  title: string;
  url: string;
  type: 'gdrive' | 'figma' | 'canva' | 'video' | 'image' | 'document' | 'other';
  project_type?: 'Internal' | 'Client';
  brand_id?: string;
  brand_name?: string;
  project_title?: string;
  source: 'calendar' | 'task' | 'manual';
  notes?: string;
  is_private?: boolean;
  file_name?: string;
  file_size?: number;
  is_attached?: boolean;
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

export type DraftStatus = 'idea' | 'research' | 'ready' | 'scheduled';

export interface ContentDraftItem {
  id: string;
  brand_id?: string;
  brand_name?: string;
  brand_color?: string;
  brand_logo?: string;
  project_id?: string;
  project_title?: string;
  title: string;
  hook?: string;
  concept?: string;
  reference_urls?: string;
  reference_attachments?: string;
  platform: ContentPlatform;
  content_type: ContentType;
  pillar_id?: string;
  pillar_name?: string;
  status: DraftStatus;
  scheduled_post_id?: string;
  scheduled_at?: string;
  notes?: string;
  tags?: string;
  assignee_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type DocumentSignType = 'internal' | 'external';
export type DocumentSignStatus = 'pending' | 'signed' | 'rejected';
export type DocumentFileSource = 'asset' | 'external';

export interface SignedDocument {
  id: string;
  title: string;
  file_url?: string;
  file_name?: string;
  file_source: DocumentFileSource;
  sign_type: DocumentSignType;
  status: DocumentSignStatus;
  signing_token?: string;
  signer_name?: string;
  signer_role?: string;
  signer_email?: string;
  signer_phone?: string;
  signer_notes?: string;
  signature_data_url?: string;
  signed_file_url?: string;
  signature_position?: string;
  signed_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedSignature {
  id: string;
  name: string;
  signature_data_url: string;
  user_id?: string;
  created_by?: string;
  created_at?: string;
}

export type InvoiceDocType = 'invoice' | 'quotation';
export type InvoiceDocStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string; // misal: 'bulan', 'sesi', 'paket', 'jam', 'pcs'
  price: number;
  discountPercent?: number;
  amount: number;
}

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface SavedClient {
  id: string;
  clientName: string;
  clientCompany?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  createdAt?: string;
}

export interface InvoiceDocumentData {
  type: InvoiceDocType;
  status: InvoiceDocStatus;
  documentNumber: string;
  date: string;
  dueDate: string; // atau masa berlaku penawaran untuk quotation
  
  // Perusahaan (Issuer)
  companyName: string;
  brandName: string;
  brandTagline: string;
  logoUrl?: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;

  // Klien (Client / Recipient)
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;

  // Items & Perhitungan
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  discountRate: number; // Diskon global (%)
  taxRate: number; // PPN (%) misal 11% / 12% / 0%
  shippingFee: number;
  total: number;
  terbilang?: string;

  // Rekening Bank (Bisa multiple rekening)
  bankAccounts: BankAccountItem[];
  // Legacy / fallback single bank fields
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  paymentTermsNotes: string;

  // Penandatangan / Pengesahan
  signerCity: string;
  signerName: string;
  signerPosition: string;
  signatureUrl?: string;
  signatureScale: number;
  includeStamp: boolean;
  hideClientSignature?: boolean; // TTD klien dihilangkan
}

