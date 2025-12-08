import React , { useState} from "react";
import { Plus, Edit, Trash2 } from 'lucide-react';
import useLanguage from '../../../hooks/useLanguage';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import api from "../../../api";

const ResourceManagement = ({ resources = [], onEdit, onAdd, onDelete, can }) => {
    const { language, t } = useLanguage();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    const handleDeleteClick = (resource) => {
      setResourceToDelete(resource);
      setDeleteError("");
      setConfirmOpen(true);
    };

    // Use api instance for delete if onDelete is not provided
    const handleConfirmDelete = async () => {
      setDeleteError("");
      if (!resourceToDelete) return;
      try {
        if (onDelete) {
          await onDelete(resourceToDelete.id);
        } else {
          await api.delete(`/resources/${resourceToDelete.id}`); 
        }
        setConfirmOpen(false);
        setResourceToDelete(null);
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
      setResourceToDelete(null);
      setDeleteError("");
    };

   return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">{t('allResources')}</h2>
                {can("Resource Management", "write") && (
                  <button onClick={onAdd} className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full">
                    <Plus size={16} className="me-2" /> {t('addResource')}
                  </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('resourceId')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {resources.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No resources found</td></tr>
                        )}
                        {resources.map((p) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {can("Resource Management", "write") ? (
                                    <button onClick={() => onEdit(p)} className="text-teal-600 hover:text-teal-900 me-4">
                                      <Edit size={18} />
                                    </button>
                                  ) : (
                                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                                      <Edit size={18} />
                                    </button>
                                  )}

                                  {can("Resource Management", "delete") ? (
                                    <button onClick={() => handleDeleteClick(p)} className="text-red-600 hover:text-red-900">
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
              message={t('deleteEntityConfirm', { entity: t('resource') })}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
              error={deleteError}
            />
        </div>
    );
};

export default React.memo(ResourceManagement);