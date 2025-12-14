import React, { useState } from "react";
import { FileText, Edit, Trash2 } from "lucide-react";
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

const ResourceManagement = ({ can }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    data: resources,
    loading: tableLoading,
    create,
    update,
    remove,
    refresh,
  } = useCRUD("/resources");

  const columns = [
    {
      title: t("resourceId"),
      dataIndex: "id",
      key: "id",
      width: 200,
      ellipsis: true,
      sorter: (a, b) => String(a.id).localeCompare(String(b.id)),
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: t("category"),
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => (a.category || "").localeCompare(b.category || ""),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, resource) => (
        <>
          <IconButton
            onClick={() => handleEdit(resource)}
            disabled={!can("Resource Management", "write")}
            className="text-teal-600 hover:text-teal-900 me-2"
            title={t("edit")}
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(resource)}
            disabled={!can("Resource Management", "delete")}
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
    setEditingResource(null);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleDelete = (resource) => {
    // If resource has assigned roles, prevent deletion
    if (resource.roles && resource.roles.length > 0) {
      ConfirmModal({
        title: t("cannotDeleteResource"),
        content: t("resourceHasRoles"),
        okText: t("ok"),
        cancelText: t("cancel"),
        // cancelButtonProps: { style: { display: 'none' } },
      });
      return;
    }

    // Otherwise, allow deletion
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("resource") }),
      content: `Are you sure you want to delete resource "${resource.name}"?`,
      okText: t("confirm"),
      cancelText: t("cancel"),
      onConfirm: () => remove(resource.id),
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setFormError("");
    try {
      if (editingResource) {
        await update(editingResource.id, values);
      } else {
        await create(values);
      }
      setIsModalOpen(false);
      await refresh();
    } catch (error) {
      setFormError("Error saving resource");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "name",
      label: t("name"),
      placeholder: t("resourceNamePlaceholder"),
      required: true,
      errorMsg: "Please enter resource name",
      type: "input",
    },
    {
      name: "category",
      label: t("category"),
      placeholder: t("categoryPlaceholder"),
      required: true,
      errorMsg: "Please enter category",
      type: "input",
    },
    {
      name: "description",
      label: t("description"),
      placeholder: t("descriptionPlaceholder"),
      type: "textarea",
    },
  ];

  const initialValues = editingResource
    ? {
        name: editingResource.name || "",
        category: editingResource.category || "",
        description: editingResource.description || "",
      }
    : {};

  return (
    <Card>
      <PageHeader
        title={t("allResources")}
        icon={<FileText size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addResource")}
        canAdd={can("Resource Management", "write")}
      />

      <Table columns={columns} dataSource={resources} loading={tableLoading} />

      <UniversalModal
        title={editingResource ? t("editResourceModal") : t("addResourceModal")}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <UniversalForm
          fields={formFields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          submitText={t("save")}
          cancelText={t("cancel")}
          loading={loading}
          error={formError}
        />
      </UniversalModal>
    </Card>
  );
};

export default ResourceManagement;
