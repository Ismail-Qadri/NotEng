import React, { useState } from "react";
import { X } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api";

const GroupModal = ({ roles, onClose, onSave, group, can }) => {
  const { language, t } = useLanguage();

  const isNewGroup = !group || !group.id;

  const [formData, setFormData] = useState(() => {
    if (group) {
      const selectedRoleIds =
        group.roles && group.roles.length > 0
          ? group.roles.map((role) => role.id)
          : [];
      return {
        name: group.name || "",
        description: group.description || "",
        selectedRoleIds,
      };
    }
    return {
      name: "",
      description: "",
      selectedRoleIds: [],
    };
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "roleId") {
      const roleId = parseInt(value, 10);
      setFormData((prev) => {
        const updatedRoleIds = checked
          ? [...prev.selectedRoleIds, roleId]
          : prev.selectedRoleIds.filter((id) => id !== roleId);
        return { ...prev, selectedRoleIds: updatedRoleIds };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const groupData = {
    name: formData.name,
    description: formData.description || "",
  };

  try {
    let res;
    let groupId;

    if (group && group.id) {
      // Update existing group
      res = await api.put(`/groups/${group.id}`, groupData);
      groupId = group.id;
    } else {
      // Create new group
      res = await api.post(`/groups`, groupData);
      groupId = res.data?.id;
    }

    if (!groupId) throw new Error("Group ID missing from API response");

    //update all roles in one request
    await api.put(`/associations/groups/${groupId}/roles`, {
      roleIds: formData.selectedRoleIds,
    });

    onSave(res.data);
  } catch (err) {
    console.error("Error saving group:", err.response || err);
    alert(
      "Error saving group: " + (err.response?.data?.message || err.message)
    );
  }
};


  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="name"
          >
            {t("groupName")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder={t("groupNamePlaceholder") || "Enter group name"}
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-200 ${
              language === "ar" ? "text-right" : ""
            }`}
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="description"
          >
            {t("description")}
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-200 ${
              language === "ar" ? "text-right" : ""
            }`}
            placeholder={
              t("descriptionPlaceholder") || "Enter group description"
            }
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            {t("assignedRole")}
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center hover:bg-gray-100 p-1 rounded"
              >
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  name="roleId"
                  value={role.id}
                  checked={
                    Array.isArray(formData.selectedRoleIds) &&
                    formData.selectedRoleIds.includes(role.id)
                  }
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-[#166a45] focus:ring-[#166a45] border-gray-300 rounded"
                />
                <label
                  htmlFor={`role-${role.id}`}
                  className="text-sm text-gray-700 cursor-pointer flex-1 select-none"
                >
                  {role.name}
                </label>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formData.selectedRoleIds.length === 0
              ? t("noRolesSelected") || "No roles selected"
              : `${formData.selectedRoleIds.length} (${t("rolesSelected")})`}
          </p>
        </div>

        <div className="mb-6"></div>

        <div
          className={`flex justify-end space-x-4 ${
            language === "ar" ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={!can || !can("Group Management", "write")}
            className={`px-6 py-2 rounded-full shadow-md font-semibold transition-colors duration-200 ${
              can && can("Group Management", "write")
                ? "bg-[#166a45] text-white hover:bg-[#104631]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupModal;
