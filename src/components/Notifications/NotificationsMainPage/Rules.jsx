import React, { useState, useEffect } from "react";
import RuleModal from "../NotificationModals/RuleModal";
import { Plus, Edit, Trash2, ListChecks } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api"; // ✅ Use api instance instead of axios

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

const Rules = ({ can }) => {
  const [rules, setRules] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const { language, t } = useLanguage();
  const [metrics, setMetrics] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);

  useEffect(() => {
    // ✅ Use api instance with relative URLs
    api.get("/rules").then(res => {
      setRules(res.data);
    }).catch(err => console.error("Failed to fetch rules", err));
    
    api.get("/usecases").then(res => {
      setUseCases(res.data);
    }).catch(err => console.error("Failed to fetch use cases", err));
  }, []);

  useEffect(() => {
    if (selectedUseCaseId) {
      // ✅ Use api instance
      api.get(`/metrics/${selectedUseCaseId}`)
        .then(res => setMetrics(res.data))
        .catch(err => console.error("Failed to fetch metrics", err));
    }
  }, [selectedUseCaseId]);

  const handleSaveRule = async (newRule) => {
    try {
      if (editingRule) {
        // ✅ Use api instance for PUT
        const response = await api.put(`/rules/${editingRule.id}`, newRule);
        const updatedRule = response.data;
        setRules((prev) =>
          prev.map((r) => (r.id === editingRule.id ? updatedRule : r))
        );
        setEditingRule(null);
      } else {
        // ✅ Use api instance for POST
        const response = await api.post("/rules", newRule);
        const createdRule = response.data;
        setRules((prev) => [...prev, createdRule]);
      }
      setIsFormVisible(false);
      
      // ✅ Refresh rules list
      const res = await api.get("/rules");
      setRules(res.data);
    } catch (err) {
      console.error("Failed to save rule", err);
      alert("Failed to save rule. Please try again.");
    }
  };

  const handleEditRule = (ruleId) => {
    const ruleToEdit = rules.find((rule) => rule.id === ruleId);
    setEditingRule(ruleToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      // ✅ Use api instance for DELETE
      await api.delete(`/rules/${ruleId}`);
      setRules(rules.filter((rule) => rule.id !== ruleId));
    } catch (err) {
      console.error("Failed to delete rule", err);
      alert("Failed to delete rule. Please try again.");
    }
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

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
          <ListChecks size={20} className="me-2" /> {t("allRules")}
        </h2>
        {safeCan("Rule Management", "write") && (
          <button
            onClick={() => {
              setEditingRule(null);
              setIsFormVisible(true);
            }}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t("addNewRule")}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("ruleName")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("useCase")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("metrics")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("status")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {t("noRulesMessage")}
                </td>
              </tr>
            )}
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rule.label || rule.ruleName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getUseCaseName(rule.metric?.useCaseId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getMetricName(rule.metric?.label)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rule.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {rule.active ? t("active") : t("inactive")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {safeCan("Rule Management", "write") ? (
                    <button
                      onClick={() => handleEditRule(rule.id)}
                      className="text-teal-600 hover:text-teal-900 me-4"
                    >
                      <Edit size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                      <Edit size={18} />
                    </button>
                  )}

                  {safeCan("Rule Management", "delete") ? (
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={isFormVisible} onClose={() => setIsFormVisible(false)}>
        <RuleModal
          onSave={handleSaveRule}
          rule={editingRule}
          onCancel={() => setIsFormVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Rules;


