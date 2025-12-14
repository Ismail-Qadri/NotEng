import React, { useState, useMemo } from "react";
import { Tag } from "antd";
import { User, Users, Edit, Trash2 } from "lucide-react";
import {
  Card,
  PageHeader,
  Table,
  SearchInput,
  IconButton,
} from "../../../components/common";
import { useCRUD } from "../../../hooks/useCRUD";
import { ConfirmModal } from "../../../components/common";
import useLanguage from "../../../hooks/useLanguage";
import UserModal from "../Modals/UserModal";
import UniversalModal from "../../../components/common/UniversalModal";

const UserManagement = ({ groups, roles, can }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const {
    data: users,
    loading: tableLoading,
    create,
    update,
    remove,
    refresh,
  } = useCRUD("/users");

  // Compute roles for each user from their groups
  const usersWithRoles = useMemo(() => {
    if (!users || !groups || !roles) return users || [];

    return users.map((user) => {
      if (!user.groups || user.groups.length === 0) {
        return { ...user, roles: [] };
      }

      const roleIds = new Set();

      user.groups.forEach((userGroup) => {
        const group = groups.find((g) => g.id === userGroup.id);
        if (group) {
          // If group has roleIds array
          if (Array.isArray(group.roleIds)) {
            group.roleIds.forEach((roleId) => roleIds.add(roleId));
          }
          // If group has roles array
          if (Array.isArray(group.roles)) {
            group.roles.forEach((role) => roleIds.add(role.id));
          }
        }
      });

      const userRoles = Array.from(roleIds)
        .map((roleId) => roles.find((r) => r.id === roleId))
        .filter(Boolean);

      return { ...user, roles: userRoles };
    });
  }, [users, groups, roles]);

  const columns = [
    {
      title: t("nationalId"),
      dataIndex: "nafath_id",
      key: "nafath_id",
      width: 150,
      sorter: (a, b) => String(a.nafath_id).localeCompare(String(b.nafath_id)),
    },
    {
      title: t("groupsLabel"),
      dataIndex: "groups",
      key: "groups",
      sorter: (a, b) =>
        (a.groups?.[0]?.name || "").localeCompare(b.groups?.[0]?.name || ""),
      render: (groups) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Users size={16} className="text-gray-500" />
          {groups && groups.length > 0 ? (
            groups.map((g) => <Tag key={g.id}>{g.name}</Tag>)
          ) : (
            <span className="text-gray-400">{t("noGroups")}</span>
          )}
        </div>
      ),
    },
    {
      title: t("rolesLabel"),
      dataIndex: "roles",
      key: "roles",
      sorter: (a, b) =>
        (a.roles?.[0]?.name || "").localeCompare(b.roles?.[0]?.name || ""),
      render: (roles) => (
        <div className="flex flex-wrap gap-1">
          {roles && roles.length > 0 ? (
            roles.map((role, idx) => (
              <Tag key={idx} color="cyan">
                {role.name}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">{t("noRoles")}</span>
          )}
        </div>
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, user) => (
        <div className="flex items-center gap-2">
          <IconButton
            onClick={() => handleEdit(user)}
            disabled={!can("User Management", "write")}
            className="text-teal-600 hover:text-teal-900"
            title={t("edit")}
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(user)}
            disabled={!can("User Management", "delete")}
            className="text-red-600 hover:text-red-900"
            title={t("delete")}
          >
            <Trash2 size={18} />
          </IconButton>
        </div>
      ),
    },
  ];

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return usersWithRoles;
    return usersWithRoles.filter(
      (user) =>
        user.nafath_id?.toString().includes(search) ||
        user.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [usersWithRoles, search]);

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    // Check if user has groups or roles
    const hasGroups = user.groups && user.groups.length > 0;
    const hasRoles = user.roles && user.roles.length > 0;

    if (hasGroups || hasRoles) {
      ConfirmModal({
        title: t("cannotDeleteUser"),
        content: (
          <div>
            <p>{t("userHasGroupsRoles")}</p>
          </div>
        ),
        okText: t("ok"),
        cancelText: t("cancel"),
      });
      return;
    }

    // If user has no groups or roles, proceed with delete
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("user") }),
      content: `${
        t("confirmDeleteUser")
      } ${user.nafath_id}?`,
      okText: t("confirm"),
      cancelText: t("cancel"),
      onConfirm: async () => {
        await remove(user.id);
        await refresh();
      },
    });
  };

  return (
    <Card>
      <PageHeader
        title={t("allUsers")}
        icon={<User size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addUser")}
        canAdd={can("User Management", "write")}
        extra={
          <SearchInput
            placeholder={t("searchUsers")}
            value={search}
            onChange={(e) => setSearch(e.target.value.replace(/\D/g, ""))}
          />
        }
      />

      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={tableLoading}
      />

      {isModalOpen && (
        <UniversalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUser ? t("editUserModal") : t("addUserModal")}
          maxWidth="max-w-2xl"
          maxHeight="max-h-[75vh]"
        >
          <UserModal
            groups={groups}
            roles={roles}
            onClose={() => setIsModalOpen(false)}
            onSave={async () => {
              await refresh();
              setIsModalOpen(false);
            }}
            user={editingUser}
            can={can}
          />
        </UniversalModal>
      )}
    </Card>
  );
};

export default UserManagement;
