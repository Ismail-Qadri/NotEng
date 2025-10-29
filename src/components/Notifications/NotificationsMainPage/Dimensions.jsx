import React, { useState, useEffect } from "react";
import DimensionsModal from "../NotificationModals/DimensionsModal";
import { Plus, Edit, Trash2, LayoutGrid } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api"; 

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

const Dimensions = ({ can }) => {
  // Define safeCan
  const safeCan = typeof can === "function" ? can : () => false;

  const [dimensions, setDimensions] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    //  Use api instance with relative URL
    api.get("/dimensions")
      .then(res => {
        setDimensions(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch dimensions", err);
      });
  }, []);

  const handleSaveDimension = async (newDimension) => {
    try {
      if (editingDimension) {
        //  Use api instance for PUT
        const response = await api.put(
          `/dimensions/${editingDimension.id}`,
          newDimension
        );
        const updatedDimension = response.data;
        setDimensions((prev) =>
          prev.map((d) => (d.id === editingDimension.id ? updatedDimension : d))
        );
        setEditingDimension(null);
      } else {
        //  Use api instance for POST
        const response = await api.post("/dimensions", newDimension);
        const createdDimension = response.data;
        setDimensions((prev) => [...prev, createdDimension]);
      }
      setIsFormVisible(false);
      
      //  Refresh dimensions list
      const res = await api.get("/dimensions");
      setDimensions(res.data);
    } catch (err) {
      console.error("Failed to save dimension", err);
      alert("Failed to save dimension. Please try again.");
    }
  };

  const handleEditDimension = (dimensionId) => {
    const dimensionToEdit = dimensions.find((d) => d.id === dimensionId);
    setEditingDimension(dimensionToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteDimension = async (dimensionId) => {
    try {
      //  Use api instance for DELETE
      await api.delete(`/dimensions/${dimensionId}`);
      setDimensions(dimensions.filter((d) => d.id !== dimensionId));
    } catch (err) {
      console.error("Failed to delete dimension", err);
      alert("Failed to delete dimension. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
          <LayoutGrid size={20} className="me-2" /> {t("allDimensions")}
        </h2>
        {safeCan("Dimensions Management", "write") && (
          <button
            onClick={() => {
              setEditingDimension(null);
              setIsFormVisible(true);
            }}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t("addNewDimension")}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("dimensionName")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("columnName")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("sqlQuery")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dimensions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {t("noDimensionsMessage")}
                </td>
              </tr>
            )}
            {dimensions.map((d) => (
              <tr key={d.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {d.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {d.columnName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {d.valuesSql}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {safeCan("Dimensions Management", "write") ? (
                    <button
                      onClick={() => handleEditDimension(d.id)}
                      className="text-teal-600 hover:text-teal-900 me-4"
                    >
                      <Edit size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                      <Edit size={18} />
                    </button>
                  )}
                  
                  {safeCan("Dimensions Management", "delete") ? (
                    <button
                      onClick={() => handleDeleteDimension(d.id)}
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
        <DimensionsModal
          onSave={handleSaveDimension}
          dimension={editingDimension}
          onCancel={() => setIsFormVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Dimensions;