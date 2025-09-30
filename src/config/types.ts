export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  link?: string;
  children?: NavigationItem[];
}

export interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "success" | "danger" | "warning" | "info";
  link?: string;
}
