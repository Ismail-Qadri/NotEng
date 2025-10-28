import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api"; // ✅ Use api instance instead of axios

const TemplatesModal = ({ onSave, template, onCancel }) => {
  const { t } = useLanguage();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ Use api instance with relative URL
    api.get("/channels")
      .then(res => {
        setChannels(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Failed to fetch channels:", err);
        setError(t("failedToLoadChannels") || "Failed to load channels");
      });
  }, []);

  useEffect(() => {
    if (template) {
      setSubject(template.subject || "");
      setBody(template.body || "");
      setChannelId(template.channelId || "");
    } else {
      setSubject("");
      setBody("");
      setChannelId("");
    }
    setError(""); // Clear any previous errors
  }, [template]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSave({
        subject,
        body,
        channelId: channelId ? Number(channelId) : null,
      });
      // Success handling is done in parent component
    } catch (err) {
      console.error("Failed to save template:", err);
      setError(t("saveFailed") || "Failed to save template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {template ? t("editTemplateModal") : t("addTemplateModal")}
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
              {t("subject")}
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
              disabled={loading}
              placeholder={t("enterSubject") || "Enter subject"}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("body")}
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              rows={5}
              required
              disabled={loading}
              placeholder={t("enterBody") || "Enter message body"}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("templateVariables") || "Available variables: {{userName}}, {{ruleLabel}}, {{currentValue}}, {{operator}}, {{thresholdValue}}"}
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("channel")}
            </label>
            <select
              value={channelId}
              onChange={e => setChannelId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
              disabled={loading}
            >
              <option value="">{t("selectChannel") || "Select Channel"}</option>
              {channels.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.label || ch.name}
                </option>
              ))}
            </select>
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

export default TemplatesModal;
