import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import useLanguage from '../../../hooks/useLanguage';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import api from "../../../api";

const isDev = import.meta.env.DEV;

const UserManagement = ({ users: propUsers, groups: propGroups, roles: propRoles, onEdit, onAdd, onDelete, can }) => {
  const { language, t } = useLanguage();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState(propUsers || []);
  const [groups, setGroups] = useState(propGroups || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");


useEffect(() => {
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get("/groups");
      setGroups(res.data || []);
      if (isDev) console.log("Fetched groups with roles:", res.data);
    } catch (err) {
      if (isDev) console.error("Error fetching groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };
  fetchGroups();
}, []);

  useEffect(() => {
    if (propUsers) setUsers(propUsers);
  }, [propUsers]);

  useEffect(() => {
    if (propGroups) setGroups(propGroups);
  }, [propGroups]);

  const handleDeleteClick = useCallback((user) => {
    setRoleToDelete(user);
    setDeleteError("");
    setConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteError("");
    if (!roleToDelete) return;
    try {
      if (onDelete) {
        await onDelete(roleToDelete.id);
      } else {
        await api.delete(`/users/${roleToDelete.id}`);
      }
      setConfirmOpen(false);
      setRoleToDelete(null);
      setUsers(prev => prev.filter(u => u.id !== roleToDelete.id));
    } catch (err) {
      const apiData = err?.response?.data || {};
      let errorMessage = "";
      if (language === "ar" && apiData.errorMessage_AR) {
        errorMessage = apiData.errorMessage_AR;
      } else if (language === "en" && apiData.errorMessage_EN) {
        errorMessage = apiData.errorMessage_EN;
      } else {
        errorMessage =
          apiData.error ||
          apiData.message ||
          err?.message ||
          t('apiErrorGeneric');
      }
      setDeleteError(errorMessage);
    }
  }, [roleToDelete, onDelete, language, t]);

  const handleCancelDelete = useCallback(() => {
    setConfirmOpen(false);
    setRoleToDelete(null);
    setDeleteError("");
  }, []);

  // Always use the latest groups for role lookup
const getAllRolesForUser = useMemo(() => {
  return (user) => {
    // Direct roles
    const directRoles = Array.isArray(user.roles) ? user.roles.map(r => r.name) : [];
    // Group roles
    let groupRoles = [];
    if (user.groups && Array.isArray(user.groups) && Array.isArray(groups) && groups.length > 0) {
      user.groups.forEach(userGroup => {
        const fullGroup = groups.find(g =>
          String(g.id) === String(userGroup.id) ||
          g.name === userGroup.name
        );
        if (fullGroup && Array.isArray(fullGroup.roles)) {
          groupRoles.push(...fullGroup.roles.map(r => r.name));
        }
      });
    }
    // Remove duplicates
    return Array.from(new Set([...directRoles, ...groupRoles]));
  };
}, [groups]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const searchValue = search.trim();
    if (!searchValue) return users;
    return users.filter(user =>
      (user.nafath_id && user.nafath_id.toString().startsWith(searchValue)) ||
      (user.id && user.id.toString().startsWith(searchValue)) ||
      (user.name && user.name.toLowerCase().startsWith(searchValue.toLowerCase()))
    );
  }, [users, search]);

  const handleSearchChange = useCallback((e) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    setSearch(numericValue);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">{t('allUsers')}</h2>
        <div className={`flex items-center space-x-4 ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchUsers')}
              value={search}
              onChange={handleSearchChange}
              className={`ps-10 pe-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-200 ${language === 'ar' ? 'text-right' : ''}`}
            />
            <Search size={18} className={`absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400`} />
          </div>
          {can && can("User Management", "write") && (
            <button onClick={onAdd} className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full hover:bg-[#0f5434] transition-colors">
              <Plus size={16} className="me-2" /> {t('addUser')}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('nationalId')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupsLabel')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rolesLabel')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {search ? t('noResultsFound') : t('noUsersFound')}
                </td>
              </tr>
            )}
            {filteredUsers.map((user) => {
              const userRoles = getAllRolesForUser(user);
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.nafath_id || user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Users size={16} className="text-gray-500 flex-shrink-0" />
                      {user.groups && user.groups.length > 0 ? (
                        <span className="whitespace-nowrap text-sm text-gray-600">
                          {user.groups.map(g => g.name).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">{t('noGroups')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {userRoles.length > 0 ? (
                        userRoles.map((roleName, index) => (
                          <span
                            key={`${user.id}-${roleName}-${index}`}
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800`}
                          >
                            {roleName}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">{t('noRoles')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        disabled={!can || !can("User Management", "write")}
                        className={`${
                          can && can("User Management", "write")
                            ? "text-teal-600 hover:text-teal-900"
                            : "opacity-50 cursor-not-allowed"
                        } transition-colors`}
                        aria-label="Edit user"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={!can || !can("User Management", "delete")}
                        className={`${
                          can && can("User Management", "delete")
                            ? "text-red-600 hover:text-red-900"
                            : "opacity-50 cursor-not-allowed"
                        } transition-colors`}
                        aria-label="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDeleteModal
        open={confirmOpen}
        message={t('deleteEntityConfirm', { entity: t('user') })}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        error={deleteError}
      />
    </div>
  );
};

export default React.memo(UserManagement);