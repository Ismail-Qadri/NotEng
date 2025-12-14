
import React, { useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { Card, Table, PageHeader, UniversalModal, UniversalForm } from '../../../components/common';
import { useCRUD } from '../../../hooks/useCRUD';
import { ConfirmModal } from '../../../components/common';
import useLanguage from '../../../hooks/useLanguage';

const DimensionsModal = ({ can }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);
  const [error, setError] = useState('');

  const { data: dimensions, loading, create, update, remove } = useCRUD('/dimensions');

  const columns = [
    {
      title: t('dimensionName'),
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: t('columnName'),
      dataIndex: 'columnName',
      key: 'columnName',
    },
    {
      title: t('sqlQuery'),
      dataIndex: 'valuesSql',
      key: 'valuesSql',
      render: (text) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.95em' }}>{text}</span>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="text-teal-700 hover:text-teal-900"
            onClick={() => handleEdit(record)}
            title={t('edit')}
          >
            ✏️
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDelete(record)}
            title={t('delete')}
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDimension(null);
    setIsModalOpen(true);
    setError('');
  };

  const handleEdit = (dimension) => {
    setEditingDimension(dimension);
    setIsModalOpen(true);
    setError('');
  };

  const handleDelete = (dimension) => {
    ConfirmModal({
      title: t('deleteEntityConfirm', { entity: t('dimension') }),
      onConfirm: () => remove(dimension.id),
    });
  };

  const handleSubmit = async (values) => {
    setError('');
    try {
      if (editingDimension) {
        await update(editingDimension.id, values);
      } else {
        await create(values);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(t('saveFailed') || 'Failed to save dimension. Please try again.');
    }
  };

  const formFields = [
    {
      name: 'label',
      label: t('dimensionName'),
      type: 'input',
      required: true,
      errorMsg: t('dimensionNameRequired'),
      placeholder: t('enterDimensionName'),
    },
    {
      name: 'columnName',
      label: t('columnName'),
      type: 'input',
      required: true,
      errorMsg: t('columnNameRequired'),
      placeholder: 'e.g., user_id, department, region',
    },
    {
      name: 'valuesSql',
      label: t('sqlQuery'),
      type: 'textarea',
      required: true,
      errorMsg: t('sqlQueryRequired'),
      placeholder: t('sqlQueryPlaceholder') || 'SELECT DISTINCT column_name FROM table_name ORDER BY column_name',
      rows: 4,
    },
  ];

  const initialValues = editingDimension
    ? {
        label: editingDimension.label || '',
        columnName: editingDimension.columnName || '',
        valuesSql: editingDimension.valuesSql || '',
      }
    : {
        label: '',
        columnName: '',
        valuesSql: '',
      };

  return (
    <Card>
      <PageHeader
        title={t('allDimensions')}
        icon={<Grid3x3 size={20} />}
        onAdd={handleAdd}
        addButtonText={t('addNewDimension')}
        canAdd={can('Dimension Management', 'write')}
      />
      
      <Table
        columns={columns}
        dataSource={dimensions}
        loading={loading}
        canEdit={false}
        canDelete={false}
      />

      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDimension ? t('editDimensionModal') : t('addDimensionModal')}
      >
        <UniversalForm
          fields={formFields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          submitText={t('save')}
          cancelText={t('cancel')}
          loading={loading}
          error={error}
        />
      </UniversalModal>
    </Card>
  );
};

export default DimensionsModal;