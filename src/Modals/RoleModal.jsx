// import React, { useState, useEffect } from 'react';
// import { X, Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';
// import useLanguage from '../hooks/useLanguage';
// import axios from 'axios';

// const permissionIcons = {
//   read: Eye,
//   write: Pencil,
//   delete: Trash2,
//   create: PlusCircle,
// };

// const RoleModal = ({ resources, permissions, role, onClose, onSave }) => {
//   const { t } = useLanguage();
//   const [formData, setFormData] = useState({ name: '', description: '' });
//   const [selected, setSelected] = useState({}); // { resourceName: [permissionName, ...] }

//   useEffect(() => {
//     if (role) {
//       setFormData({ name: role.name || '', description: role.description || '' });
//       // Build selected from policies
//       const initial = {};
//       (role.policies || []).forEach(([_, resourceName, permName]) => {
//         if (!initial[resourceName]) initial[resourceName] = [];
//         initial[resourceName].push(permName);
//       });
//       setSelected(initial);
//     } else {
//       setFormData({ name: '', description: '' });
//       setSelected({});
//     }
//   }, [role]);

//   // Toggle permission
//   const handleToggle = (resourceName, permissionName) => {
//     setSelected(prev => {
//       const already = prev[resourceName]?.includes(permissionName);
//       let newSelected = { ...prev };
//       if (already) {
//         newSelected[resourceName] = newSelected[resourceName].filter(p => p !== permissionName);
//       } else {
//         newSelected[resourceName] = [...(newSelected[resourceName] || []), permissionName];
//       }
//       return newSelected;
//     });
//   };

// // Group resources by category
// const groupedResources = resources.reduce((acc, resource) => {
//   const cat = resource.category || 'Other';
//   if (!acc[cat]) acc[cat] = [];
//   acc[cat].push(resource);
//   return acc;
// }, {});

//   // Save handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       let res;
//       if (role && role.id) {
//         // Update role details
//         res = await axios.put(`https://dev-api.wedo.solutions:3000/api/roles/${role.id}`, {
//           name: formData.name,
//           description: formData.description,
//         });
//         // Add current selected permissions
//         for (const resource of resources) {
//           const perms = selected[resource.name] || [];
//           for (const permName of perms) {
//             const permObj = permissions.find(p => p.name === permName);
//             if (permObj) {
//               await axios.post(`https://dev-api.wedo.solutions:3000/api/associations/roles/${role.id}/permissions`, {
//                 resourceId: resource.id,
//                 permissionId: permObj.id,
//               });
//             }
//           }
//         }
//       } else {
//         // Create new role
//         res = await axios.post(`https://dev-api.wedo.solutions:3000/api/roles`, {
//           name: formData.name,
//           description: formData.description,
//         });
//         const newRoleId = res.data.id;
//         for (const resource of resources) {
//           const perms = selected[resource.name] || [];
//           for (const permName of perms) {
//             const permObj = permissions.find(p => p.name === permName);
//             if (permObj) {
//               await axios.post(`https://dev-api.wedo.solutions:3000/api/associations/roles/${newRoleId}/permissions`, {
//                 resourceId: resource.id,
//                 permissionId: permObj.id,
//               });
//             }
//           }
//         }
//       }
//       onSave();
//       onClose();
//     } catch (err) {
//       alert('Error saving role: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 mt-10 transform transition-transform scale-100 max-h-[75vh] flex flex-col">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-2xl font-bold text-gray-800">{role ? t('editRoleModal') : t('addRoleModal')}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200"><X size={24} /></button>
//         </div>
//         <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
//           <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2" htmlFor="name">{t('roleName')}</label>
//             <input type="text" id="name" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
//           </div>
//           <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2" htmlFor="description">{t('description')}</label>
//             <input type="text" id="description" name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
//           </div>
//  <div className="mb-6">
//   <label className="block text-gray-800 font-bold mb-2">{t('permissionsLabel')}</label>
//   <div className="flex flex-col gap-4 mt-2">
//     {Object.entries(groupedResources).map(([category, resArr]) => (
//       <div key={category}>
//         <div className="font-bold text-lg text-gray-700 mb-2">{category}</div>
//         {resArr.map(resource => (
//           <div key={resource.id} className="flex items-center gap-2 mb-2">
//             <span className="font-semibold text-gray-700 min-w-[90px] text-right">{resource.name}</span>
//             {permissions.map(permission => {
//               const Icon = permissionIcons[permission.name] || Eye;
//               const isActive = selected[resource.name]?.includes(permission.name);
//               return (
//                 <button
//                   key={permission.id}
//                   type="button"
//                   onClick={() => handleToggle(resource.name, permission.name)}
//                   className={`inline-flex items-center px-3 py-1 rounded-full border transition-colors duration-200
//                     ${isActive ? 'bg-teal-50 text-teal-700 border-teal-200 font-bold' : 'bg-white text-gray-400 border-gray-300'}
//                     hover:bg-teal-200 hover:text-teal-900`}
//                   title={permission.name}
//                   aria-pressed={isActive}
//                 >
//                   <Icon size={18} className="mr-1" />
//                 </button>
//               );
//             })}
//           </div>
//         ))}
//       </div>
//     ))}
//   </div>
// </div>
//           <div className="flex justify-end space-x-4">
//             <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200">{t('cancel')}</button>
//             <button type="submit" className="px-6 py-2 bg-[#166a45] text-white font-semibold rounded-full shadow-md hover:bg-[#104631] transition-colors duration-200">{t('save')}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RoleModal;



// import React, { useState, useEffect } from 'react';
// import { X, Eye, Pencil, Trash2 } from 'lucide-react';
// import useLanguage from '../hooks/useLanguage';
// import axios from 'axios';

// // Map permission IDs to icons
// const permissionIconsById = {
//   1: Eye,     // read
//   2: Pencil,  // write
//   3: Trash2,  // delete
// };

// // Map permission IDs to permission names
// const permissionNamesById = {
//   1: "read",
//   2: "write",
//   3: "delete",
// };

// const RoleModal = ({ resources, permissions, role, onClose, onSave }) => {
//   const { t } = useLanguage();
//   const [formData, setFormData] = useState({ name: '', description: '' });
//   const [selected, setSelected] = useState({}); // { resourceName: [permissionName, ...] }

//   // Fetch role data from API
//   // Fetch role data from API
// useEffect(() => {
//   const fetchRole = async () => {
//     if (role) {
//       try {
//         const res = await axios.get(
//           `https://dev-api.wedo.solutions:3000/api/roles/${role.id}`
//         );
//         console.log("res", res.data); // ✅ this is your role object
//         // setRole(res.data); // store the role data in state
//       } catch (err) {
//         console.error("Error fetching role:", err);
//         // setRole(null);
//       }
//     } else {
//       // setRole(null);
//     }
//   };

//   fetchRole();
// }, [role]);


//   useEffect(() => {
//   if (role) {
//     setFormData({ name: role.name || '', description: role.description || '' });
//     const initial = {};
//     if (role.resources) {
//       role.resources.forEach(({ resource_id, permissions: permIds }) => {
//         // Find resource by ID
//         const resource = resources.find(r => r.id.toString() === resource_id);
//         if (resource) {
//           // Convert permission IDs ("2", "3") → names ("write", "delete")
//           initial[resource.name] = permIds
//             .map(id => permissionNamesById[parseInt(id)]) // ✅ normalize here
//             .filter(Boolean);
            
//         }
//         console.log("initial", initial[resource.name]);
//       });
//     }
//     setSelected(initial);
//   } else {
//     setFormData({ name: '', description: '' });
//     setSelected({});
//   }
// }, [role, resources]);


//   // Toggle permission
//   const handleToggle = (resourceName, permissionName) => {
//     setSelected(prev => {
//       const already = prev[resourceName]?.includes(permissionName);
//       let newSelected = { ...prev };
//       if (already) {
//         newSelected[resourceName] = newSelected[resourceName].filter(p => p !== permissionName);
//       } else {
//         newSelected[resourceName] = [...(newSelected[resourceName] || []), permissionName];
//       }
//       if (newSelected[resourceName].length === 0) {
//         delete newSelected[resourceName];
//       }
//       return newSelected;
//     });
//   };

//   // Group resources by category
//   const groupedResources = resources.reduce((acc, resource) => {
//     const cat = resource.category || 'Other';
//     if (!acc[cat]) acc[cat] = [];
//     acc[cat].push(resource);
//     return acc;
//   }, {});

//   // Save handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       let res;
//       if (role && role.id) {
//         // Update role details
//         res = await axios.put(`https://dev-api.wedo.solutions:3000/api/roles/${role.id}`, {
//           name: formData.name,
//           description: formData.description,
//         });
//         // Add current selected permissions
//         for (const resource of resources) {
//           const perms = selected[resource.name] || [];
//           for (const permName of perms) {
//             const permObj = permissions.find(p => p.name === permName);
//             if (permObj) {
//               await axios.post(`https://dev-api.wedo.solutions:3000/api/associations/roles/${role.id}/permissions`, {
//                 resourceId: resource.id,
//                 permissionId: permObj.id,
//               });
//             }
//           }
//         }
//       } else {
//         // Create new role
//         res = await axios.post(`https://dev-api.wedo.solutions:3000/api/roles`, {
//           name: formData.name,
//           description: formData.description,
//         });
//         const newRoleId = res.data.id;
//         for (const resource of resources) {
//           const perms = selected[resource.name] || [];
//           for (const permName of perms) {
//             const permObj = permissions.find(p => p.name === permName);
//             if (permObj) {
//               await axios.post(`https://dev-api.wedo.solutions:3000/api/associations/roles/${newRoleId}/permissions`, {
//                 resourceId: resource.id,
//                 permissionId: permObj.id,
//               });
//             }
//           }
//         }
//       }
//       onSave();
//       onClose();
//     } catch (err) {
//       alert('Error saving role: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 mt-10 transform transition-transform scale-100 max-h-[75vh] flex flex-col">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-2xl font-bold text-gray-800">{role ? t('editRoleModal') : t('addRoleModal')}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200"><X size={24} /></button>
//         </div>
//         <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
//           <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2" htmlFor="name">{t('roleName')}</label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={e => setFormData({ ...formData, name: e.target.value })}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>
//           <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2" htmlFor="description">{t('description')}</label>
//             <input
//               type="text"
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={e => setFormData({ ...formData, description: e.target.value })}
//               className="w-full px-4 py-2 border rounded-lg"
//             />
//           </div>
//           <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2">{t('permissionsLabel')}</label>
//             <div className="flex flex-col gap-4 mt-2">
//               {Object.entries(groupedResources).map(([category, resArr]) => (
//                 <div key={category}>
//                   <div className="font-bold text-lg text-gray-700 mb-2">{category}</div>
//                   {resArr.map(resource => (
//                     <div key={resource.id} className="flex items-center gap-2 mb-2">
//                       <span className="font-semibold text-gray-700 min-w-[90px] text-right">{resource.id}</span>
//                       {permissions.map(permission => {
//                         const Icon = permissionIconsById[permission.id] || Eye;
//                         // const isActive = selected[resource.name]?.includes(permission.name);
//                         const isActive = selected[resource.name]?.includes(permission.name);

//                         return (
//                           <button
//                             key={permission.id}
//                             type="button"
//                             onClick={() => handleToggle(resource.name, permission.name)}
//                             className={`inline-flex items-center px-3 py-1 rounded-full border transition-colors duration-200
//                               ${isActive ? 'bg-teal-50 text-teal-700 border-teal-200 font-bold' : 'bg-white text-gray-400 border-gray-300'}
//                               hover:bg-teal-200 hover:text-teal-900`}
//                             title={permission.name}
//                             aria-pressed={isActive}
//                           >
//                             <Icon size={18} className="mr-1" />
//                           </button>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>

            

//           </div>
//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
//             >
//               {t('cancel')}
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-[#166a45] text-white font-semibold rounded-full shadow-md hover:bg-[#104631] transition-colors duration-200"
//             >
//               {t('save')}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RoleModal;





// import React, { useState, useEffect } from 'react';
// import { X, Eye, Pencil, Trash2 } from 'lucide-react';
// import useLanguage from '../hooks/useLanguage';
// import axios from 'axios';

// // Map permission IDs to icons
// const permissionIconsById = {
//   1: Eye,     // read
//   2: Pencil,  // write
//   3: Trash2,  // delete
// };

// // Map permission IDs to names
// const permissionNamesById = {
//   1: "read",
//   2: "write",
//   3: "delete",
// };

// const RoleModal = ({ resources, permissions, role, onClose, onSave }) => {
//   const { t } = useLanguage();
//   const [formData, setFormData] = useState({ name: '', description: '' });
//   const [selected, setSelected] = useState({}); // { resourceName: [permissionName, ...] }

//   // Fetch role data from API
//   useEffect(() => {
//     const fetchRole = async () => {
//       if (role) {
//         try {
//           const res = await axios.get(
//             `https://dev-api.wedo.solutions:3000/api/roles/${role.id}`
//           );
//           console.log("res", res.data);

//           const roleData = res.data;
//           setFormData({
//             name: roleData.name || '',
//             description: roleData.description || '',
//           });

//           // Build initial selected permissions from API response
//           const initial = {};
//           if (roleData.resources) {
//             roleData.resources.forEach(({ resource_id, permissions: permIds }) => {
//               const resource = resources.find(r => r.id.toString() === resource_id);
//               if (resource) {
//                 initial[resource.name] = permIds
//                   .map(id => permissionNamesById[parseInt(id, 10)])
//                   .filter(Boolean);
//               }
//             });
//           }
//           setSelected(initial);
//         } catch (err) {
//           console.error("Error fetching role:", err);
//         }
//       }
//     };

//     fetchRole();
//   }, [role, resources]);

//   // Toggle permission (update state + call API)
//   // const handleToggle = async (resource, permission) => {
//   //   const resourceName = resource.name;
//   //   const permissionId = permission.id;
//   //   const permissionName = permission.name;

//   //   setSelected(prev => {
//   //     const already = prev[resourceName]?.includes(permissionName);
//   //     let newSelected = { ...prev };
//   //     if (already) {
//   //       newSelected[resourceName] = newSelected[resourceName].filter(p => p !== permissionName);
//   //     } else {
//   //       newSelected[resourceName] = [...(newSelected[resourceName] || []), permissionName];
//   //     }
//   //     if (newSelected[resourceName].length === 0) {
//   //       delete newSelected[resourceName];
//   //     }
//   //     return newSelected;
//   //   });

//   //   // Persist change to backend
//   //   try {
//   //     // await axios.patch(
//   //     //   `https://dev-api.wedo.solutions:3000/api/roles/${role.id}/resources/${resource.id}`,
//   //     await axios.put(`https://dev-api.wedo.solutions:3000/api/roles/${role.id}`, {
//   //       [resource.id]: permissionId
//   //     });
//   //   } catch (err) {
//   //     console.error("Failed to update permission:", err);
//   //   }
//   // };



//   // Toggle permission (update state + call API)
// const handleToggle = async (resource, permission) => {
//   const resourceName = resource.name;
//   const permissionId = permission.id;
//   const permissionName = permission.name;

//   setSelected(prev => {
//     const already = prev[resourceName]?.includes(permissionName);
//     let newSelected = { ...prev };
//     if (already) {
//       newSelected[resourceName] = newSelected[resourceName].filter(p => p !== permissionName);
//     } else {
//       newSelected[resourceName] = [...(newSelected[resourceName] || []), permissionName];
//     }
//     if (newSelected[resourceName].length === 0) {
//       delete newSelected[resourceName];
//     }
//     return newSelected;
//   });

//   try {
//     if (selected[resourceName]?.includes(permissionName)) {
//       // Already selected → now removing → DELETE
//       await axios.delete(
//         `https://dev-api.wedo.solutions:3000/api/associations/roles/${role.id}/permissions/${permissionId}`,
//         { data: { resourceId: resource.id } }
//       );
//     } else {
//       // Not selected → now adding → POST
//       await axios.post(
//         `https://dev-api.wedo.solutions:3000/api/associations/roles/${role.id}/permissions`,
//         {
//           resourceId: resource.id,
//           permissionId,
//         }
//       );
//     }
//   } catch (err) {
//     console.error("Failed to update permission:", err);
//   }
// };



//   // Group resources by category
//   const groupedResources = resources.reduce((acc, resource) => {
//     const cat = resource.category || 'Other';
//     if (!acc[cat]) acc[cat] = [];
//     acc[cat].push(resource);
//     return acc;
//   }, {});

//   // Save role details (name, description)
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     if (role && role.id) {
//   //       await axios.put(`https://dev-api.wedo.solutions:3000/api/roles/${role.id}`, {
//   //         name: formData.name,
//   //         description: formData.description,
//   //       });
//   //     } else {
//   //       await axios.post(`https://dev-api.wedo.solutions:3000/api/roles`, {
//   //         name: formData.name,
//   //         description: formData.description,
//   //       });
//   //     }
//   //     onSave();
//   //     onClose();
//   //   } catch (err) {
//   //     alert('Error saving role: ' + (err.response?.data?.message || err.message));
//   //   }
//   // };

//   // Save handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       let res;
//       if (role && role.id) {
//         // Update role details
//         res = await axios.put(`https://dev-api.wedo.solutions:3000/api/roles/${role.id}`, {
//           name: formData.name,
//           description: formData.description,
//         });
//         // Add current selected permissions
//         for (const resource of resources) {
//           const perms = selected[resource.name] || [];
//           for (const permName of perms) {
//             const permObj = permissions.find(p => p.name === permName);
//             if (permObj) {
//               await axios.post(`https://dev-api.wedo.solutions:3000/api/associations/roles/${role.id}/permissions`, {
//                 resourceId: resource.id,
//                 permissionId: permObj.id,
//               });
//             }
//           }
//         }
//       } else {
//         // Create new role
//         res = await axios.post(`https://dev-api.wedo.solutions:3000/api/roles`, {
//           name: formData.name,
//           description: formData.description,
//         });
//         const newRoleId = res.data.id;
//         for (const resource of resources) {
//           const perms = selected[resource.name] || [];
//           for (const permName of perms) {
//             const permObj = permissions.find(p => p.name === permName);
//             if (permObj) {
//               await axios.post(`https://dev-api.wedo.solutions:3000/api/associations/roles/${newRoleId}/permissions`, {
//                 resourceId: resource.id,
//                 permissionId: permObj.id,
//               });
//             }
//           }
//         }
//       }
//       onSave();
//       onClose();
//     } catch (err) {
//       alert('Error saving role: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 mt-10 transform transition-transform scale-100 max-h-[75vh] flex flex-col">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-2xl font-bold text-gray-800">
//             {role ? t('editRoleModal') : t('addRoleModal')}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
//           {/* Name */}
//           <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2" htmlFor="name">
//               {t('roleName')}
//             </label>
//             <input
//               type="text"
//               id="name"
//               value={formData.name}
//               onChange={e => setFormData({ ...formData, name: e.target.value })}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           {/* Description */}
//           <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2" htmlFor="description">
//               {t('description')}
//             </label>
//             <input
//               type="text"
//               id="description"
//               value={formData.description}
//               onChange={e => setFormData({ ...formData, description: e.target.value })}
//               className="w-full px-4 py-2 border rounded-lg"
//             />
//           </div>

//           {/* Permissions */}
//           {/* <div className="mb-6">
//             <label className="block text-gray-800 font-bold mb-2">{t('permissionsLabel')}</label>
//             <div className="flex flex-col gap-4 mt-2">
//               {Object.entries(groupedResources).map(([category, resArr]) => (
//                 <div key={category}>
//                   <div className="font-bold text-lg text-gray-700 mb-2">{category}</div>
//                   {resArr.map(resource => (
//                     <div key={resource.id} className="flex items-center gap-2 mb-2">
//                       <span className="font-semibold text-gray-700 min-w-[90px] text-right">
//                         {resource.name}
//                       </span>
//                       {permissions.map(permission => {
//                         const Icon = permissionIconsById[permission.id] || Eye;
//                         const isActive = selected[resource.name]?.includes(permission.name);
//                         return (
//                           <button
//                             key={permission.id}
//                             type="button"
//                             onClick={() => handleToggle(resource, permission)}
//                             className={`inline-flex items-center px-3 py-1 rounded-full border transition-colors duration-200
//                               ${isActive
//                                 ? 'bg-teal-50 text-teal-700 border-teal-200 font-bold'
//                                 : 'bg-white text-gray-400 border-gray-300'}
//                               hover:bg-teal-200 hover:text-teal-900`}
//                             title={permission.name}
//                             aria-pressed={isActive}
//                           >
//                             <Icon size={18} className="mr-1" />
//                           </button>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div> */}

//           <div className="mb-6">
//   <label className="block text-gray-800 font-bold mb-2">{t('permissionsLabel')}</label>
//   <div className="flex flex-col gap-4 mt-2">
//     {Object.entries(groupedResources).map(([category, resArr]) => (
//       <div key={category}>
//         <div className="font-bold text-base text-gray-600 mb-2">{category}</div>
//         {resArr.map(resource => (
//           <div
//             key={resource.id}
//             className="flex items-center justify-between gap-2 mb-2 px-4 py-2 border rounded-lg hover:shadow-sm transition-shadow duration-200 bg-white"
//           >
//             {/* Resource Name Left */}
//             <span className=" text-gray-700">{resource.name}</span>

//             {/* Permissions Right */}
//             <div className="flex items-center gap-2">
//               {permissions.map(permission => {
//                 const Icon = permissionIconsById[permission.id] || Eye;
//                 const isActive = selected[resource.name]?.includes(permission.name);
//                 return (
//                   <button
//                     key={permission.id}
//                     type="button"
//                     onClick={() => handleToggle(resource, permission)}
//                     className={`inline-flex items-center px-3 py-1 rounded-full border transition-colors duration-200
//                       ${isActive
//                         ? 'bg-[#376f57] font-bold text-white'
//                         : 'bg-white text-black border-gray-300'}
//                       hover:bg-[#166a45] hover:text-white`}
//                     title={permission.name}
//                     aria-pressed={isActive}
//                   >
//                     <Icon size={18} />
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>
//     ))}
//   </div>
// </div>


//           {/* Actions */}
//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
//             >
//               {t('cancel')}
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-[#166a45] text-white font-semibold rounded-full shadow-md hover:bg-[#104631] transition-colors duration-200"
//             >
//               {t('save')}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RoleModal;











import React, { useState, useEffect } from 'react';
import { X, Eye, Pencil, Trash2 } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import axios from 'axios';

// Map permission IDs to icons
const permissionIconsById = {
  1: Eye,     // read
  2: Pencil,  // write
  3: Trash2,  // delete
};

// Map permission IDs to names
const permissionNamesById = {
  1: "read",
  2: "write",
  3: "delete",
};

const RoleModal = ({ resources, permissions, role, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selected, setSelected] = useState({}); // { resourceName: [permissionName, ...] }

  // Fetch role data from API
  useEffect(() => {
    const fetchRole = async () => {
      if (role) {
        try {
          const res = await axios.get(
            `https://dev-api.wedo.solutions:3000/api/roles/${role.id}`
          );
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

  // Toggle permission (only updates state now)
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
    if (role && role.id) {
      // Update role details
      res = await axios.put(`https://dev-api.wedo.solutions:3000/api/roles/${role.id}`, {
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

        await axios.post(
          `https://dev-api.wedo.solutions:3000/api/associations/roles/${role.id}/permissions`,
          {
            resourceId: String(resource.id),          // ✅ required as string
            permissionIds: permIds.map(String),       // ✅ array of strings
          }
        );
  }
  } else {
    // Create new role
    res = await axios.post(`https://dev-api.wedo.solutions:3000/api/roles`, {
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
          await axios.post(
            `https://dev-api.wedo.solutions:3000/api/associations/roles/${newRoleId}/permissions`,
            {
              resourceId: String(resource.id),        // ✅ required as string
              permissionIds: permIds.map(String),     // ✅ array of strings
            }
          );
        }
      }
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
                      {/* Resource Name Left */}
                      <span className="text-gray-700">{resource.name}</span>

                      {/* Permissions Right */}
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
              className="px-6 py-2 bg-[#166a45] text-white font-semibold rounded-full shadow-md hover:bg-[#104631] transition-colors duration-200"
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
