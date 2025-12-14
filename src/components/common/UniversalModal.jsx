import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const UniversalModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl",
  maxHeight = "max-h-[80vh]",
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-8 mt-10 ${maxHeight} flex flex-col`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default UniversalModal;