import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Permissions/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/ProtectedRoute";
import NotificationsDashboard from "./pages/Notifications/NotificationsMainPage/NotificationsDashboard";
import CasbinProvider from "./pages/CasbinProvider";

const App = () => {
  return (
    <Router basename="/notifications-ui">
      <Routes>
        <Route path="/login" element={<Login />} />
    
        <Route 
          path="/permissions" 
          element={
            <ProtectedRoute>
            <CasbinProvider>
              {({ can, resources, permissions, refreshPermissions }) => (
                <Dashboard 
                  can={can} 
                  resources={resources} 
                  permissions={permissions}
                  refreshPermissions={refreshPermissions}
                />
              )}
            </CasbinProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
            <CasbinProvider>
              {({ can, resources, permissions, refreshPermissions }) => (
                <NotificationsDashboard 
                  can={can}
                  resources={resources}
                  permissions={permissions}
                  refreshPermissions={refreshPermissions}
                />
              )}
            </CasbinProvider>
            </ProtectedRoute>
          } 
        />
        {/* Redirect any unknown path to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;


