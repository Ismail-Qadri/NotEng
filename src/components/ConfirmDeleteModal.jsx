import React from "react";
import useLanguage from "../hooks/useLanguage";

const ConfirmDeleteModal = ({ open, message, error, onConfirm, onCancel }) => {
  if (!open) return null;

const { t } = useLanguage();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <div className="mb-4 text-gray-800">{message}</div>
        {error && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            {t('proceed')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;