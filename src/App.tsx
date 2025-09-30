import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import { UIProvider } from "./contexts/UIContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { NotFound } from "./pages/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";
import { Layout } from "./components/layout/Layout";
// settings
import GeneralSettings from "./pages/settings/GeneralSettings";
import SiloList from "./pages/settings/SiloList";
import GodownList from "./pages/settings/GodownList";
// hr
import DesignationList from "./pages/hr/DesignationList";
import EmployeeList from "./pages/hr/EmployeeList";
import AttendanceList from "./pages/hr/AttendanceList";
import { AttendanceSheet } from "./pages/hr/AttendanceSheet";
import { SalarySheet } from "./pages/hr/SalarySheet";
import MonthlyAttendance from "./pages/hr/MonthlyAttendance";
import MonthlySalarySheet from "./pages/hr/MonthlySalarySheet";

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
                path="/settings/silo"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SiloList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/godown"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <GodownList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/designation"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DesignationList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/employee"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EmployeeList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/attendance"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AttendanceList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/attendance/new"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AttendanceSheet />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/salary"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SalarySheet />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/monthly-attendance"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MonthlyAttendance />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/monthly-salary"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MonthlySalarySheet />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
