import React, { useState, useEffect } from "react";
import UseCaseModal from "../NotificationModals/UseCaseModal";
import { Plus, Edit, Trash2, LayoutGrid } from "lucide-react";
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

const UseCases = ({ can }) => {
  // Define safeCan
  const safeCan = typeof can === "function" ? can : () => false;

  const [useCases, setUseCases] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUseCase, setEditingUseCase] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    // ✅ Use api instance with relative URL
    api.get("/usecases")
      .then(res => {
        setUseCases(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch use cases", err);
      });
  }, []);

  const handleSaveUseCase = async (newUseCase) => {
    try {
      if (editingUseCase) {
        // ✅ Use api instance for PUT
        const response = await api.put(
          `/usecases/${editingUseCase.id}`,
          newUseCase
        );
        const updatedUseCase = response.data;
        setUseCases((prev) =>
          prev.map((uc) => (uc.id === editingUseCase.id ? updatedUseCase : uc))
        );
        setEditingUseCase(null);
      } else {
        // ✅ Use api instance for POST
        const response = await api.post("/usecases", newUseCase);
        const createdUseCase = response.data;
        setUseCases((prev) => [...prev, createdUseCase]);
      }
      setIsFormVisible(false);
      
      // ✅ Refresh use cases list
      const res = await api.get("/usecases");
      setUseCases(res.data);
    } catch (err) {
      console.error("Failed to save use case", err);
      alert("Failed to save use case. Please try again.");
    }
  };

  const handleEditUseCase = (useCaseId) => {
    const useCaseToEdit = useCases.find((uc) => uc.id === useCaseId);
    setEditingUseCase(useCaseToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteUseCase = async (useCaseId) => {
    try {
      // ✅ Use api instance for DELETE
      await api.delete(`/usecases/${useCaseId}`);
      setUseCases(useCases.filter((uc) => uc.id !== useCaseId));
    } catch (err) {
      console.error("Failed to delete use case", err);
      alert("Failed to delete use case. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
          <LayoutGrid size={20} className="me-2" /> {t("allUseCases")}
        </h2>
        {safeCan("UseCase Management", "write") && (
          <button
            onClick={() => {
              setEditingUseCase(null);
              setIsFormVisible(true);
            }}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t("addNewUseCase")}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("useCaseName")}
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
            {useCases.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  {t("noUseCasesMessage")}
                </td>
              </tr>
            )}
            {useCases.map((uc) => (
              <tr key={uc.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {uc.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${uc.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {uc.active ? t("active") : t("inactive")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {safeCan("UseCase Management", "write") ? (
                    <button
                      onClick={() => handleEditUseCase(uc.id)}
                      className="text-teal-600 hover:text-teal-900 me-4"
                    >
                      <Edit size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                      <Edit size={18} />
                    </button>
                  )}
                  
                  {safeCan("UseCase Management", "delete") ? (
                    <button
                      onClick={() => handleDeleteUseCase(uc.id)}
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
        <UseCaseModal
          onSave={handleSaveUseCase}
          useCase={editingUseCase}
          onCancel={() => setIsFormVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default UseCases;




