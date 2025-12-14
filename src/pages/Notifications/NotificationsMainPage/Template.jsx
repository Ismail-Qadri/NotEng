import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { Card, PageHeader, Table, UniversalForm, UniversalModal } from '../../../components/common';
import { useCRUD } from '../../../hooks/useCRUD';
import { ConfirmModal } from '../../../components/common';
import useLanguage from '../../../hooks/useLanguage';
import api from '../../../api';
import IconButton from "../../../components/common/IconButton";

const Template = ({ can }) => {
  const { t, language: currentLanguage } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const { data: templates, loading, create, update, remove, refresh } = useCRUD('/notification-templates');

  useEffect(() => {
    api.get('/channels')
      .then(res => setChannels(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to fetch channels:', err));
  }, []);

  const columns = [
    {
      title: t('label'),
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: t('channel'),
      dataIndex: ['channel', 'label'],
      key: 'channel',
      render: (text, record) => {
        const channelLabel = record.channel?.label
          || channels.find(ch => ch.id === record.channelId)?.label
          || "-";
        return <Tag color="blue">{channelLabel}</Tag>;
      },
    },
    {
      title: t('language'),
      dataIndex: 'language',
      key: 'language',
      render: (text) => text === 'ar' ? 'العربية' : 'English',
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, template) => (
        <>
          <IconButton
            onClick={() => handleEdit(template)}
            disabled={!can('Template Management', 'write')}
            className="text-teal-600 hover:text-teal-900 me-2"
            title={t('edit')}
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(template)}
            disabled={!can('Template Management', 'delete')}
            className="text-red-600 hover:text-red-900"
            title={t('delete')}
          >
            <Trash2 size={18} />
          </IconButton>
        </>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingTemplate(null);
    setSelectedChannelId(null);
    setFormKey(prev => prev + 1);
    setIsModalOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setSelectedChannelId(Number(template.channelId));
    setFormKey(prev => prev + 1);
    setIsModalOpen(true);
  };

  const handleDelete = (template) => {
    ConfirmModal({
      title: t('deleteEntityConfirm', { entity: t('template') }),
      onConfirm: async () => {
        await remove(template.id);
        await refresh();
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Submitting values:', values);
      
      const channelIdNum = Number(values.channelId);
      const payload = {
        label: values.label,
        language: values.language,
        channelId: channelIdNum,
      };
      
      if (channelIdNum === 1) {
        payload.subject = values.subject;
        payload.body = values.body;
      } else if (channelIdNum === 2) {
        payload.body = values.body;
      } else if (channelIdNum === 3) {
        payload.templateName = values.templateName;
      }
      
      if (editingTemplate) {
        await update(editingTemplate.id, payload);
      } else {
        await create(payload);
      }
      
      await refresh();
      setIsModalOpen(false);
      setSelectedChannelId(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const getFormFields = () => {
    const numSelectedChannelId = selectedChannelId ? Number(selectedChannelId) : null;
    
    const fields = [
      {
        name: 'channelId',
        label: t('channel'),
        type: 'select',
        required: true,
        errorMsg: t('channelRequired'),
        options: channels.map(ch => ({ 
          label: ch.label || ch.name, 
          value: String(ch.id)
        })),
        placeholder: t('selectChannel'),
        onChange: (value) => {
          console.log('Channel selected:', value);
          setSelectedChannelId(Number(value));
          // Do NOT increment formKey here - let the form update naturally
        },
      },
      {
        name: 'label',
        label: t('label'),
        type: 'input',
        required: true,
        errorMsg: t('labelRequired'),
        placeholder: t('enterLabel'),
      },
      {
        name: 'language',
        label: t('language'),
        type: 'select',
        required: true,
        errorMsg: t('languageRequired'),
        options: [
          { label: 'English', value: 'en' },
          { label: 'العربية', value: 'ar' },
        ],
        placeholder: t('selectLanguage'),
      },
    ];

    if (numSelectedChannelId === 1) {
      fields.push(
        {
          name: 'subject',
          label: t('subject'),
          type: 'input',
          required: true,
          errorMsg: t('subjectRequired'),
          placeholder: t('enterSubject'),
        },
        {
          name: 'body',
          label: t('body'),
          type: 'textarea',
          required: true,
          errorMsg: t('bodyRequired'),
          placeholder: t('enterBody'),
          rows: 5,
        }
      );
    } else if (numSelectedChannelId === 2) {
      fields.push({
        name: 'body',
        label: t('body'),
        type: 'textarea',
        required: true,
        errorMsg: t('bodyRequired'),
        placeholder: t('enterBody'),
        rows: 3,
      });
    } else if (numSelectedChannelId === 3) {
      fields.push({
        name: 'templateName',
        label: t('templateName'),
        type: 'input',
        required: true,
        errorMsg: t('templateNameRequired'),
        placeholder: 'e.g., alert_notification_v1',
      });
    }

    return fields;
  };

  const initialValues = editingTemplate
    ? {
        channelId: String(editingTemplate.channelId),
        label: editingTemplate.label || '',
        language: editingTemplate.language || currentLanguage,
        subject: editingTemplate.subject || '',
        body: editingTemplate.body || '',
        templateName: editingTemplate.templateName || '',
      }
    : {
        channelId: selectedChannelId ? String(selectedChannelId) : '',
        label: '',
        language: currentLanguage,
        subject: '',
        body: '',
        templateName: '',
      };

  return (
    <Card>
      <PageHeader
        title={t('allTemplates')}
        icon={<FileText size={20} />}
        onAdd={handleAdd}
        addButtonText={t('addNewTemplate')}
        canAdd={can('Template Management', 'write')}
      />
      <Table
        columns={columns}
        dataSource={templates}
        loading={loading}
      />
      <UniversalModal
        title={editingTemplate ? t('editTemplateModal') : t('addTemplateModal')}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedChannelId(null);
        }}
      >
        <UniversalForm
          key={formKey} 
          fields={getFormFields()}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedChannelId(null);
          }}
          submitText={t('save')}
          cancelText={t('cancel')}
          loading={loading}
        />
      </UniversalModal>
    </Card>
  );
};

export default Template;