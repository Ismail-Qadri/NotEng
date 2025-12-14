import React, { useState } from "react";
import { Tag } from "antd";
import { LayoutGrid } from "lucide-react";
import {
  Card,
  Table,
  UniversalForm,
  UniversalModal,
  PageHeader,
} from "../../../components/common";
import { useCRUD } from "../../../hooks/useCRUD";
import { ConfirmModal } from "../../../components/common";
import useLanguage from "../../../hooks/useLanguage";

const UseCasesModal = ({ can }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUseCase, setEditingUseCase] = useState(null);
  const [formError, setFormError] = useState("");
  const {
    data: useCases,
    loading,
    create,
    update,
    remove,
  } = useCRUD("/usecases");

  const columns = [
    {
      title: t("useCaseName"),
      dataIndex: "label",
      key: "label",
    },
    {
      title: t("status"),
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active ? "green" : "default"}>
          {active ? t("active") : t("inactive")}
        </Tag>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUseCase(null);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEdit = (useCase) => {
    setEditingUseCase(useCase);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleDelete = (useCase) => {
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("useCase") }),
      onConfirm: () => remove(useCase.id),
    });
  };

  const handleSubmit = async (values) => {
    setFormError("");
    try {
      const payload = {
        ...values,
        active: !!values.active,
      };
      if (editingUseCase) {
        await update(editingUseCase.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Error saving use case");
    }
  };

  const initialValues = editingUseCase
    ? {
        label: editingUseCase.label || "",
        active: editingUseCase.active ?? true,
      }
    : {
        label: "",
        active: true,
      };

  const formFields = [
    {
      name: "label",
      label: t("useCaseName"),
      type: "input",
      required: true,
      errorMsg: t("useCaseNameRequired"),
      placeholder: t("enterUseCaseName"),
    },
    {
      name: "active",
      label: t("status"),
      type: "checkbox",
      checkboxLabel: t("active"),
    },
  ];

  return (
    <Card>
      <PageHeader
        title={t("allUseCases")}
        icon={<LayoutGrid size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addNewUseCase")}
        canAdd={can("UseCase Management", "write")}
      />

      <Table
        columns={columns}
        dataSource={useCases}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={can("UseCase Management", "write")}
        canDelete={can("UseCase Management", "delete")}
      />

      <UniversalModal
        title={editingUseCase ? t("editUseCaseModal") : t("addUseCaseModal")}
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

export default UseCasesModal;
