import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import { UIProvider } from "./contexts/UIContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { NotFound } from "./pages/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";
import MainApp from "./MainApp";
// settings
import GeneralSettings from "./pages/settings/GeneralSettings";
import SiloList from "./pages/settings/SiloList";
import GodownList from "./pages/settings/GodownList";
// hr
import DesignationList from "./pages/hr/DesignationList";
import EmployeeList from "./pages/hr/EmployeeList";
import AttendanceList from "./pages/hr/AttendanceList";
import { AttendanceSheet } from "./pages/hr/AttendanceSheet";
import SalarySheet from "./pages/hr/SalarySheet";
import MonthlyAttendance from "./pages/hr/MonthlyAttendance";
import MonthlySalarySheet from "./pages/hr/MonthlySalarySheet";
import HeadIncome from "./pages/accounts/HeadIncome";

import HeadExpense from "./pages/accounts/HeadExpense";
import HeadBank from "./pages/accounts/HeadBank";
import HeadOthers from "./pages/accounts/HeadOthers";
import Transactions from "./pages/accounts/Transactions";
import PartyTypes from "./pages/party/PartyTypes";
import PartyList from "./pages/party/PartyList";
import PartyPayments from "./pages/party/PartyPayments";
import PartyDue from "./pages/party/PartyDue";
import PartyDebts from "./pages/party/PartyDebts";
// import PartyLedger from "./pages/party/PartyLedger";
// import PartyPaymentVoucher from "./pages/party/PartyPaymentVoucher";
// import PartyDueLedger from "./pages/party/PartyDueLedger";
// import PartyDebtsLedger from "./pages/party/PartyDebtsLedger";
import CategoryList from "./pages/products/CategoryList";
import ProductList from "./pages/products/ProductList";
import EmptybagPurchaseList from "./pages/emptybags/EmptybagPurchaseList";
import EmptybagSalesList from "./pages/emptybags/EmptybagSalesList";
// import EmptybagReceive from "./pages/emptybags/EmptybagReceive";
import EmptybagPaymentList from "./pages/emptybags/EmptybagPaymentList";
import EmptybagStocksList from "./pages/emptybags/EmptybagStocksList";

import PurchaseList from "./pages/purchase/PurchaseList";
import PurchaseDetails from "./pages/purchase/PurchaseDetails";
import PurchaseLedger from "./pages/purchase/PurchaseLedger";
import RicePurchase from "./pages/purchase/RicePurchase";
import RicePurchaseLedger from "./pages/purchase/RicePurchaseLedger";
// import SalesList from "./pages/sales/SalesList";
// import SalesLedger from "./pages/sales/SalesLedger";
// import ProductionOrder from "./pages/production/ProductionOrder";
// import ProductionDetails from "./pages/production/ProductionDetails";
// import MainStocks from "./pages/stocks/MainStocks";
// import GodownStocks from "./pages/stocks/GodownStocks";
// import StockRegister from "./pages/stocks/StockRegister";
// import AddStocks from "./pages/stocks/AddStocks";
// import ProductionStocksList from "./pages/stocks/ProductionStocksList";
// import ProductionStocksDetails from "./pages/stocks/ProductionStocksDetails";
// import EmptyBagStocks from "./pages/stocks/EmptyBagStocks";
// import DailyReport from "./pages/reporting/DailyReport";
// import FinancialStatement from "./pages/reporting/FinancialStatement";
// import SMSTemplates from "./pages/sms/SMSTemplates";
// import SendSMS from "./pages/sms/SendSMS";
// import DatabaseBackup from "./pages/backup/DatabaseBackup";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <UIProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                element={
                  <ProtectedRoute>
                    <MainApp />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings/general" element={<GeneralSettings />} />
                <Route path="/settings/silo" element={<SiloList />} />
                <Route path="/settings/godown" element={<GodownList />} />
                <Route path="/hr/designation" element={<DesignationList />} />
                <Route path="/hr/employee" element={<EmployeeList />} />
                <Route path="/hr/attendance" element={<AttendanceList />} />
                <Route
                  path="/hr/attendance/new"
                  element={<AttendanceSheet />}
                />
                <Route path="/hr/salary" element={<SalarySheet />} />
                <Route
                  path="/hr/attendance/monthly"
                  element={<MonthlyAttendance />}
                />
                <Route path="/hr/salary" element={<MonthlySalarySheet />} />
                <Route path="/accounts/head-income" element={<HeadIncome />} />
                <Route
                  path="/accounts/head-expense"
                  element={<HeadExpense />}
                />
                <Route path="/accounts/head-bank" element={<HeadBank />} />
                <Route path="/accounts/head-others" element={<HeadOthers />} />
                <Route
                  path="/accounts/transactions"
                  element={<Transactions />}
                />
                <Route path="/party/party-types" element={<PartyTypes />} />
                <Route path="/party/parties" element={<PartyList />} />
                <Route path="/party/payments" element={<PartyPayments />} />
                <Route path="/party/due" element={<PartyDue />} />
                <Route path="/party/debts" element={<PartyDebts />} />
                {/* <Route path="/party/ledger" element={<PartyLedger />} /> */}
                {/* <Route path="/party/payments/:id" element={<PartyPaymentVoucher />} /> */}
                {/* <Route path="/party/due/ledger" element={<PartyDueLedger />} /> */}
                {/* <Route path="/party/debts/ledger" element={<PartyDebtsLedger />} /> */}
                <Route path="/category" element={<CategoryList />} />
                <Route path="/products" element={<ProductList />} />
                <Route
                  path="/empty/emptybag-purchase"
                  element={<EmptybagPurchaseList />}
                />
                <Route
                  path="/empty/emptybag-sales"
                  element={<EmptybagSalesList />}
                />
                {/* <Route path="/empty/emptybag-receive" element={<EmptybagReceive />} /> */}
                <Route
                  path="/empty/emptybag-payment"
                  element={<EmptybagPaymentList />}
                />
                <Route
                  path="/empty/emptybag-stocks"
                  element={<EmptybagStocksList />}
                />
                <Route path="/purchases/purchase" element={<PurchaseList />} />
                <Route
                  path="/purchases/purchase/:id"
                  element={<PurchaseDetails />}
                />
                <Route path="/purchases/ledger" element={<PurchaseLedger />} />
                <Route path="/purchases/rice-purchase" element={<RicePurchase />} />
                <Route path="/purchases/rice-purchase/ledger" element={<RicePurchaseLedger />} />
                {/* <Route path="/sales" element={<SalesList />} /> */}
                {/* <Route path="/sale/ledger" element={<SalesLedger />} /> */}
                {/* <Route path="/productions" element={<ProductionOrder />} /> */}
                {/* <Route path="/production/details" element={<ProductionDetails />} /> */}
                {/* <Route path="/stocks" element={<MainStocks />} /> */}
                {/* <Route path="/stocks-godown" element={<GodownStocks />} /> */}
                {/* <Route path="/stocks/details" element={<StockRegister />} /> */}
                {/* <Route path="/stocks/addstocks" element={<AddStocks />} /> */}
                {/* <Route path="/stocks/production-stocks" element={<ProductionStocksList />} /> */}
                {/* <Route path="/stocks/production-stock/details" element={<ProductionStocksDetails />} /> */}
                {/* <Route path="/stocks/emptybag-stocks" element={<EmptyBagStocks />} /> */}
                {/* <Route path="/dailyreport" element={<DailyReport />} /> */}
                {/* <Route path="/financial-statement" element={<FinancialStatement />} /> */}
                {/* <Route path="/sms-templates" element={<SMSTemplates />} /> */}
                {/* <Route path="/sendsms" element={<SendSMS />} /> */}
                {/* <Route path="/backup" element={<DatabaseBackup />} /> */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
