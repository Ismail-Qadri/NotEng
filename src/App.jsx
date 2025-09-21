import React, { useState, useEffect } from "react";
import useLanguage from "./hooks/useLanguage";
import { User, Users, Shield, Settings } from "lucide-react";
import UserManagement from "./components/UserManagement";
import GroupManagement from "./components/GroupManagement";
import RoleManagement from "./components/RoleManagement";
import ResourceManagement from "./components/ResourceManagement";
import UserModal from "./Modals/UserModal";
import GroupModal from "./Modals/GroupModal";
import RoleModal from "./Modals/RoleModal";
import ResourceModal from "./Modals/ResourceModal";
import Navbar from "./components/Navbar";
import axios from "axios";
// import ParticleBackground from './components/ParticleBackground';

const API_BASE_URL = "https://dev-api.wedo.solutions:3000/api";

const App = () => {
  const [resources, setResources] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const { language, setLanguage, t } = useLanguage();

  // Fetch roles from API
  const fetchRoles = async () => {
    // ...existing code...
    try {
      const res = await axios.get(`${API_BASE_URL}/roles`);
      console.log("API roles response:", res.data);
      setRoles(res.data);
      console.log("Fetched roles:", res.data);
    } catch (err) {
      setError && setError(err.message);
      console.error("Error fetching roles:", err);
    }
  };


  const fetchGroups = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/groups`);
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
    console.error("Error fetching groups:", err);
  }
};

const fetchResources = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/resources`);
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
    console.error("Error fetching resources:", err);
  }
};
  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      // If users have a createdAt field, sort by it ascending (oldest first, newest last)
      let sortedUsers = Array.isArray(res.data)
        ? [...res.data].sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0; // fallback: keep order as is
          })
        : res.data;
      setUsers(sortedUsers);
      console.log("Fetched users:", sortedUsers);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    }
  };

  

  const fetchPermissions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/permissions`);
      setPermissions(res.data);
      console.log("Fetched permissions:", res.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching permissions:", err);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchGroups(),
        fetchUsers(),
        fetchResources(),
        fetchRoles(),
        fetchPermissions(),
      ]);
      setLoading(false);
    };
    loadAllData();
  }, []);

  // Unified refresh function for all entities
  const refreshAll = async () => {
    await Promise.all([
      fetchUsers(),
      fetchGroups(),
      fetchRoles(),
      fetchResources(),
      fetchPermissions(),
    ]);
  };

  // User handlers
  const handleAddUser = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleEditUser = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleDeleteUser = async (itemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${itemId}`);
      await refreshAll();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Group handlers
  const handleAddGroup = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleEditGroup = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleDeleteGroup = async (itemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/groups/${itemId}`);
      await refreshAll();
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  // Role handlers
  const handleAddRole = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleEditRole = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleDeleteRole = async (itemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/roles/${itemId}`);
      await refreshAll();
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  // Resource handlers
  const handleAddResource = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleEditResource = async () => {
    await refreshAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleDeleteResource = async (itemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/resources/${itemId}`);
      await refreshAll();
    } catch (err) {
      console.error("Error deleting resource:", err);
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
    if (loading) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      );
    }

    switch (activeTab) {
      case "groups":
        return (
          <GroupManagement
            groups={groups}
            roles={roles}
            users={users}
            onEdit={(item) => openEditModal("group", item)}
            onDelete={handleDeleteGroup}
            onAdd={() => openAddModal("group")}
          />
        );
      case "roles":
        return (
          <RoleManagement
            roles={roles}
            resources={resources}
            permissions={permissions}
            onEdit={(item) => openEditModal("role", item)}
            onDelete={handleDeleteRole}
            onAdd={() => openAddModal("role")}
          />
        );
      case "resources":
        return (
          <ResourceManagement
            resources={resources}
            onEdit={(item) => openEditModal("resource", item)}
            onDelete={handleDeleteResource}
            onAdd={() => openAddModal("resource")}
          />
        );
      case "users":
      default:
        return (
          <UserManagement
            users={users}
            groups={groups}
            roles={roles}
            onEdit={(item) => openEditModal("user", item)}
            onDelete={handleDeleteUser}
            onAdd={() => openAddModal("user")}
          />
        );
    }
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
            onClose={() => setIsModalOpen(false)}
            onSave={editingItem ? handleEditUser : handleAddUser}
            user={editingItem}
          />
        );
      case "group":
        return (
          <GroupModal
            groups={groups}
            roles={roles}
            onClose={() => setIsModalOpen(false)}
            onSave={editingItem ? handleEditGroup : handleAddGroup}
            group={editingItem}
          />
        );
      case "role":
        return (
          <RoleModal
            resources={resources}
            permissions={permissions}
            onClose={() => setIsModalOpen(false)}
            onSave={editingItem ? handleEditRole : handleAddRole}
            role={editingItem}
          />
        );
      case "resource":
        return (
          <ResourceModal
            onClose={() => setIsModalOpen(false)}
            onSave={editingItem ? handleEditResource : handleAddResource}
            resource={editingItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* <div className="min-h-screen relative"> */}
      <Navbar />
      <div className="relative z-10">
        <div
          className="bg-gray-100 p-8 pb-12 font-sans antialiased m-36 rounded-2xl shadow-xl"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <div className="max-w-6xl mx-auto mt-4">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Shield className="me-2" size={32} />{" "}
                {t("permissionManagement")}
              </h1>
              <nav
                className={`flex items-center space-x-2 p-1 bg-white rounded-full shadow-lg ${
                  language === "ar" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
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
              </nav>
            </header>
            {renderCurrentScreen()}
          </div>
          {renderModal()}
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default App;
