import React, { useState, useEffect } from "react";
import useLanguage from "../../hooks/useLanguage";
import { User, Users, Shield, Settings } from "lucide-react";
import UserManagement from "./MainPage/UserManagement";
import GroupManagement from "./MainPage/GroupManagement";
import RoleManagement from "./MainPage/RoleManagement";
import ResourceManagement from "./MainPage/ResourceManagement";
import Navbar from "../Navbar";
import { useCRUD } from "../../hooks/useCRUD";

const Dashboard = ({ can, isReady }) => {
  const [activeTab, setActiveTab] = useState(null);
  const { language, t } = useLanguage();

  // Use CRUD hooks for data fetching
  const { data: users, loading: usersLoading } = useCRUD(
    "/users",
    can?.("User Management", "read")
  );
  const {
    data: groups,
    loading: groupsLoading,
    refresh: refreshGroups,
  } = useCRUD("/groups", can?.("Group Management", "read"));
  const { data: roles, loading: rolesLoading } = useCRUD(
    "/roles",
    can?.("Role Management", "read")
  );
  const { data: resources, loading: resourcesLoading } = useCRUD(
    "/resources",
    can?.("Resource Management", "read")
  );
  const { data: permissions, loading: permissionsLoading } = useCRUD(
    "/permissions",
    can?.("Role Management", "read")
  );

  // Set initial active tab based on permissions
  useEffect(() => {
    if (can && activeTab === null) {
      if (can("User Management", "read")) {
        setActiveTab("users");
      } else if (can("Group Management", "read")) {
        setActiveTab("groups");
      } else if (can("Role Management", "read")) {
        setActiveTab("roles");
      } else if (can("Resource Management", "read")) {
        setActiveTab("resources");
      }
    }
  }, [can, activeTab]);

  const renderCurrentScreen = () => {
    // Show loader while activeTab is null (permissions are loading)
    if (activeTab === null) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "users":
        return (
          <UserManagement
            can={can}
            groups={groups || []}
            roles={roles || []}
            resources={resources || []}
          />
        );
      case "groups":
        return (
          <GroupManagement can={can} roles={roles || []} users={users || []} />
        );
      case "roles":
        return (
          <RoleManagement
            can={can}
            resources={resources || []}
            permissions={permissions || []}
            groups={groups}
            refreshGroups={refreshGroups}
          />
        );
      case "resources":
        return <ResourceManagement can={can} />;
      default:
        return null;
    }
  };

  const hasAnyPermission =
    can?.("User Management", "read") ||
    can?.("Group Management", "read") ||
    can?.("Role Management", "read") ||
    can?.("Resource Management", "read");

  return (
    <>
      <Navbar />
      <div className="relative z-10">
        <div
          className="bg-gray-100 p-8 pb-12 font-sans antialiased m-36 rounded-2xl shadow-xl"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <div className="max-w-6xl mx-auto mt-4">
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Shield className="me-2" size={32} />
                  {t("permissionManagement")}
                </h1>
              </div>

              {/* Navigation tabs */}
              <nav
                className={`flex items-center space-x-2 p-1 bg-white rounded-full shadow-lg ${
                  language === "ar"
                    ? "flex-row space-x-reverse space-x-2"
                                        : "flex-row space-x-2"
                }`}
              >
                {can?.("User Management", "read") && (
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                      activeTab === "users"
                        ? "bg-[#166a45] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <User size={18} className="me-2" /> {t("users")}
                  </button>
                )}
                {can?.("Group Management", "read") && (
                  <button
                    onClick={() => setActiveTab("groups")}
                    className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                      activeTab === "groups"
                        ? "bg-[#166a45] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Users size={18} className="me-2" /> {t("groups")}
                  </button>
                )}
                {can?.("Role Management", "read") && (
                  <button
                    onClick={() => setActiveTab("roles")}
                    className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                      activeTab === "roles"
                        ? "bg-[#166a45] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Shield size={18} className="me-2" /> {t("roles")}
                  </button>
                )}
                {can?.("Resource Management", "read") && (
                  <button
                    onClick={() => setActiveTab("resources")}
                    className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                      activeTab === "resources"
                        ? "bg-[#166a45] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Settings size={18} className="me-2" /> {t("resources")}
                  </button>
                )}
              </nav>
            </header>

            {/* Show no permissions message if user has no permissions */}
            {!hasAnyPermission ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-4xl mb-2">🚫</div>
                <p className="text-gray-600">
                  {t("noPermissions") ||
                    "You do not have permissions to manage permissions."}
                  <br />
                  {t("noPermissionsAssignedMessage") ||
                    "No roles or permissions are assigned to your account."}
                  <br />
                  {t("contactAdministratorMessage") ||
                    "Please contact your administrator."}
                </p>
              </div>
            ) : (
              renderCurrentScreen()
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
