
import React, { useState, useEffect } from 'react';
import { X, Eye, Pencil, Trash2 } from 'lucide-react';
import useLanguage from '../../../hooks/useLanguage';
import api from '../../../api';

// Map permission IDs to icons
const permissionIconsById = {
  1: Eye,
  2: Pencil,
  3: Trash2,
};

// Map permission IDs to names
const permissionNamesById = {
  1: "read",
  2: "write",
  3: "delete",
};

const RoleModal = ({ resources, permissions, role, onClose, onSave, can, refreshPermissions }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selected, setSelected] = useState({});
  const isNewRole = !role || !role.id;

  // Fetch role data from API
  useEffect(() => {
    const fetchRole = async () => {
      if (role) {
        try {
          const res = await api.get(`/roles/${role.id}`);
          const roleData = res.data;
          setFormData({
            name: roleData.name || '',
            description: roleData.description || '',
          });

          // Build initial selected permissions from API response
          const initial = {};
          if (roleData.resources) {
            roleData.resources.forEach(({ resource_id, permissions: permIds }) => {
              const resource = resources.find(r => r.id.toString() === resource_id);
              if (resource) {
                initial[resource.name] = permIds
                  .map(id => permissionNamesById[parseInt(id, 10)])
                  .filter(Boolean);
              }
            });
          }
          setSelected(initial);
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      }
    };

    fetchRole();
  }, [role, resources]);

  // Toggle permission
  const handleToggle = (resource, permission) => {
    const resourceName = resource.name;
    const permissionName = permission.name;

    setSelected(prev => {
      const already = prev[resourceName]?.includes(permissionName);
      let newSelected = { ...prev };
      if (already) {
        newSelected[resourceName] = newSelected[resourceName].filter(p => p !== permissionName);
      } else {
        newSelected[resourceName] = [...(newSelected[resourceName] || []), permissionName];
      }
      if (newSelected[resourceName].length === 0) {
        delete newSelected[resourceName];
      }
      return newSelected;
    });
  };

  // Group resources by category
  const groupedResources = resources.reduce((acc, resource) => {
    const cat = resource.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(resource);
    return acc;
  }, {});

  // Save role details and permissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      const updatedPermissions = {};
      for (const resource of resources) {
        const perms = selected[resource.name] || [];
        const permIds = perms
          .map(permName => {
            const permObj = permissions.find(p => p.name === permName);
            return permObj?.id;
          })
          .filter(Boolean);
        if (permIds.length > 0) {
          updatedPermissions[resource.id] = permIds.map(String);
        }
      }

      if (role && role.id) {
        // Update role details
        res = await api.put(`/roles/${role.id}`, {
          name: formData.name,
          description: formData.description,
        });

        // Send updated permissions per resource
        for (const resource of resources) {
          const perms = selected[resource.name] || [];
          const permIds = perms
            .map(permName => {
              const permObj = permissions.find(p => p.name === permName);
              return permObj?.id;
            })
            .filter(Boolean);

          await api.post(
            `/associations/roles/${role.id}/permissions`,
            {
              resourceId: String(resource.id),
              permissionIds: permIds.map(String),
            }
          );
        }
      } else {
        // Create new role
        res = await api.post(`/roles`, {
          name: formData.name,
          description: formData.description,
        });
        const newRoleId = res.data.id;

        for (const resource of resources) {
          const perms = selected[resource.name] || [];
          const permIds = perms
            .map(permName => {
              const permObj = permissions.find(p => p.name === permName);
              return permObj?.id;
            })
            .filter(Boolean);

          if (permIds.length > 0) {
            await api.post(
              `/associations/roles/${newRoleId}/permissions`,
              {
                resourceId: String(resource.id),
                permissionIds: permIds.map(String),
              }
            );
          }
        }
      }

      // Update localStorage with new permissions
      localStorage.setItem('userPermissions', JSON.stringify(updatedPermissions));

      // Trigger Casbin refresh
      if (typeof refreshPermissions === 'function') {
        await refreshPermissions();
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Save role failed:", err.response?.data || err.message);
      alert('Error saving role: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 mt-10 transform transition-transform scale-100 max-h-[75vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {role ? t('editRoleModal') : t('addRoleModal')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          {/* Name */}
          <div className="mb-6">
            <label className="block text-gray-800 font-bold mb-2" htmlFor="name">
              {t('roleName')}
            </label>
            <input
              type="text"
              id="name"
              placeholder={t('roleNamePlaceholder') || 'Enter role name'}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-gray-800 font-bold mb-2" htmlFor="description">
              {t('description')}
            </label>
            <input
              type="text"
              id="description"
              placeholder={t('descriptionPlaceholder') || 'Enter role description'}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="block text-gray-800 font-bold mb-2">{t('permissionsLabel')}</label>
            <div className="flex flex-col gap-4 mt-2">
              {Object.entries(groupedResources).map(([category, resArr]) => (
                <div key={category}>
                  <div className="font-bold text-base text-gray-600 mb-2">{category}</div>
                  {resArr.map(resource => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between gap-2 mb-2 px-4 py-2 border rounded-lg hover:shadow-sm transition-shadow duration-200 bg-white"
                    >
                      <span className="text-gray-700">{resource.name}</span>
                      <div className="flex items-center gap-2">
                        {permissions.map(permission => {
                          const Icon = permissionIconsById[permission.id] || Eye;
                          const isActive = selected[resource.name]?.includes(permission.name);
                          return (
                            <button
                              key={permission.id}
                              type="button"
                              onClick={() => handleToggle(resource, permission)}
                              className={`inline-flex items-center px-3 py-1 rounded-full border transition-colors duration-200
                                ${isActive
                                  ? 'bg-[#376f57] font-bold text-white'
                                  : 'bg-white text-black border-gray-300'}
                                hover:bg-[#166a45] hover:text-white`}
                              title={permission.name}
                              aria-pressed={isActive}
                            >
                              <Icon size={18} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={
                isNewRole
                  ? !can("Role Management", "write")
                  : !can("Role Management", "write")
              }
              className={`px-6 py-2 rounded-full shadow-md font-semibold transition-colors duration-200 ${
                isNewRole
                  ? can("Role Management", "write")
                    ? "bg-[#166a45] text-white hover:bg-[#104631]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : can("Role Management", "write")
                    ? "bg-[#166a45] text-white hover:bg-[#104631]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;