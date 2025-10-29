import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";

const DimensionsModal = ({ onSave, dimension, onCancel }) => {
  const { t } = useLanguage();
  const [label, setLabel] = useState("");
  const [columnName, setColumnName] = useState("");
  const [valuesSql, setValuesSql] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (dimension) {
      setLabel(dimension.label || "");
      setColumnName(dimension.columnName || "");
      setValuesSql(dimension.valuesSql || "");
    } else {
      setLabel("");
      setColumnName("");
      setValuesSql("");
    }
    setError("");
  }, [dimension]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSave({ label, columnName, valuesSql });
    } catch {
      setError(
        t("saveFailed") || "Failed to save dimension. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {dimension ? t("editDimensionModal") : t("addDimensionModal")}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("dimensionName")}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
              disabled={loading}
              placeholder={t("enterDimensionName") || "Enter dimension name"}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("columnName")}
            </label>
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
              disabled={loading}
              placeholder="e.g., user_id, department, region"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("columnNameHint") ||
                "The database column name for this dimension"}
            </p>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("sqlQuery")}
            </label>
            <textarea
              value={valuesSql}
              onChange={(e) => setValuesSql(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-sm"
              required
              disabled={loading}
              rows={4}
              placeholder={
                t("sqlQueryPlaceholder") ||
                "SELECT DISTINCT column_name FROM table_name ORDER BY column_name"
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("sqlQueryHint") ||
                "SQL query to fetch available dimension values"}
            </p>
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
                <span
                  className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                  aria-label="Loading"
                  aria-busy="true"
                ></span>
              )}
              {loading ? t("saving") || "Saving..." : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DimensionsModal;
