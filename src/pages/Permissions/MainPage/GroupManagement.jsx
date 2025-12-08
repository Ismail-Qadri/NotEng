import React, { useState } from "react";
import { Plus, Edit, Trash2 } from 'lucide-react';
import useLanguage from "../../../hooks/useLanguage";
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import api from "../../../api"; 

const GroupManagement = ({ groups, roles, users, onEdit, onAdd, onDelete, can }) => {
  const { language, t } = useLanguage();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(""); 

  const handleDeleteClick = (group) => {
    setGroupToDelete(group);
    setDeleteError(""); 
    setConfirmOpen(true);
  };

  // Use api instance for delete if onDelete is not provided
  const handleConfirmDelete = async () => {
    setDeleteError(""); 
    if (!groupToDelete) return;
    try {
      if (onDelete) {
        await onDelete(groupToDelete.id);
      } else {
        await api.delete(`/groups/${groupToDelete.id}`); 
      }
      setConfirmOpen(false);
      setGroupToDelete(null);
    } catch (err) {
      // Prefer localized error message if available
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
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setGroupToDelete(null);
    setDeleteError("");
  };

  // Get role name from group.roles array if present, else fallback to roleId lookup
  const getRoleName = (group) => {
    if (Array.isArray(group.roles) && group.roles.length > 0) {
      return group.roles.map(r => r.name).join(', ');
    }
    // fallback to roleId lookup if roles array is missing
    return roles.find(r => r.id === group.roleId)?.name || 'N/A';
  };

const getUserCount = (group) => {
  return Array.isArray(group.users) ? group.users.length : 0;
};

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">{t('allGroups')}</h2>
        {can("Group Management", "write") && (
          <button
            onClick={onAdd}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t('addGroup')}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupName')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('assignedRole')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('userCount')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groups && groups.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No groups found</td></tr>
            )}
            {groups && groups.map((group) => (
              <tr key={group.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleName(group)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getUserCount(group)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {can("Group Management", "write") ? (
                    <button onClick={() => onEdit(group)} className="text-teal-600 hover:text-teal-900 me-4">
                      <Edit size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                      <Edit size={18} />
                    </button>
                  )}
                  {can("Group Management", "delete") ? (
                    <button onClick={() => handleDeleteClick(group)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDeleteModal
        open={confirmOpen}
        message={t('deleteEntityConfirm', { entity: t('group') })}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        error={deleteError}
      />
    </div>
  );
};

export default GroupManagement;