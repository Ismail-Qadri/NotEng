import React, { useState, useEffect } from "react";
import MetricsModal from "../NotificationModals/MetricsModal";
import { Plus, Edit, Trash2, BarChart2 } from "lucide-react";
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

const Metrics = ({ can }) => {
  // Define safeCan
  const safeCan = typeof can === "function" ? can : () => false;

  const [metrics, setMetrics] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [useCases, setUseCases] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    // ✅ Use api instance with relative URLs
    api.get("/metrics")
      .then(res => {
        setMetrics(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch metrics", err);
      });
    
    api.get("/usecases")
      .then(res => {
        setUseCases(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch use cases", err);
      });
    
    api.get("/dimensions")
      .then(res => {
        setDimensions(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch dimensions", err);
      });
  }, []);

  const getUseCaseLabel = (id) => {
    const uc = useCases.find(u => u.id === id);
    return uc ? uc.label : id;
  };

  const getDimensionLabel = (id) => {
    const d = dimensions.find(dim => dim.id === id);
    return d ? d.label : id;
  };

  const handleSaveMetric = async (newMetric) => {
    try {
      if (editingMetric) {
        // ✅ Use api instance for PUT
        const response = await api.put(
          `/metrics/${editingMetric.id}`,
          newMetric
        );
        const updatedMetric = response.data;
        setMetrics((prev) =>
          prev.map((m) => (m.id === editingMetric.id ? updatedMetric : m))
        );
        setEditingMetric(null);
      } else {
        // ✅ Use api instance for POST
        const response = await api.post("/metrics", newMetric);
        const createdMetric = response.data;
        setMetrics((prev) => [...prev, createdMetric]);
      }
      setIsFormVisible(false);
      
      // ✅ Refresh metrics list
      const res = await api.get("/metrics");
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to save metric", err);
      alert("Failed to save metric. Please try again.");
    }
  };

  const handleEditMetric = (metricId) => {
    const metricToEdit = metrics.find((m) => m.id === metricId);
    setEditingMetric(metricToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteMetric = async (metricId) => {
    try {
      // ✅ Use api instance for DELETE
      await api.delete(`/metrics/${metricId}`);
      setMetrics(metrics.filter((m) => m.id !== metricId));
    } catch (err) {
      console.error("Failed to delete metric", err);
      alert("Failed to delete metric. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
          <BarChart2 size={20} className="me-2" /> {t("allMetrics")}
        </h2>
        {safeCan("Metrics Management", "write") && (
          <button
            onClick={() => {
              setEditingMetric(null);
              setIsFormVisible(true);
            }}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t("addNewMetric")}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("metricName")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("sqlMain")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("optionalSql")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("useCase")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("dimension")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metrics.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {t("noMetricsMessage")}
                </td>
              </tr>
            )}
            {metrics.map((m) => (
              <tr key={m.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {m.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {m.executeSqlMain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {m.conditionalSql}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getUseCaseLabel(m.useCaseId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getDimensionLabel(m.dimensionId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {safeCan("Metrics Management", "write") ? (
                    <button
                      onClick={() => handleEditMetric(m.id)}
                      className="text-teal-600 hover:text-teal-900 me-4"
                    >
                      <Edit size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                      <Edit size={18} />
                    </button>
                  )}
                  
                  {safeCan("Metrics Management", "delete") ? (
                    <button
                      onClick={() => handleDeleteMetric(m.id)}
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
        <MetricsModal
          onSave={handleSaveMetric}
          metric={editingMetric}
          onCancel={() => setIsFormVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Metrics;


