import React, { useState, useEffect } from "react";
import TemplatesModal from "../NotificationModals/TemplatesModal";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
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

const Template = ({ can }) => {
  // Define safeCan
  const safeCan = typeof can === "function" ? can : () => false;

  const [templates, setTemplates] = useState([]);
  const [channels, setChannels] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, channelsRes] = await Promise.all([
          api.get("/notification-templates").catch(() => ({ data: [] })),
          api.get("/channels").catch(() => ({ data: [] }))
        ]);
        
        setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
        setChannels(Array.isArray(channelsRes.data) ? channelsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch templates", err);
      }
    };

    fetchData();
  }, []);
  

  const handleSaveTemplate = async (newTemplate) => {
    try {
      if (editingTemplate) {
        // Use api instance for PUT
        const response = await api.put(
          `/notification-templates/${editingTemplate.id}`,
          newTemplate
        );
        const updatedTemplate = response.data;
        setTemplates((prev) =>
          prev.map((tpl) => (tpl.id === editingTemplate.id ? updatedTemplate : tpl))
        );
        setEditingTemplate(null);
      } else {
        // Use api instance for POST
        const response = await api.post(
          "/notification-templates",
          newTemplate
        );
        const createdTemplate = response.data;
        setTemplates((prev) => [...prev, createdTemplate]);
      }
      setIsFormVisible(false);
      
      // Refresh templates list
      const res = await api.get("/notification-templates");
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to save template", err);
      alert("Failed to save template. Please try again.");
    }
  };

  const handleEditTemplate = (templateId) => {
    const templateToEdit = templates.find((tpl) => tpl.id === templateId);
    setEditingTemplate(templateToEdit);
    setIsFormVisible(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      // Use api instance for DELETE
      await api.delete(`/notification-templates/${templateId}`);
      setTemplates(templates.filter((tpl) => tpl.id !== templateId));
    } catch (err) {
      console.error("Failed to delete template", err);
      alert("Failed to delete template. Please try again.");
    }
  };

  // Add helper function
  const getChannelName = (channelId) => {
    const channel = channels.find(ch => ch.id === channelId);
    return channel ? (channel.label || channel.name) : channelId;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
          <FileText size={20} className="me-2" /> {t("allTemplates")}
        </h2>
        {safeCan("Template Management", "write") && (
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsFormVisible(true);
            }}
            className="flex items-center px-4 py-2 bg-[#166a45] text-white rounded-full"
          >
            <Plus size={16} className="me-2" /> {t("addNewTemplate")}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("subject")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("channel")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("body")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {t("noTemplatesMessage")}
                </td>
              </tr>
            )}
            {templates.map((tpl) => (
              <tr key={tpl.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tpl.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tpl.channel?.label || tpl.channelId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tpl.body}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {safeCan("Template Management", "write") ? (
                    <button
                      onClick={() => handleEditTemplate(tpl.id)}
                      className="text-teal-600 hover:text-teal-900 me-4"
                    >
                      <Edit size={18} />
                    </button>
                  ) : (
                    <button disabled className="opacity-50 cursor-not-allowed me-4">
                      <Edit size={18} />
                    </button>
                  )}
                  
                  {safeCan("Template Management", "delete") ? (
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id)}
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
        <TemplatesModal
          onSave={handleSaveTemplate}
          template={editingTemplate}
          onCancel={() => setIsFormVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Template;

