export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;