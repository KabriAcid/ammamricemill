export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  link: string;
  description?: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  link?: string;
  children?: NavigationItem[];
  active?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
}

export interface DashboardData {
  cards: DashboardCard[];
  user: User;
  navigation: NavigationItem[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}