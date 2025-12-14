import React, { useState, useEffect } from "react";
import RuleModal from "../NotificationModals/RuleModal";
import { Plus, Edit, Trash2, ListChecks } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api";
import { Table, Button } from "../../../components/common";
import IconButton from "../../../components/common/IconButton";
import UniversalModal from "../../../components/common/UniversalModal";
import ConfirmModal from "../../../components/common/ConfirmModal";

const Rules = ({ can }) => {
  const [rules, setRules] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const { language, t } = useLanguage();
  const [metrics, setMetrics] = useState([]);
  const [useCases, setUseCases] = useState([]);
  // const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rulesRes, useCasesRes, metricsRes] = await Promise.all([
          api.get("/rules").catch(() => ({ data: [] })),
          api.get("/usecases").catch(() => ({ data: [] })),
          api.get("/metrics").catch(() => ({ data: [] })),
        ]);

        setRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
        setUseCases(Array.isArray(useCasesRes.data) ? useCasesRes.data : []);
        setMetrics(Array.isArray(metricsRes.data) ? metricsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  const handleSaveRule = async (newRule) => {
    setLoading(true);
    setErrors(null);
    try {
      if (editingRule) {
        // Use api instance for PUT
        const response = await api.put(`/rules/${editingRule.id}`, newRule);
        const updatedRule = response.data;
        setRules((prev) =>
          prev.map((r) => (r.id === editingRule.id ? updatedRule : r))
        );
        setEditingRule(null);
      } else {
        // Use api instance for POST
        const response = await api.post("/rules", newRule);
        const createdRule = response.data;
        setRules((prev) => [...prev, createdRule]);
      }
      setIsFormVisible(false);

      // Refresh rules list
      const res = await api.get("/rules");
      setRules(res.data);
    } catch (err) {
      console.error("Failed to save rule", err);
      // alert("Failed to save rule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRule = (ruleId) => {
    const ruleToEdit = rules.find((rule) => rule.id === ruleId);
    setEditingRule(ruleToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteRule = (ruleId) => {
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("rule") }),
      content:
        t("confirmDeleteRule") || "Are you sure you want to delete this rule?",
      okText: t("confirm"),
      cancelText: t("cancel"),
      onConfirm: async () => {
        try {
          await api.delete(`/rules/${ruleId}`);
          setRules(rules.filter((rule) => rule.id !== ruleId));
        } catch (err) {
          console.error("Failed to delete rule", err);
          // alert("Failed to delete rule. Please try again.");
        }
      },
    });
  };

  const getUseCaseName = (id) => {
    const found = useCases.find((uc) => uc.id === id);
    return found ? found.label : id;
  };

  const getMetricName = (id) => {
    const found = metrics.find((metric) => metric.id === id);
    return found ? found.name : id;
  };

  // Add safety check
  const safeCan = typeof can === "function" ? can : () => false;

  // Table columns for rules
  const columns = [
    {
      title: t("ruleName"),
      dataIndex: "label",
      key: "label",
      render: (text, record) => text || record.ruleName,
    },
    {
      title: t("useCase"),
      dataIndex: ["metric", "useCaseId"],
      key: "useCase",
      render: (useCaseId) => getUseCaseName(useCaseId),
    },
    {
      title: t("metrics"),
      dataIndex: ["metric", "label"],
      key: "metrics",
      render: (metricLabel) => getMetricName(metricLabel),
    },
    {
      title: t("status"),
      dataIndex: "active",
      key: "status",
      render: (active) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          {active ? t("active") : t("inactive")}
        </span>
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, rule) => (
        <>
          <IconButton
            onClick={() => handleEditRule(rule.id)}
            disabled={!safeCan("Rule Management", "write")}
            className="text-teal-600 hover:text-teal-900 me-4"
            title={t("edit")}
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteRule(rule.id)}
            disabled={!safeCan("Rule Management", "delete")}
            className="text-red-600 hover:text-red-900"
            title={t("delete")}
          >
            <Trash2 size={18} />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
          <ListChecks size={20} className="me-2" /> {t("allRules")}
        </h2>
        {safeCan("Rule Management", "write") && (
          <Button
            onClick={() => {
              setEditingRule(null);
              setIsFormVisible(true);
            }}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t("addNewRule")}
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          pagination={false}
        />
      </div>

      <UniversalModal
        title={editingRule ? t("editRuleModal") : t("addRuleModal")}
        isOpen={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        size="large"
      >
        <RuleModal
          onSave={handleSaveRule}
          rule={editingRule}
          onCancel={() => setIsFormVisible(false)}
          loading={loading}
          errors={errors}
          // ...other props if needed
        />
      </UniversalModal>
    </div>
  );
};

export default Rules;
