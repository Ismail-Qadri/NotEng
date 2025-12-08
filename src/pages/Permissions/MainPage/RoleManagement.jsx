import React , { useState} from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Pencil,
  Trash2 as TrashIcon,
  PlusCircle,
} from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import api from "../../../api"; 

const permissionIcons = {
  read: Eye,
  write: Pencil,
  delete: TrashIcon,
  create: PlusCircle,
};

const RoleManagement = ({
  roles,
  resources,
  permissions,
  onEdit,
  onAdd,
  onDelete,
  can,
}) => {
   const { language, t } = useLanguage();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteError("");
    setConfirmOpen(true);
  };

  // Use api instance for delete if onDelete is not provided
  const handleConfirmDelete = async () => {
    setDeleteError("");
    if (!roleToDelete) return;
    try {
      if (onDelete) {
        await onDelete(roleToDelete.id);
      } else {
        await api.delete(`/roles/${roleToDelete.id}`); 
      }
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

  const getUniquePermissionNames = (role, permissions) => {
    if (!role.policies || role.policies.length === 0) {
      return <span className="text-gray-400">No permissions</span>;
    }
    // Extract permission IDs from "permission::1"
    const uniquePermissionIds = [
      ...new Set(
        role.policies.map((policy) => {
          const match = String(policy[2]).match(/permission::(\d+)/);
          return match ? match[1] : policy[2];
        })
      ),
    ];

    // Map IDs to permission names
    return uniquePermissionIds.map((permId) => {
      const permObj = permissions.find((p) => String(p.id) === String(permId));
      const permName = permObj ? permObj.name : permId;
      return (
        <span
          key={permId}
          className="inline-flex items-center px-2 py-1 mr-2 my-1 bg-white text text-base"
          title={permName}
        >
          {permName}
        </span>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">{t("allRoles")}</h2>
        {can("Role Management", "write") && (
          <button
            onClick={onAdd}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t("addRole")}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("roleName")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("permissions")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles && roles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No roles found
                </td>
              </tr>
            )}
            {roles &&
              roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getUniquePermissionNames(role, permissions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {can("Role Management", "write") ? (
                      <button
                        onClick={() => onEdit(role)}
                        className="text-teal-600 hover:text-teal-900 me-4"
                      >
                        <Edit size={18} />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="opacity-50 cursor-not-allowed me-4"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    {can("Role Management", "delete") ? (
                      <button
                        onClick={() => handleDeleteClick(role)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
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
        message={t('deleteEntityConfirm', { entity: t('role') })}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        error={deleteError}
      />
    </div>
  );
};

export default RoleManagement;



