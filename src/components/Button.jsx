import { Button as AntButton } from 'antd';

const Button = ({
  type = 'primary',
  htmlType = 'button',
  children,
  className = '',
  style = {},
  ...rest
}) => {
  // Default teal style for primary buttons
  const tealStyle =
    type === 'primary'
      ? {
          width: '100%',
          marginTop: '1.25rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          backgroundColor: '#14b8a6',
          borderColor: '#14b8a6',
          color: '#fff',
          fontWeight: 600,
          borderRadius: '0.375rem',
          fontSize: '1rem',
          transition: 'background 0.2s',
          ...style,
        }
      : style;

  return (
    <AntButton
      type={type}
      htmlType={htmlType}
      className={className}
      style={tealStyle}
      {...rest}
    >
      {children}
    </AntButton>
  );
};

export default Button;