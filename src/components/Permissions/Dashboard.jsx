import React, { useState, useEffect } from "react";
import useLanguage from "../../hooks/useLanguage";
import { User, Users, Shield, Settings } from "lucide-react";
import UserManagement from "./MainPage/UserManagement";
import GroupManagement from "./MainPage/GroupManagement";
import RoleManagement from "./MainPage/RoleManagement";
import ResourceManagement from "./MainPage/ResourceManagement";
import UserModal from "./Modals/UserModal";
import GroupModal from "./Modals/GroupModal";
import RoleModal from "./Modals/RoleModal";
import ResourceModal from "./Modals/ResourceModal";
import Navbar from "../Navbar";
import api from "../../api";

const Dashboard = ({
  can,
  resources: passedResources,
  permissions: passedPermissions,
  refreshPermissions,
  isReady,
}) => {
  const [resources, setResources] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [activeTab, setActiveTab] = useState(null);
  const { language, setLanguage, t } = useLanguage();

  // Set default tab based on permissions
  useEffect(() => {
    if (can && activeTab === null) {
      const getDefaultTab = () => {
        if (can("User Management", "read")) {
          return "users";
        }
        if (can("Group Management", "read")) {
          return "groups";
        }
        if (can("Role Management", "read")) {
          return "roles";
        }
        if (can("Resource Management", "read")) {
          return "resources";
        }
        return null;
      };

      const tab = getDefaultTab();
      setActiveTab(tab);
    }
  }, [can, activeTab]); // ✅ Add activeTab to dependencies

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      setRoles(res.data);
      console.log("Fetched roles:", res.data);
    } catch (err) {
      setError && setError(err.message);
      console.error("❌ Error fetching roles:", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      let sortedGroups = Array.isArray(res.data)
        ? [...res.data].sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
          })
        : res.data;
      setGroups(sortedGroups);
      console.log("Fetched groups:", sortedGroups);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error fetching groups:", err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await api.get("/resources");
      let sortedResources = Array.isArray(res.data)
        ? [...res.data].sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
          })
        : res.data;
      setResources(sortedResources);
      console.log("Fetched resources:", sortedResources);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error fetching resources:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      let sortedUsers = Array.isArray(res.data)
        ? [...res.data].sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
          })
        : res.data;
      setUsers(sortedUsers);
      console.log("Fetched users:", sortedUsers);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error fetching users:", err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/permissions");
      setPermissions(res.data);
      console.log("Fetched permissions:", res.data);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error fetching permissions:", err);
    }
  };

  useEffect(() => {
    if (can) {
      if (can("Role Management", "read")) fetchRoles();
      if (can("Group Management", "read")) fetchGroups();
      if (can("Resource Management", "read")) fetchResources();
      if (can("User Management", "read")) fetchUsers();
      if (can("Role Management", "read")) fetchPermissions();
    }
  }, [can]);

  const openModal = (type, item = null) => {
    setIsModalOpen(type);
    setEditingItem(item);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchUsers(),
      fetchGroups(),
      fetchRoles(),
      fetchResources(),
      fetchPermissions(),
    ]);
  };

  const afterSaveOrEdit = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (endpoint, itemId) => {
    try {
      await api.delete(`/${endpoint}/${itemId}`);
      await refreshAll();
    } catch (err) {
      console.error(`Error deleting from ${endpoint}:`, err);
      throw err;
    }
  };

  const openAddModal = (type) => {
    setEditingItem(null);
    setIsModalOpen({ type });
  };

  const openEditModal = (type, item) => {
    setEditingItem(item);
    setIsModalOpen({ type });
  };

  const renderCurrentScreen = () => {
    // ✅ Show loader while activeTab is null (permissions are loading)
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
            users={users}
            groups={groups}
            roles={roles}
            onEdit={(item) => openEditModal("user", item)}
            onDelete={(id) => handleDelete("users", id)}
            onAdd={() => openAddModal("user")}
            language={language}
            t={t}
            can={can}
          />
        );
      case "groups":
        return (
          <GroupManagement
            groups={groups}
            roles={roles}
            users={users}
            onEdit={(item) => openEditModal("group", item)}
            onDelete={(id) => handleDelete("groups", id)}
            onAdd={() => openAddModal("group")}
            language={language}
            t={t}
            can={can}
          />
        );
      case "roles":
        return (
          <RoleManagement
            roles={roles}
            resources={resources}
            permissions={permissions}
            onEdit={(item) => openEditModal("role", item)}
            onDelete={(id) => handleDelete("roles", id)}
            onAdd={() => openAddModal("role")}
            language={language}
            t={t}
            can={can}
          />
        );
      case "resources":
        return (
          <ResourceManagement
            resources={resources}
            onEdit={(item) => openEditModal("resource", item)}
            onDelete={(id) => handleDelete("resources", id)}
            onAdd={() => openAddModal("resource")}
            language={language}
            t={t}
            can={can}
          />
        );
    }

    return null;
  };

  const renderModal = () => {
    if (!isModalOpen) return null;

    switch (isModalOpen.type) {
      case "user":
        return (
          <UserModal
            groups={groups}
            roles={roles}
            resources={resources}
            onClose={closeModal}
            onSave={afterSaveOrEdit}
            user={editingItem}
            can={can}
          />
        );
      case "group":
        return (
          <GroupModal
            groups={groups}
            roles={roles}
            onClose={closeModal}
            onSave={afterSaveOrEdit}
            group={editingItem}
            can={can}
          />
        );
      case "role":
        return (
          <RoleModal
            resources={resources}
            permissions={permissions}
            onClose={closeModal}
            onSave={afterSaveOrEdit}
            role={editingItem}
            can={can}
          />
        );
      case "resource":
        return (
          <ResourceModal
            onClose={closeModal}
            onSave={afterSaveOrEdit}
            resource={editingItem}
            can={can}
          />
        );
      default:
        return null;
    }
  };

  const hasAnyPermission =
    can("User Management", "read") ||
    can("Group Management", "read") ||
    can("Role Management", "read") ||
    can("Resource Management", "read");

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
                  <Shield className="me-2" size={32} />{" "}
                  {t("permissionManagement")}
                </h1>
              </div>
              {/* CASBIN-BASED NAVIGATION */}
              <nav
                className={`flex items-center space-x-2 p-1 bg-white rounded-full shadow-lg ${
                  language === "ar" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {can("User Management", "read") && (
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
                {can("Group Management", "read") && (
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
                {can("Role Management", "read") && (
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
                {can("Resource Management", "read") && (
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
          {renderModal()}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
