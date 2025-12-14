import { Input } from 'antd';
import { Search } from 'lucide-react';

export const SearchInput = ({ 
  placeholder = 'Search...', 
  onChange,
  value,
  ...props 
}) => {
  return (
    <Input
      prefix={<Search size={18} className="text-gray-400" />}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: 250, borderRadius: '20px' }}
      {...props}
    />
  );
};

export default SearchInput;