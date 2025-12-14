import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
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
import api from "../../../api";

const MetricsModal = ({ can }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [useCases, setUseCases] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    data: metrics,
    loading: tableLoading,
    create,
    update,
    remove,
    refresh,
  } = useCRUD("/metrics");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [useCasesRes, dimensionsRes] = await Promise.all([
          api.get("/usecases"),
          api.get("/dimensions"),
        ]);
        setUseCases(Array.isArray(useCasesRes.data) ? useCasesRes.data : []);
        setDimensions(
          Array.isArray(dimensionsRes.data) ? dimensionsRes.data : []
        );
      } catch (error) {
        // console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: t("metricName"),
      dataIndex: "label",
      key: "label",
    },
    {
      title: t("useCase"),
      dataIndex: "useCaseId",
      key: "useCaseId",
      render: (useCaseId) => {
        const useCase = useCases.find((uc) => uc.id === useCaseId);
        return useCase?.label || "-";
      },
    },
    {
      title: t("dimension"),
      dataIndex: "dimensionId",
      key: "dimensionId",
      render: (dimensionId) => {
        const dimension = dimensions.find((d) => d.id === dimensionId);
        return dimension?.label || "-";
      },
    },
  ];

  const handleAdd = () => {
    setEditingMetric(null);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleDelete = (metric) => {
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("metric") }),
      onConfirm: async () => {
        await remove(metric.id);
        await refresh();
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setFormError("");
    try {
      const payload = {
        ...values,
        useCaseId: values.useCaseId ? Number(values.useCaseId) : null,
        dimensionId: values.dimensionId ? Number(values.dimensionId) : null,
      };
      if (editingMetric) {
        await update(editingMetric.id, payload);
      } else {
        await create(payload);
      }
      await refresh();
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Error saving metric");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "label",
      label: t("metricName"),
      type: "input",
      required: true,
      errorMsg: t("metricNameRequired"),
      placeholder: t("addEnterMetricName"),
    },
    {
      name: "executeSqlMain",
      label: `${t("Sql")} (${t("main")})`,
      type: "textarea",
      required: true,
      errorMsg: t("sqlQueryRequired"),
      placeholder: "SELECT COUNT(*) FROM table WHERE condition",
      rows: 4,
    },
    {
      name: "conditionalSql",
      label: `${t("Sql")} (${t("optional")})`,
      type: "textarea",
      placeholder: t("optionalConditionalSqlQuery"),
      rows: 4,
    },
    {
      name: "useCaseId",
      label: t("useCase"),
      type: "select",
      required: true,
      errorMsg: t("useCaseRequired"),
      options: useCases.map((uc) => ({ label: uc.label, value: uc.id })),
      placeholder: t("selectUseCase"),
    },
    {
      name: "dimensionId",
      label: t("dimension"),
      type: "select",
      required: true,
      errorMsg: t("dimensionRequired"),
      options: dimensions.map((d) => ({ label: d.label, value: d.id })),
      placeholder: t("selectDimension"),
    },
  ];

  const initialValues = editingMetric
    ? {
        label: editingMetric.label || "",
        executeSqlMain: editingMetric.executeSqlMain || "",
        conditionalSql: editingMetric.conditionalSql || "",
        useCaseId: editingMetric.useCaseId || "",
        dimensionId: editingMetric.dimensionId || "",
      }
    : {
        label: "",
        executeSqlMain: "",
        conditionalSql: "",
        useCaseId: "",
        dimensionId: "",
      };

  return (
    <Card>
      <PageHeader
        title={t("allMetrics")}
        icon={<BarChart3 size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addNewMetric")}
        canAdd={can("Metric Management", "write")}
      />

      <Table
        columns={columns}
        dataSource={metrics}
        loading={tableLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={can("Metric Management", "write")}
        canDelete={can("Metric Management", "delete")}
      />

      <UniversalModal
        title={editingMetric ? t("editMetricModal") : t("addMetricModal")}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width={800}
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

export default MetricsModal;
