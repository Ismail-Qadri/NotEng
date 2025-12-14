import React, { useState } from "react";
import { Grid3x3 } from "lucide-react";
import {
  Card,
  PageHeader,
  Table,
  UniversalModal,
  UniversalForm,
} from "../../../components/common";
import { useCRUD } from "../../../hooks/useCRUD";
import { ConfirmModal } from "../../../components/common";
import useLanguage from "../../../hooks/useLanguage";
import IconButton from "../../../components/common/IconButton";
import { Edit, Trash2 } from "lucide-react";

const Dimensions = ({ can }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);
  const [formError, setFormError] = useState("");

  const {
    data: dimensions,
    loading,
    create,
    update,
    remove,
  } = useCRUD("/dimensions");

  const columns = [
    {
      title: t("dimensionName"),
      dataIndex: "label",
      key: "label",
    },
    {
      title: t("columnName"),
      dataIndex: "columnName",
      key: "columnName",
    },
    {
      title: t("sqlQuery"),
      dataIndex: "valuesSql",
      key: "valuesSql",
      ellipsis: true,
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, dimension) => (
        <>
          <IconButton
            onClick={() => handleEdit(dimension)}
            disabled={!can("Dimensions Management", "write")}
            className="text-teal-600 hover:text-teal-900 me-2"
            title={t("edit")}
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(dimension)}
            disabled={!can("Dimensions Management", "delete")}
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
    setEditingDimension(null);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEdit = (dimension) => {
    setEditingDimension(dimension);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleDelete = (dimension) => {
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("dimension") }),
      onConfirm: () => remove(dimension.id),
    });
  };

  const handleSubmit = async (values) => {
    setFormError("");
    try {
      if (editingDimension) {
        await update(editingDimension.id, values);
      } else {
        await create(values);
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Error saving dimension");
    }
  };

  const formFields = [
    {
      name: "label",
      label: t("dimensionName"),
      type: "input",
      required: true,
      errorMsg: t("dimensionNameRequired"),
      placeholder: t("enterDimensionName"),
    },
    {
      name: "columnName",
      label: t("columnName"),
      type: "input",
      required: true,
      errorMsg: t("columnNameRequired"),
      placeholder: "e.g., user_id, department, region",
    },
    {
      name: "valuesSql",
      label: t("sqlQuery"),
      type: "textarea",
      required: true,
      errorMsg: t("sqlQueryRequired"),
      placeholder:
        t("sqlQueryPlaceholder") ||
        "SELECT DISTINCT column_name FROM table_name ORDER BY column_name",
      rows: 4,
    },
  ];

  const initialValues = editingDimension
    ? {
        label: editingDimension.label || "",
        columnName: editingDimension.columnName || "",
        valuesSql: editingDimension.valuesSql || "",
      }
    : {
        label: "",
        columnName: "",
        valuesSql: "",
      };

  return (
    <Card>
      <PageHeader
        title={t("allDimensions")}
        icon={<Grid3x3 size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addNewDimension")}
        canAdd={can("Dimensions Management", "write")}
      />

      <Table columns={columns} dataSource={dimensions} loading={loading} />

      <UniversalModal
        title={
          editingDimension ? t("editDimensionModal") : t("addDimensionModal")
        }
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

export default Dimensions;
