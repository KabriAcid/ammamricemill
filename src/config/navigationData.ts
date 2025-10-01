import { NavigationItem } from "./types";
export const navigationData: NavigationItem[] = [
  { id: "dashboard", title: "Dashboard", icon: "home", link: "/dashboard" },
  {
    id: "settings",
    title: "Settings",
    icon: "settings",
    children: [
      {
        id: "general-settings",
        title: "General Settings",
        icon: "sliders",
        link: "/settings/general",
      },
      {
        id: "silo-setting",
        title: "Silo Setting",
        icon: "warehouse",
        link: "/settings/silo",
      },
      {
        id: "godown-setting",
        title: "Godown Setting",
        icon: "building-2",
        link: "/settings/godown",
      },
    ],
  },
  {
    id: "hr",
    title: "Human Resource",
    icon: "users",
    children: [
      {
        id: "designation",
        title: "Designation List",
        icon: "badge",
        link: "/hr/designation",
      },
      {
        id: "employee",
        title: "Employee List",
        icon: "user",
        link: "/hr/employee",
      },
      {
        id: "attendance",
        title: "Daily Attendance",
        icon: "calendar-days",
        link: "/hr/attendance",
      },
      {
        id: "monthly-attendance",
        title: "Monthly Attendance",
        icon: "calendar-check",
        link: "/hr/attendance/monthly",
      },
      {
        id: "salary",
        title: "Salary Sheet",
        icon: "wallet",
        link: "/hr/salary",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    icon: "credit-card",
    children: [
      {
        id: "income-head",
        title: "Income Head",
        icon: "arrow-down-circle",
        link: "/accounts/head-income",
      },
      {
        id: "expense-head",
        title: "Expense Head",
        icon: "arrow-up-circle",
        link: "/accounts/head-expense",
      },
      {
        id: "bank-head",
        title: "Bank Head",
        icon: "banknote",
        link: "/accounts/head-bank",
      },
      {
        id: "others-head",
        title: "Others Head",
        icon: "list",
        link: "/accounts/head-others",
      },
      {
        id: "transactions",
        title: "All Transactions",
        icon: "repeat",
        link: "/accounts/transactions",
      },
    ],
  },
  {
    id: "party",
    title: "Party",
    icon: "users",
    children: [
      {
        id: "party-types",
        title: "Party Type",
        icon: "layers",
        link: "/party/party-types",
      },
      {
        id: "parties",
        title: "Party List",
        icon: "user-group",
        link: "/party/parties",
      },
      {
        id: "party-payments",
        title: "Party Payments",
        icon: "credit-card",
        link: "/party/payments",
      },
      {
        id: "party-due",
        title: "Party Due",
        icon: "alert-circle",
        link: "/party/due",
      },
      {
        id: "party-debts",
        title: "Party Debts",
        icon: "alert-triangle",
        link: "/party/debts",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: "package",
    children: [
      { id: "category", title: "Category", icon: "tag", link: "/category" },
      {
        id: "products-list",
        title: "Products",
        icon: "package",
        link: "/products",
      },
    ],
  },
  {
    id: "empty-bags",
    title: "Empty Bags",
    icon: "shopping-bag",
    children: [
      {
        id: "emptybag-purchase",
        title: "Purchase",
        icon: "shopping-cart",
        link: "/empty/emptybag-purchase",
      },
      {
        id: "emptybag-sales",
        title: "Sales",
        icon: "shopping-bag",
        link: "/empty/emptybag-sales",
      },
      {
        id: "emptybag-receive",
        title: "Receive",
        icon: "download",
        link: "/empty/emptybag-receive",
      },
      {
        id: "emptybag-payment",
        title: "Payment",
        icon: "credit-card",
        link: "/empty/emptybag-payment",
      },
      {
        id: "emptybag-stocks",
        title: "Stocks",
        icon: "boxes",
        link: "/empty/emptybag-stocks",
      },
    ],
  },
  {
    id: "purchase",
    title: "Purchase",
    icon: "shopping-cart",
    children: [
      {
        id: "paddy-purchase",
        title: "Paddy Purchase",
        icon: "leaf",
        link: "/purchases/purchase",
      },
      {
        id: "paddy-ledger",
        title: "Paddy Purchase Ledger",
        icon: "book-open",
        link: "/purchases/purchase/ledger",
      },
      {
        id: "rice-purchase",
        title: "Rice Purchase",
        icon: "wheat",
        link: "/purchases/rice-purchase",
      },
      {
        id: "rice-ledger",
        title: "Rice Purchase Ledger",
        icon: "book-open",
        link: "/purchases/ricepurchases/ledger",
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    icon: "trending-up",
    children: [
      { id: "sales-list", title: "Sales List", icon: "list", link: "/sales" },
      {
        id: "sales-ledger",
        title: "Sales Ledger",
        icon: "book-open",
        link: "/sale/ledger",
      },
    ],
  },
  {
    id: "production",
    title: "Production",
    icon: "cog",
    children: [
      {
        id: "production-order",
        title: "Production Order",
        icon: "clipboard-list",
        link: "/productions",
      },
      {
        id: "production-details",
        title: "Production Details",
        icon: "info",
        link: "/production/details",
      },
    ],
  },
  {
    id: "stocks",
    title: "Stocks",
    icon: "boxes",
    children: [
      { id: "main-stocks", title: "Main Stocks", icon: "box", link: "/stocks" },
      {
        id: "godown-stocks",
        title: "Godown Stocks",
        icon: "warehouse",
        link: "/stocks-godown",
      },
      {
        id: "stock-register",
        title: "Stock Register",
        icon: "book",
        link: "/stocks/details",
      },
      {
        id: "add-stocks",
        title: "Add Stocks",
        icon: "plus-square",
        link: "/stocks/addstocks",
      },
      {
        id: "production-stocks-list",
        title: "Production Stocks",
        icon: "layers",
        link: "/stocks/production-stocks",
      },
      {
        id: "production-stocks-details",
        title: "Production Stocks Details",
        icon: "info",
        link: "/stocks/production-stock/details",
      },
      {
        id: "emptybag-stocks",
        title: "Empty Bag Stocks",
        icon: "shopping-bag",
        link: "/stocks/emptybag-stocks",
      },
    ],
  },
  {
    id: "reporting",
    title: "Reporting",
    icon: "bar-chart-3",
    children: [
      {
        id: "daily-report",
        title: "Daily Report",
        icon: "calendar",
        link: "/dailyreport",
      },
      {
        id: "financial-statement",
        title: "Financial Statement",
        icon: "file-text",
        link: "/financial-statement",
      },
    ],
  },
  {
    id: "sms",
    title: "SMS Service",
    icon: "message-square",
    children: [
      {
        id: "sms-templates",
        title: "SMS Template",
        icon: "file-text",
        link: "/sms-templates",
      },
      { id: "send-sms", title: "Send SMS", icon: "send", link: "/sendsms" },
    ],
  },
  { id: "backup", title: "Database Backup", icon: "database", link: "/backup" },
];
