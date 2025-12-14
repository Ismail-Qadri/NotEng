import { Button } from './Button';
import { Plus } from 'lucide-react';

export const PageHeader = ({ 
  title, 
  onAdd, 
  addButtonText = 'Add New',
  canAdd = true,
  icon,
  extra,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
      <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="flex gap-2">
        {extra}
        {canAdd && onAdd && (
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={onAdd}
          >
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;