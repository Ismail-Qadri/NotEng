import { Table as AntTable } from 'antd';
import { Edit, Trash2 } from 'lucide-react';
import useLanguage from '../../hooks/useLanguage';

export const Table = ({ 
  columns, 
  dataSource, 
  loading, 
  onEdit, 
  onDelete, 
  canEdit, 
  canDelete,
  ...props 
}) => {
  const { t } = useLanguage();
  const actionColumn = {
    title: t('actions'),
    key: 'actions',
    fixed: 'right',
    width: 100,
    render: (_, record) => (
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(record)}
          disabled={!canEdit}
          className={`${canEdit ? 'text-teal-600 hover:text-teal-900' : 'opacity-50 cursor-not-allowed'}`}
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(record)}
          disabled={!canDelete}
          className={`${canDelete ? 'text-red-600 hover:text-red-900' : 'opacity-50 cursor-not-allowed'}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  };

  const finalColumns = onEdit || onDelete 
    ? [...columns, actionColumn] 
    : columns;

  return (
    <AntTable
      columns={finalColumns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => t('totalItems', { count: total }),
        locale: {
        items_per_page: t('recordsPerPage'), 
      },
      }}
      
      {...props}
    />
  );
};
export default Table;