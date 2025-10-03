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
  updated_at?: string;
  logo_url: string;
  favicon_url: string;
}
