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
                  path="/hr/monthly-attendance"
                  element={<MonthlyAttendance />}
                />
                <Route
                  path="/hr/monthly-salary"
                  element={<MonthlySalarySheet />}
                />
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
