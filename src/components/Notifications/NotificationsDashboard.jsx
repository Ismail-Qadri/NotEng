import React, { useState, useEffect } from "react";
import NotificationForm from "./NotificationModals/NotificationsUserModal";
import Navbar from "../Navbar";
import { Bell, Trash2, Edit } from "lucide-react";
import useLanguage from "../../hooks/useLanguage";
import axios from "axios";

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

const NotificationsDashboard = () => {
  const [rules, setRules] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const { language, t } = useLanguage();
  const [metrics, setMetrics] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);

  // Fetch rules from json-server on mount
  useEffect(() => {
    axios.get("https://dev-api.wedo.solutions:3000/api/rules").then((res) => setRules(res.data));
    axios.get("https://dev-api.wedo.solutions:3000/api/useCases").then((res) => setUseCases(res.data));
    // axios.get("https://dev-api.wedo.solutions:3000/api/availableCategories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (selectedUseCaseId) {
      axios.get(`https://dev-api.wedo.solutions:3000/api/metrics/${selectedUseCaseId}`)
        .then(res => setMetrics(res.data))
        .catch(err => console.error("Failed to fetch metrics", err));
    }
  }, [selectedUseCaseId]);

  const handleSaveRule = async (newRule) => {
    if (editingRule) {
      // Edit mode: update existing rule
      const response = await axios.put(
        `https://dev-api.wedo.solutions:3000/api/rules/${editingRule.id}`,
        newRule
      );
      const updatedRule = response.data;
      setRules((prev) =>
        prev.map((r) => (r.id === editingRule.id ? updatedRule : r))
      ); // <-- Optimistic update
      setEditingRule(null);
    } else {
      // Add mode: create new rule
      const response = await axios.post(
        "https://dev-api.wedo.solutions:3000/api/rules",
        newRule
      );
      const createdRule = response.data;
      setRules((prev) => [...prev, createdRule]); // <-- Optimistic update
    }
    setIsFormVisible(false);
  };

  const handleEditRule = (ruleId) => {
    const ruleToEdit = rules.find((rule) => rule.id === ruleId);
    setEditingRule(ruleToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteRule = async (ruleId) => {
    await axios.delete(`https://dev-api.wedo.solutions:3000/api/rules/${ruleId}`);
    setRules(rules.filter((rule) => rule.id !== ruleId));
  };



  const getUseCaseName = (id) => {
    const found = useCases.find((uc) => uc.id === id);
    return found ? found.name : id;
  };

  const getCategoryName = (id) => {
    const found = categories.find((cat) => cat.id === id);
    return found ? found.name : id;
  };

  return (
    <>
      <Navbar />
      <div className="relative z-10">
        <div
          className="bg-gray-100 p-8 pb-12 font-sans antialiased m-36 rounded-2xl shadow-xl"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <div className="max-w-6xl mx-auto mt-4">
            <header className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Bell className="me-2" size={28} /> {t("notificationsRules")}
                </h1>
              </div>
              <div className="flex">
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setIsFormVisible(true);
                  }}
                  className="px-6 py-2 bg-[#166a45] text-white rounded-full font-semibold shadow hover:bg-[#104631] transition-colors duration-200"
                >
                  {t("addNewRule")}
                </button>
              </div>
            </header>
          </div>

          {rules.length === 0 ? (
            <p className="text-gray-500">{t("noRulesMessage")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule Name
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Use Case
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metrics
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rule.ruleName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getUseCaseName(rule.useCase)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryName(rule.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            rule.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditRule(rule.id)}
                          className="text-teal-600 hover:text-teal-900 me-4"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  
                  ))}
                    </tbody>
              </table>
            </div>
          )}

          <Modal open={isFormVisible} onClose={() => setIsFormVisible(false)}>
            <NotificationForm
              onSave={handleSaveRule}
              rule={editingRule}
              onCancel={() => setIsFormVisible(false)}
            />
          </Modal>
        </div>
      </div>
    </>
  );
};

export default NotificationsDashboard;
