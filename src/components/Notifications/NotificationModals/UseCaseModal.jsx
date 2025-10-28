import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api"; // ✅ Import api instance (if needed for future enhancements)

const UseCaseModal = ({ onSave, useCase, onCancel }) => {
  const { t } = useLanguage();
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (useCase) {
      setLabel(useCase.label || "");
      setActive(useCase.active ?? true);
    } else {
      setLabel("");
      setActive(true);
    }
    setError(""); // Clear any previous errors
  }, [useCase]);

  // ✅ Example: Validate if use case name already exists (optional)
  const validateUseCaseName = async (name) => {
    try {
      const response = await api.get(`/usecases?label=${encodeURIComponent(name)}`);
      const existingUseCases = response.data;
      
      // Check if name exists (excluding current useCase when editing)
      const duplicate = existingUseCases.find(
        uc => uc.label.toLowerCase() === name.toLowerCase() && 
              uc.id !== useCase?.id
      );
      
      return !duplicate;
    } catch (err) {
      console.error("Failed to validate use case name:", err);
      return true; // Allow submission if validation fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Optional: Validate before saving (uncomment if needed)
      // const isValid = await validateUseCaseName(label);
      // if (!isValid) {
      //   setError(t("useCaseNameExists") || "A use case with this name already exists.");
      //   setLoading(false);
      //   return;
      // }

      // Call the parent's onSave function
      await onSave({ label, active });
      
      // Success handling is done in parent component
    } catch (err) {
      console.error("Failed to save use case:", err);
      setError(t("saveFailed") || "Failed to save use case. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {useCase ? t("editUseCaseModal") : t("addUseCaseModal")}
          </h3>
          <button 
            onClick={onCancel} 
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* ✅ Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("useCaseName")}
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
              disabled={loading}
              placeholder={t("enterUseCaseName") || "Enter use case name"}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-semibold">{t("status")}:</span>
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="form-checkbox text-teal-600 rounded-md"
              disabled={loading}
            />
            <span className="text-gray-700">{t("active")}</span>
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
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

export default UseCaseModal;