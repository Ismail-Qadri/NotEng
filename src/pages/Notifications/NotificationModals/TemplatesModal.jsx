import React, { useState, useEffect, useCallback } from "react";
import { Tag } from "antd";
import { FileText } from "lucide-react";

import {
  Card,
  Table,
  UniversalForm,
  UniversalModal,
  PageHeader,
} from "../../../components/common";

import { ConfirmModal } from "../../../components/common";
import { useCRUD } from "../../../hooks/useCRUD";
import useLanguage from "../../../hooks/useLanguage";
import api from "../../../api";

const TemplatesModal = ({ can }) => {
  const { t, language: currentLanguage } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [formKey, setFormKey] = useState(0); // Add this to force form re-render

  const {
    data: templates,
    loading,
    create,
    update,
    remove,
  } = useCRUD("/notification-templates");

  useEffect(() => {
    api
      .get("/channels")
      .then((res) => setChannels(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch channels:", err));
  }, []);

  const columns = [
    {
      title: t("label"),
      dataIndex: "label",
      key: "label",
    },
    {
      title: t("language"),
      dataIndex: "language",
      key: "language",
      render: (text) => (text === "ar" ? "العربية" : "English"),
    },
    {
      title: t("channel"),
      dataIndex: ["channel", "label"],
      key: "channel",
      render: (text, record) => (
        <Tag color="blue">
          {record.channel?.label || record.channel?.name || "-"}
        </Tag>
      ),
    },
    {
      title: t("content"),
      dataIndex: "subject",
      key: "content",
      render: (text, record) =>
        record.subject ||
        record.templateName ||
        (record.body ? record.body.substring(0, 50) + "..." : "-"),
    },
  ];

  const handleAdd = () => {
    setEditingTemplate(null);
    setSelectedChannelId(null);
    setFormKey((prev) => prev + 1); // Force form reset
    setIsModalOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setSelectedChannelId(Number(template.channelId));
    setFormKey((prev) => prev + 1); // Force form reset with new values
    setIsModalOpen(true);
  };

  const handleDelete = async (template) => {
    ConfirmModal({
      title: t("deleteEntityConfirm", { entity: t("template") }),
      onConfirm: async () => {
        await remove(template.id);
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
        const payload = {
        label: values.label,
        language: values.language,
        channelId: Number(values.channelId),
      };

      if (payload.channelId === 1) {
        payload.subject = values.subject;
        payload.body = values.body;
      } else if (payload.channelId === 2) {
        payload.body = values.body;
      } else if (payload.channelId === 3) {
        payload.templateName = values.templateName;
      }

      if (editingTemplate) {
        await update(editingTemplate.id, payload);
      } else {
        await create(payload);
      }

      setIsModalOpen(false);
      setSelectedChannelId(null);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  /* -----------------------------------------------
     DYNAMIC FORM FIELDS
  -------------------------------------------------*/
  const getFormFields = useCallback(() => {
    const baseFields = [
      {
        name: "channelId",
        label: t("channel"),
        type: "select",
        required: true,
        errorMsg: t("channelRequired"),
        placeholder: t("selectChannel"),
        options: channels.map((ch) => ({
          label: ch.label || ch.name,
          value: String(ch.id),
        })),
        onChange: (val) => {
          setSelectedChannelId(val); // update parent state
          setFormKey((prev) => prev + 1); // force UniversalForm re-mount
        },
      },
      {
        name: "label",
        label: t("label"),
        type: "input",
        required: true,
        errorMsg: t("labelRequired"),
        placeholder: t("enterLabel"),
      },
      {
        name: "language",
        label: t("language"),
        type: "select",
        required: true,
        errorMsg: t("languageRequired"),
        options: [
          { label: "English", value: "en" },
          { label: "العربية", value: "ar" },
        ],
      },
    ];

    if (selectedChannelId === "1") {
      baseFields.push(
        {
          name: "subject",
          label: t("subject"),
          type: "input",
          required: true,
          errorMsg: t("subjectRequired"),
        },
        {
          name: "body",
          label: t("body"),
          type: "textarea",
          required: true,
          errorMsg: t("bodyRequired"),
          rows: 5,
        }
      );
    } else if (selectedChannelId === "2") {
      baseFields.push({
        name: "body",
        label: t("body"),
        type: "textarea",
        required: true,
        errorMsg: t("bodyRequired"),
        rows: 3,
      });
    } else if (selectedChannelId === "3") {
      baseFields.push({
        name: "templateName",
        label: t("templateName"),
        type: "input",
        required: true,
        errorMsg: t("templateNameRequired"),
      });
    }

    return baseFields;
  }, [channels, selectedChannelId, t]);

  /* -----------------------------------------------
     INITIAL VALUES
  -------------------------------------------------*/
  const initialValues = editingTemplate
    ? {
        channelId: String(editingTemplate.channelId),
        label: editingTemplate.label || "",
        language: editingTemplate.language || currentLanguage,
        subject: editingTemplate.subject || "",
        body: editingTemplate.body || "",
        templateName: editingTemplate.templateName || "",
      }
    : {
        channelId: selectedChannelId ? String(selectedChannelId) : "",
        label: "",
        language: currentLanguage,
        subject: "",
        body: "",
        templateName: "",
      };

  return (
    <Card>
      <PageHeader
        title={t("allTemplates")}
        icon={<FileText size={20} />}
        onAdd={handleAdd}
        addButtonText={t("addNewTemplate")}
        canAdd={can("Template Management", "write")}
      />

      <Table
        columns={columns}
        dataSource={templates}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={can("Template Management", "write")}
        canDelete={can("Template Management", "delete")}
      />

      <UniversalModal
        title={editingTemplate ? t("editTemplateModal") : t("addTemplateModal")}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedChannelId(null);
        }}
      >
        <UniversalForm
          key={formKey} // This forces re-mount on channel change
          fields={getFormFields()}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedChannelId(null);
          }}
          submitText={t("save")}
          cancelText={t("cancel")}
          loading={loading}
        />
      </UniversalModal>
    </Card>
  );
};

export default TemplatesModal;
