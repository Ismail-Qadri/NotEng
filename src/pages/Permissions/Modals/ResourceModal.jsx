import React, { useState, useEffect } from "react";
import { Form as AntForm } from "antd";
import { UniversalForm, UniversalModal } from "../../../components/common";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api";

const ResourceModal = ({ onClose, onSave, resource, can }) => {
  const { t } = useLanguage();
  const [form] = AntForm.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isNewResource = !resource || !resource.id;
  const jwt = localStorage.getItem("userId");

  useEffect(() => {
    if (resource) {
      form.setFieldsValue({
        name: resource.name || "",
        category: resource.category || "",
        description: resource.description || "",
      });
    }
  }, [resource, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (resource?.id) {
        res = await api.put(`/resources/${resource.id}`, values, {
          headers: { "x-nafath-id": jwt },
        });
      } else {
        res = await api.post(`/resources`, values, {
          headers: { "x-nafath-id": jwt },
        });
      }
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      alert(
        "Error saving resource: " + (err.response?.data?.message || err.message)
      );
      console.error("Error saving resource:", err);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "name",
      label: t("name"),
      type: "input",
      rules: [
        { required: true, message: t("nameRequired") || "Name is required" },
      ],
      placeholder: t("resourceNamePlaceholder"),
      disabled: !!resource?.id, // Read-only when editing
    },
    {
      name: "category",
      label: t("category"),
      type: "input",
      rules: [
        {
          required: true,
          message: t("categoryRequired") || "Category is required",
        },
      ],
      placeholder: t("categoryPlaceholder"),
    },
    {
      name: "description",
      label: t("description"),
      type: "input",
      placeholder: t("descriptionPlaceholder"),
    },
  ];

  const initialValues = resource
    ? {
        name: resource.name || "",
        category: resource.category || "",
        description: resource.description || "",
      }
    : {};

  return (
    <UniversalModal
      title={resource ? t("editResourceModal") : t("addResourceModal")}
      isOpen={true}
      onClose={onClose}
    >
      <UniversalForm
        fields={formFields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={t("save")}
        cancelText={t("cancel")}
        loading={loading}
        error={error}
        submitDisabled={!can("Resource Management", "write")}
      />
    </UniversalModal>
  );
};

export default ResourceModal;
