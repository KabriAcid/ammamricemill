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
import { NotFound } from "./pages/NotFound";

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
