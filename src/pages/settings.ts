// Add these types to your existing types/settings.ts file

export interface GeneralSettingsData {
  id?: number;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  tax_rate: number;
  currency: string;
  timezone: string;
  date_format: string;
  logo_url: string;
  favicon_url: string;
}

export interface AdminProfileData {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface CreateAdminData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  bio?: string;
  address?: string;
}

export interface AdminProfileResponse {
  success: boolean;
  data?: AdminProfileData;
  message?: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface AvatarUploadResponse {
  success: boolean;
  url: string;
  message?: string;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  id?: number;
}
