import { GeneralSettings } from "./pages/GeneralSettings";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UIProvider } from "./contexts/UIContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { ChangePassword } from "./pages/ChangePassword";
import { Settings } from "./pages/Settings";
import { SiloSettings } from "./pages/SiloSettings";
import { GodownSettings } from "./pages/GodownSettings";
import { Designations } from "./pages/Designations";
import { Employees } from "./pages/Employees";
import { Attendance } from "./pages/Attendance";
import { MonthlyAttendance } from "./pages/MonthlyAttendance";
import { Salary } from "./pages/Salary";
import { Categories } from "./pages/Categories";
import { Products } from "./pages/Products";
import { Stocks } from "./pages/Stocks";
import { Transactions } from "./pages/Transactions";

// Placeholder pages for missing sidebar routes
import { NotFound } from "./pages/NotFound";
const Placeholder = (label: string) => () =>
  (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-700 mb-2">{label}</h1>
      <p className="text-gray-500">This page is under construction.</p>
    </div>
  );

const Setting = Placeholder("General Setting");
const HeadIncome = Placeholder("Income Head");
const HeadExpense = Placeholder("Expense Head");
const HeadBank = Placeholder("Bank Head");
const HeadOthers = Placeholder("Others Head");
const PartyTypes = Placeholder("Party Type");
const Parties = Placeholder("Party List");
const PartyPayments = Placeholder("Party Payments");
const PartyDue = Placeholder("Party Due");
const PartyDebts = Placeholder("Party Debts");
const EmptyBagPurchase = Placeholder("Empty Bag Purchase");
const EmptyBagSales = Placeholder("Empty Bag Sales");
const EmptyBagReceive = Placeholder("Empty Bag Receive");
const EmptyBagPayment = Placeholder("Empty Bag Payment");
const EmptyBagStocks = Placeholder("Empty Bag Stocks");
const Purchases = Placeholder("Paddy Purchase");
const PurchaseLedger = Placeholder("Paddy Purchase Ledger");
const RicePurchase = Placeholder("Rice Purchase");
const RicePurchaseLedger = Placeholder("Rice Purchase Ledger");
const Sales = Placeholder("Sales List");
const SalesLedger = Placeholder("Sales Ledger");
const Productions = Placeholder("Production Order");
const ProductionDetails = Placeholder("Production Details");
const StocksGodown = Placeholder("Godown Stocks");
const StocksDetails = Placeholder("Stock Register");
const AddStocks = Placeholder("Add Stocks");
const ProductionStocks = Placeholder("Production Stocks");
const ProductionStockDetails = Placeholder("Production Stocks Details");
const DailyReport = Placeholder("Daily Report");
const FinancialStatement = Placeholder("Financial Statement");
const SmsTemplates = Placeholder("SMS Template");
const SendSms = Placeholder("Send SMS");
const Backup = Placeholder("Database Backup");

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChangePassword />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/general"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GeneralSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/head-income"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HeadIncome />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/head-expense"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HeadExpense />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/head-bank"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HeadBank />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/head-others"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HeadOthers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/party-types"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PartyTypes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parties"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Parties />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parties/payments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PartyPayments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parties/due"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PartyDue />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parties/debts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PartyDebts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emptybag-purchase"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmptyBagPurchase />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emptybag-sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmptyBagSales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emptybag-receive"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmptyBagReceive />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emptybag-payment"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmptyBagPayment />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emptybag-stocks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmptyBagStocks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Purchases />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase/ledger"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PurchaseLedger />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rice-purchase"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RicePurchase />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ricepurchase/ledger"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RicePurchaseLedger />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sale/ledger"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesLedger />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/productions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Productions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/production/details"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductionDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stocks-godown"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StocksGodown />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stocks/details"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StocksDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/addstocks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddStocks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/production-stocks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductionStocks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/production-stock/details"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductionStockDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dailyreport"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DailyReport />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial-statement"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FinancialStatement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sms-templates"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SmsTemplates />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sendsms"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SendSms />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/backup"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Backup />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dayar"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SiloSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/godown"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GodownSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/designation"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Designations />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Employees />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Attendance />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/monthly"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MonthlyAttendance />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Salary />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/category"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Categories />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stocks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Stocks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Transactions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
