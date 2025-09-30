import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./ui/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import { UIProvider } from "./contexts/UIContext";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { GeneralSettings } from "./pages/GeneralSettings";
import { SiloList } from "./pages/SiloList";
import { GodownList } from "./pages/GodownList";

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
