export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  account_type: 'individual' | 'business' | 'admin'
  status: 'active' | 'suspended' | 'deactivated'
  created_at: string
  updated_at: string
}

export interface PersonalCard {
  id: string
  user_id: string
  card_type: 'link' | 'file' | 'contact' | 'social_media' | 'custom'
  title: string
  content: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  type: string | null
  description: string | null
  logo_url: string | null
  owner_id: string
  enrollment_mode: 'open' | 'pin' | 'invite' | 'closed'
  static_pin: string | null
  allow_self_enrollment: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BusinessPass {
  id: string
  user_id: string
  organization_id: string
  status: 'active' | 'expired' | 'revoked' | 'suspended'
  expires_at: string | null
  use_count: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  organization?: Organization
}

export interface BusinessRequest {
  id: string
  user_id: string
  business_name: string
  business_type: string | null
  contact_email: string | null
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface AccessLog {
  id: string
  card_id: string | null
  card_type: 'personal' | 'business' | null
  user_id: string | null
  organization_id: string | null
  access_granted: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface EnrollmentPin {
  id: string
  organization_id: string
  pin_code: string
  is_used: boolean
  used_by: string | null
  expires_at: string | null
  created_at: string
}

export interface FileStorageLink {
  id: string
  user_id: string
  original_filename: string
  storage_path: string
  public_url: string | null
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export interface AllowedEmail {
  id: string
  email: string
  full_name: string | null
  account_type: string
  added_by: string | null
  created_at: string
}
