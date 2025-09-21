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

  const handleCreate = async (type, data) => {
    try {
      console.log(`Creating ${type}:`, data);
      const res = await axios.post(`${API_BASE_URL}/${type}`, data);
      console.log(`${type} created:`, res.data);

      // Immediately update local state with the new item
      const newItem = res.data;
      switch (type) {
        case "users":
          setUsers(prev => [...prev, newItem]);
          break;
        case "groups":
          setGroups(prev => [...prev, newItem]);
          break;
        case "roles":
          setRoles(prev => [...prev, newItem]);
          break;
        case "resources":
          setResources(prev => [...prev, newItem]);
          break;
        default:
          break;
      }
      closeModal();
    } catch (err) {
      console.error(`Error creating ${type}:`, err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpdate = async (type, id, data) => {
    try {
      console.log(`Updating ${type} ${id}:`, data);
      const res = await axios.put(`${API_BASE_URL}/${type}/${id}`, data);
      console.log(`${type} updated:`, res.data);

      // Immediately update local state with the updated item
      const updatedItem = res.data;
      switch (type) {
        case "users":
          setUsers(prev => prev.map(item => item.id === id ? updatedItem : item));
          break;
        case "groups":
          setGroups(prev => prev.map(item => item.id === id ? updatedItem : item));
          break;
        case "roles":
          setRoles(prev => prev.map(item => item.id === id ? updatedItem : item));
          break;
        case "resources":
          setResources(prev => prev.map(item => item.id === id ? updatedItem : item));
          break;
        default:
          break;
      }
      closeModal();
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/${type}/${id}`);
        console.log(`${type} deleted:`, id);

        // Immediately remove the item from local state
        switch (type) {
          case "users":
            setUsers(prev => prev.filter(item => item.id !== id));
            break;
          case "groups":
            setGroups(prev => prev.filter(item => item.id !== id));
            break;
          case "roles":
            setRoles(prev => prev.filter(item => item.id !== id));
            break;
          case "resources":
            setResources(prev => prev.filter(item => item.id !== id));
            break;
          default:
            break;
        }
      } catch (err) {
        console.error(`Error deleting ${type}:`, err);
        setError(err.response?.data?.message || err.message);
        // On error, refetch to restore correct state
        switch (type) {
          case "users":
            fetchUsers();
            break;
          case "groups":
            fetchGroups();
            break;
          case "roles":
            fetchRoles();
            break;
          case "resources":
            fetchResources();
            break;
          default:
            break;
        }
      }
    }
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case "users":
        return (
          <UserManagement
            users={users}
            groups={groups}
            roles={roles}
            onEdit={(user) => openModal("users", user)}
            onDelete={(id) => handleDelete("users", id)}
            onAdd={() => openModal("users")}
            language={language}
            t={t}
          />
        );
      case "groups":
        return (
          <GroupManagement
            groups={groups}
            roles={roles}
            users={users}
            onEdit={(group) => openModal("groups", group)}
            onDelete={(id) => handleDelete("groups", id)}
            onAdd={() => openModal("groups")}
            language={language}
            t={t}
          />
        );
      case "roles":
        return (
          <RoleManagement
            roles={roles}
            resources={resources}
            permissions={permissions}
            onEdit={(role) => openModal("roles", role)}
            onDelete={(id) => handleDelete("roles", id)}
            onAdd={() => openModal("roles")}
            language={language}
            t={t}
          />
        );
      case "resources":
        return (
          <ResourceManagement
            resources={resources}
            onEdit={(resource) => openModal("resources", resource)}
            onDelete={(id) => handleDelete("resources", id)}
            onAdd={() => openModal("resources")}
            language={language}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!isModalOpen) return null;

    switch (isModalOpen) {
      case "users":
        return (
          <UserModal
            isOpen={true}
            onClose={closeModal}
            onSave={(data) =>
              editingItem
                ? handleUpdate("users", editingItem.id, data)
                : handleCreate("users", data)
            }
            user={editingItem}
            groups={groups}
            roles={roles}
            resources={resources}
            language={language}
            t={t}
          />
        );
      case "groups":
        return (
          <GroupModal
            isOpen={true}
            onClose={closeModal}
            onSave={(data) =>
              editingItem
                ? handleUpdate("groups", editingItem.id, data)
                : handleCreate("groups", data)
            }
            group={editingItem}
            users={users}
            roles={roles}
            language={language}
            t={t}
          />
        );
      case "roles":
        return (
          <RoleModal
            isOpen={true}
            onClose={closeModal}
            onSave={(data) =>
              editingItem
                ? handleUpdate("roles", editingItem.id, data)
                : handleCreate("roles", data)
            }
            role={editingItem}
            resources={resources}
            permissions={permissions}
            language={language}
            t={t}
          />
        );
      case "resources":
        return (
          <ResourceModal
            isOpen={true}
            onClose={closeModal}
            onSave={(data) =>
              editingItem
                ? handleUpdate("resources", editingItem.id, data)
                : handleCreate("resources", data)
            }
            resource={editingItem}
            language={language}
            t={t}
          />
        );
      default:
        return null;
    }
  };

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
    </>
  );
};

export default Dashboard;