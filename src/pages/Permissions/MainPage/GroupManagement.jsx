import React, { useState } from "react";
import { Tag } from "antd";
import { Users, Edit, Trash2 } from "lucide-react";
import {
  Card,
  PageHeader,
  Table,
  UniversalForm,
  UniversalModal,
  IconButton,
} from "../../../components/common";
import { useCRUD } from "../../../hooks/useCRUD";
import { ConfirmModal } from "../../../components/common";
import useLanguage from "../../../hooks/useLanguage";
import GroupModal from "../Modals/GroupModal";

const GroupManagement = ({ roles, can }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    data: groups,
    loading: tableLoading,
    create,
    update,
    remove,
    refresh,
  } = useCRUD("/groups");

  const columns = [
    {
      title: t("groupName"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: t("assignedRole"),
      dataIndex: "roles",
      key: "roles",
      sorter: (a, b) => {
        // Sort by first role name if exists, else empty string
        const aRole = a.roles?.[0]?.name || "";
        const bRole = b.roles?.[0]?.name || "";
        return aRole.localeCompare(bRole);
      },
      // render: (roles) => (
      //   <div className="flex flex-wrap gap-1">
      //     {roles?.map((role, idx) => (
      //       <Tag key={idx} color="blue">{role.name}</Tag>
      //     )) || '-'}
      //   </div>
      // ),
      render: (roles) => (
        <div className="flex flex-wrap gap-1">
          {roles?.map((role, idx) => (
            <Tag key={idx} color="blue">
              {role.name}
            </Tag>
          )) || "-"}
        </div>
      ),
    },
    {
      title: t("userCount"),
      dataIndex: "users",
      key: "users",
      sorter: (a, b) => (a.users?.length || 0) - (b.users?.length || 0),
      render: (users) => users?.length || 0,
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, group) => (
        <>
          <IconButton
            onClick={() => handleEdit(group)}
            disabled={!can("Group Management", "write")}
            className="text-teal-600 hover:text-teal-900 me-2"
            title={t("edit")}
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(group)}
            disabled={!can("Group Management", "delete")}
            className="text-red-600 hover:text-red-900"
            title={t("delete")}
          >
            <Trash2 size={18} />
          </IconButton>
        </>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleDelete = (group) => {
    // If group has assigned roles and count >= 1, prevent deletion
    if (group.roles && group.roles.length >= 1) {
      ConfirmModal({
        title: t("cannotDeleteGroup"),
        content: (
          <div>
            <p>{t("groupHasRoles")}</p>
          </div>
        ),
        okText: t("ok"),
        cancelText: t("cancel"),
      });
      return;
    }

    // Otherwise, allow deletion
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("group") }),
      content: t("confirmDeleteGroup"),
      okText: t("confirm"),
      cancelText: t("cancel"),
      onConfirm: async () => {
        await remove(group.id);
        await refresh();
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setFormError("");
    try {
      if (editingGroup) {
        await update(editingGroup.id, values);
      } else {
        await create(values);
      }
      await refresh();
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Error saving group");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "name",
      label: t("groupName"),
      placeholder: t("groupNamePlaceholder"),
      required: true,
      errorMsg: "Please enter group name",
    },
    {
      name: "description",
      label: t("description"),
      type: "textarea",
      placeholder: t("descriptionPlaceholder"),
    },
    {
      name: "roleIds",
      label: t("assignedRole"),
      type: "select",
      mode: "multiple",
      options: roles?.map((r) => ({ label: r.name, value: r.id })) || [],
      placeholder: t("notificationsSelect"),
    },
  ];

  // Initial values for edit
  const initialValues = editingGroup
    ? {
        name: editingGroup.name || "",
        description: editingGroup.description || "",
        roleIds: editingGroup.roles?.map((r) => r.id) || [],
      }
    : {};

  return (
    <Card>
      <PageHeader
        title={t("allGroups")}
        icon={<Users size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addGroup")}
        canAdd={can("Group Management", "write")}
      />

      <Table columns={columns} dataSource={groups} loading={tableLoading} />

      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? t("editGroupModal") : t("addGroupModal")}
      >
        <GroupModal
          roles={roles}
          group={editingGroup}
          onClose={() => setIsModalOpen(false)}
          onSave={async () => {
            await refresh();
            setIsModalOpen(false);
          }}
          can={can}
        />
      </UniversalModal>
    </Card>
  );
};

export default GroupManagement;
