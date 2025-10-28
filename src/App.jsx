import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Permissions/Dashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationsDashboard from "./components/Notifications/NotificationsMainPage/NotificationsDashboard";
import CasbinProvider from "./components/CasbinProvider";

const App = () => {
  return (
    <Router>
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
        {/* Catch-all route: redirect any unknown path to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;


