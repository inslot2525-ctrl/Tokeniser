import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppProvider from "./context/AppProvider";
import DashboardLayout from "./components/Layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import OptimizerPage from "./pages/OptimizerPage";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <Routes>
          {/* Login — no layout wrapper */}
          <Route path="/login" element={<LoginPage onLogin={() => {}} />} />

          {/* All other routes inside the dashboard layout */}
          <Route
            path="/"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/optimizer"
            element={
              <DashboardLayout>
                <OptimizerPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
