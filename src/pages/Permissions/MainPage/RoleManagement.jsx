import React, { useState } from "react";
import { Tag } from "antd";
import { Shield } from "lucide-react";
import {
  Card,
  PageHeader,
  Table,
  UniversalForm,
  UniversalModal,
} from "../../../components/common";
import { useCRUD } from "../../../hooks/useCRUD";
import { ConfirmModal } from "../../../components/common";
import useLanguage from "../../../hooks/useLanguage";
import RoleModal from "../Modals/RoleModal";

const RoleManagement = ({
  permissions,
  can,
  resources,
  groups,
  refreshGroups,
}) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    data: roles,
    loading: tableLoading,
    create,
    update,
    remove,
    refresh,
  } = useCRUD("/roles");

  const columns = [
    {
      title: t("roleName"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: t("permissions"),
      dataIndex: "policies",
      key: "permissions",
      sorter: (a, b) => {
        // Sort by number of permissions (as an example)
        const aCount = a.policies ? a.policies.length : 0;
        const bCount = b.policies ? b.policies.length : 0;
        return aCount - bCount;
      },
      render: (policies) => {
        if (!policies || policies.length === 0) {
          return <span className="text-gray-400">No permissions</span>;
        }
        const uniquePermissionIds = [
          ...new Set(
            policies.map((policy) => {
              const match = String(policy[2]).match(/permission::(\d+)/);
              return match ? match[1] : policy[2];
            })
          ),
        ];
        return (
          <div className="flex flex-wrap gap-1">
            {uniquePermissionIds.map((permId) => {
              const permObj = permissions?.find(
                (p) => String(p.id) === String(permId)
              );
              const permName = permObj ? permObj.name : permId;
              return (
                <Tag key={permId} color="cyan">
                  {permName}
                </Tag>
              );
            })}
          </div>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingRole(null);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleDelete = (role) => {
    if (role.policies && role.policies.length > 0) {
      ConfirmModal({
        title: t("cannotDeleteRole"),
        content: t("roleHasPermissionsShort"),
        okText: t("ok"),
        cancelText: t("cancel"),
      });
      return;
    }

    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("role") }),
      content: `${t("confirmDeleteRole")} "${role.name}"?`,
      okText: t("confirm"),
      cancelText: t("cancel"),
      onConfirm: async () => {
        await remove(role.id);
        if (typeof refreshGroups === "function") await refreshGroups();
        await refresh();
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setFormError("");
    try {
      if (editingRole) {
        await update(editingRole.id, values);
      } else {
        await create(values);
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Error saving role");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "name",
      label: t("roleName"),
      placeholder: t("roleNamePlaceholder"),
      required: true,
      errorMsg: "Please enter role name",
      type: "input",
    },
    {
      name: "description",
      label: t("description"),
      type: "textarea",
      placeholder: t("descriptionPlaceholder"),
    },
    {
      name: "permissionIds",
      label: t("permissions"),
      type: "select",
      mode: "multiple",
      options: permissions?.map((p) => ({ label: p.name, value: p.id })) || [],
      placeholder: t("notificationsSelect"),
      required: true,
      errorMsg: "Please select at least one permission",
    },
  ];

  // Initial values for edit
  const initialValues = editingRole
    ? {
        name: editingRole.name || "",
        description: editingRole.description || "",
        permissionIds:
          editingRole.policies
            ?.map((policy) => {
              const match = String(policy[2]).match(/permission::(\d+)/);
              return match ? Number(match[1]) : null;
            })
            .filter(Boolean) || [],
      }
    : {};

  return (
    <Card>
      <PageHeader
        title={t("allRoles")}
        icon={<Shield size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addRole")}
        canAdd={can("Role Management", "write")}
      />

      <Table
        columns={columns}
        dataSource={roles}
        loading={tableLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={can("Role Management", "write")}
        canDelete={can("Role Management", "delete")}
      />

      {isModalOpen && (
        <UniversalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRole ? t("editRoleModal") : t("addRoleModal")}
          maxWidth="max-w-2xl"
          maxHeight="max-h-[75vh]"
        >
          <RoleModal
            resources={resources}
            permissions={permissions}
            role={editingRole}
            onClose={() => setIsModalOpen(false)}
            onSave={async () => {
              await refresh();
              if (typeof refreshGroups === "function") await refreshGroups();
              setIsModalOpen(false);
            }}
            can={can}
          />
        </UniversalModal>
      )}
    </Card>
  );
};

export default RoleManagement;
