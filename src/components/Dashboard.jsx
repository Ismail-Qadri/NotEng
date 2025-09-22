import React, { useState, useEffect } from "react";
import useLanguage from "../hooks/useLanguage";
import { User, Users, Shield, Settings } from "lucide-react";
import UserManagement from "./UserManagement";
import GroupManagement from "./GroupManagement";
import RoleManagement from "./RoleManagement";
import ResourceManagement from "./ResourceManagement";
import UserModal from "../Modals/UserModal";
import GroupModal from "../Modals/GroupModal";
import RoleModal from "../Modals/RoleModal";
import ResourceModal from "../Modals/ResourceModal";
import Navbar from "./Navbar";
import axios from "axios";

const API_BASE_URL = "https://dev-api.wedo.solutions:3000/api";

const Dashboard = () => {
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

  // CASBIN SETUP ONLY
  const [casbinEnforcer, setCasbinEnforcer] = useState(null);
  const [casbinLoading, setCasbinLoading] = useState(true);

// Add state to cache policies
const [casbinPolicies, setCasbinPolicies] = useState([]);

// Update your setupCasbin to cache policies
useEffect(() => {
  async function setupCasbin() {
    setCasbinLoading(true);

    if (!resources.length || !permissions.length) {
      setCasbinLoading(false);
      return;
    }

    const userId = localStorage.getItem("userId");
    const userPerms = JSON.parse(localStorage.getItem("userPermissions") || "{}");

    // Build Casbin policy array
    const policyRules = [];
    Object.entries(userPerms).forEach(([resourceId, permIds]) => {
      const resource = resources.find(r => String(r.id) === String(resourceId));
      if (!resource) return;
      permIds.forEach(permId => {
        const perm = permissions.find(p => String(p.id) === String(permId));
        if (!perm) return;
        policyRules.push(['p', userId, resource.name, perm.name]);
      });
    });

    console.log("Generated Casbin Policy Rules:", policyRules);

    const modelText = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
`;

    try {
      const casbin = await import('casbin');
      const enforcer = await casbin.newEnforcer();
      const model = casbin.newModel();
      model.loadModelFromText(modelText);
      enforcer.setModel(model);
      
      // Add policies one by one
      for (const rule of policyRules) {
        await enforcer.addPolicy(...rule.slice(1)); // Remove 'p' prefix
      }

      // Get and cache the policies
      const policies = await enforcer.getPolicy();
      console.log("All policies:", policies);
      
      setCasbinEnforcer(enforcer);
      setCasbinPolicies(policies); // Cache the policies
      setCasbinLoading(false);
    } catch (error) {
      console.error('Error setting up Casbin:', error);
      setCasbinLoading(false);
    }
  }

  setupCasbin();
}, [resources, permissions]);

// Update your can function to use cached policies
const can = (resourceName, action) => {
  const userId = localStorage.getItem("userId");
  
  if (!casbinEnforcer || !userId || !resourceName || !action || !Array.isArray(casbinPolicies)) {
    return false;
  }
  
  try {
    const hasPermission = casbinPolicies.some(policy => 
      Array.isArray(policy) &&
      policy[0] === userId && 
      policy[1] === resourceName && 
      policy[2] === action
    );
    

    return hasPermission;
  } catch (error) {
    console.error('Error checking Casbin permission:', error);
    return false;
  }
};


  // Fetch roles from API
  const fetchRoles = async () => {
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

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
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

  // Load data on component mount
  useEffect(() => {
    fetchRoles();
    fetchGroups();
    fetchResources();
    fetchUsers();
    fetchPermissions();
  }, []);

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
      await axios.delete(`${API_BASE_URL}/${endpoint}/${itemId}`);
      await refreshAll();
    } catch (err) {
      console.error(`Error deleting from ${endpoint}:`, err);
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
      default:
        return null;
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

  // CASBIN LOADING CHECK
  if (casbinLoading || !casbinEnforcer) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading Casbin permissions...</div>
        </div>
      </>
    );
  }

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
                {/* {can("User Management", "read") && ( */}
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
                {/* )} */}
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
            {renderCurrentScreen()}
          </div>
          {renderModal()}
        </div>
      </div>
    </>
  );
};

export default Dashboard;