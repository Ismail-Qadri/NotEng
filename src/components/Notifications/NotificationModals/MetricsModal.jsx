import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api";

const MetricsModal = ({ onSave, metric, onCancel }) => {
  const { t } = useLanguage();
  const [label, setLabel] = useState("");
  const [executeSqlMain, setExecuteSqlMain] = useState("");
  const [conditionalSql, setConditionalSql] = useState("");
  const [useCaseId, setUseCaseId] = useState("");
  const [dimensionId, setDimensionId] = useState("");
  const [useCases, setUseCases] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

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
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(t("failedToLoadData") || "Failed to load data");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (metric) {
      setLabel(metric.label || "");
      setExecuteSqlMain(metric.executeSqlMain || "");
      setConditionalSql(metric.conditionalSql || "");
      setUseCaseId(metric.useCaseId || "");
      setDimensionId(metric.dimensionId || "");
    } else {
      setLabel("");
      setExecuteSqlMain("");
      setConditionalSql("");
      setUseCaseId("");
      setDimensionId("");
    }
    setError(""); // Clear any previous errors
  }, [metric]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const newErrors = {};
    if (!label.trim()) newErrors.label = t("metricNameRequired");
    if (!executeSqlMain.trim())
      newErrors.executeSqlMain = t("sqlQueryRequired");
    if (!useCaseId) newErrors.useCaseId = t("useCaseRequired");
    if (!dimensionId) newErrors.dimensionId = t("dimensionRequired");
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      await onSave({
        label,
        executeSqlMain,
        conditionalSql,
        useCaseId: useCaseId ? Number(useCaseId) : null,
        dimensionId: dimensionId ? Number(dimensionId) : null,
      });
      // Success handling is done in parent component
    } catch (err) {
      console.error("Failed to save metric:", err);
      setError(t("saveFailed") || "Failed to save metric. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 mt-10 transform transition-transform scale-100 max-h-[75vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {metric ? t("editMetricModal") : t("addMetricModal")}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] p-2 space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("metricName")}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errors.label) setErrors({ ...errors, label: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                errors.label ? "border-red-500" : ""
              }`}
              disabled={loading}
              placeholder={t("addEnterMetricName") || "Enter metric name"}
            />
            {errors.label && (
              <div className="text-red-500 text-xs mt-1">{errors.label}</div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("Sql")}{" "}
              <span className="text-black-700 font-normal">({t("main")})</span>
            </label>
            <textarea
              value={executeSqlMain}
              onChange={(e) => {
                setExecuteSqlMain(e.target.value);
                if (errors.executeSqlMain)
                  setErrors({ ...errors, executeSqlMain: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-sm ${
                errors.executeSqlMain ? "border-red-500" : ""
              }`}
              disabled={loading}
              rows={4}
              placeholder="SELECT COUNT(*) FROM table WHERE condition"
            />
            {errors.executeSqlMain && (
              <div className="text-red-500 text-xs mt-1">
                {errors.executeSqlMain}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("Sql")}{" "}
              <span className="text-gray-400 font-normal">
                ({t("optional")})
              </span>
            </label>
            <textarea
              value={conditionalSql}
              onChange={(e) => setConditionalSql(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-sm"
              disabled={loading}
              rows={4}
              placeholder={
                t("optionalConditionalSqlQuery") ||
                "Optional conditional SQL query"
              }
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("useCase")}
            </label>
            <select
              value={useCaseId}
              onChange={(e) => {
                setUseCaseId(e.target.value);
                if (errors.useCaseId)
                  setErrors({ ...errors, useCaseId: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                errors.useCaseId ? "border-red-500" : ""
              }`}
              disabled={loading}
            >
              <option value="">
                {t("selectUseCase") || "Select Use Case"}
              </option>
              {useCases.map((uc) => (
                <option key={uc.id} value={uc.id}>
                  {uc.label}
                </option>
              ))}
            </select>
            {errors.useCaseId && (
              <div className="text-red-500 text-xs mt-1">
                {errors.useCaseId}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("dimension")}
            </label>
            <select
              value={dimensionId}
              onChange={(e) => {
                setDimensionId(e.target.value);
                if (errors.dimensionId)
                  setErrors({ ...errors, dimensionId: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                errors.dimensionId ? "border-red-500" : ""
              }`}
              disabled={loading}
            >
              <option value="">
                {t("selectDimension") || "Select Dimension"}
              </option>
              {dimensions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            {errors.dimensionId && (
              <div className="text-red-500 text-xs mt-1">
                {errors.dimensionId}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border rounded-full text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#166a45] text-white font-semibold hover:bg-[#104631] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? t("saving") || "Saving..." : t("save")}
            </button>
          </div>
        </form>
    
    </div>
    </div>
  );
};

export default MetricsModal;
