import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export const ConfirmModal = ({ 
  title = 'Confirm', 
  content, 
  onConfirm, 
  onCancel,
  okText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    onOk: onConfirm,
    onCancel,
    okButtonProps: { 
      style: { backgroundColor: '#ef4444', borderColor: '#ef4444' }
    },
  });
};

export default ConfirmModal;
