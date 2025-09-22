import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const UserManagement = ({ users, groups, roles, onEdit, onAdd, onDelete, can }) => {
  const { language, t } = useLanguage();

  // Add search state
  const [search, setSearch] = useState('');
   const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  
  const handleDeleteClick = (user) => {
    setRoleToDelete(user);
    setDeleteError("");
    setConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    setDeleteError("");
    if (!roleToDelete) return;
    try {
      await onDelete(roleToDelete.id);
      setConfirmOpen(false);
      setRoleToDelete(null);
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
  };
  
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setRoleToDelete(null);
    setDeleteError("");
  };
  // Get group names for a user based on which groups contain this user
  const getGroupNamesForUser = (userId) => {
    if (!Array.isArray(groups)) return '';
    const userGroups = groups.filter(group => 
      Array.isArray(group.users) && group.users.some(user => user.id === userId)
    );
    return userGroups.map(group => group.name).join(', ');
  };

  // Get role names for a user based on which groups contain this user
  const getRoleNamesForUser = (userId) => {
    if (!Array.isArray(groups)) return '';
    const userGroups = groups.filter(group => 
      Array.isArray(group.users) && group.users.some(user => user.id === userId)
    );
    // Each group should have only one role
    const roleNames = userGroups.flatMap(group => 
      Array.isArray(group.roles) ? group.roles.map(role => role.name) : []
    ).filter(Boolean);
    // Remove duplicates
    const uniqueRoleNames = Array.from(new Set(roleNames));
    return uniqueRoleNames.join(', ');
  };

  // Delete user
  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  // Filter users by nafath_id or id or name (case-insensitive)
  const filteredUsers = users
  ? users.filter(user => {
      const searchValue = search.trim();
      if (!searchValue) return true;
      // Only match if nafath_id or id starts with the search value
      return (
        (user.nafath_id && user.nafath_id.toString().startsWith(searchValue)) ||
        (user.id && user.id.toString().startsWith(searchValue)) ||
        (user.name && user.name.toLowerCase().startsWith(searchValue.toLowerCase()))
      );
    })
  : [];

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
  onChange={e => {
    // Only allow digits
    const numericValue = e.target.value.replace(/\D/g, '');
    setSearch(numericValue);
  }}
  className={`ps-10 pe-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-200 ${language === 'ar' ? 'text-right' : ''}`}
/>
            <Search size={18} className={`absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
          </div>
          {can("User Management", "write") && (
            <button onClick={onAdd} className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full">
              <Plus size={16} className="me-2" /> {t('addUser')}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
               <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('nationalId')}</th>
              <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('groupsLabel')}</th>
              <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('rolesLabel')}</th>
              <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers && filteredUsers.length === 0 && (
              <tr><td colSpan={groups.length + 2} className="px-6 py-4 text-center text-gray-500">No users found</td></tr>
            )}
            {filteredUsers && filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nafath_id || user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Users size={16} className="text-gray-400" />
                    {(() => {
                      const groupNames = getGroupNamesForUser(user.id);
                      return groupNames ? (
                        <span>{groupNames}</span>
                      ) : (
                        <span className="text-gray-400">{t('noGroups')}</span>
                      );
                    })()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const roleNamesStr = getRoleNamesForUser(user.id);
                      const roleArr = roleNamesStr ? roleNamesStr.split(', ').filter(Boolean) : [];
                      return roleArr.map((roleName, index) => (
                        <span key={index} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          roleName === 'User Admin' ? 'bg-red-100 text-red-800' :
                          roleName === 'Resource Admin' ? 'bg-yellow-100 text-yellow-800' :
                          roleName === 'Role Admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-teal-100 text-teal-800'
                        }`}>
                          {roleName}
                        </span>
                      ));
                    })()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {can("User Management", "write") ? (
                    <button onClick={() => onEdit(user)} className="text-teal-600 hover:text-teal-900 me-4">
                      <Edit size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                      <Edit size={18} />
                    </button>
                  )}

                  {can("User Management", "delete") ? (
  <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-900">
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
  message={t('deleteEntityConfirm', { entity: t('user') })}
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
  error={deleteError}
/>
    </div>
  );
};

export default UserManagement;