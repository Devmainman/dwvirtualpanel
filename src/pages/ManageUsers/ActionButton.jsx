import PropTypes from 'prop-types';

const ActionButton = ({ icon: Icon, label, color, onClick, disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`bg-${color}-600 hover:bg-${color}-700 text-white p-1 md:p-2 rounded-lg flex flex-col items-center justify-center text-xs transition-all duration-200 h-14 md:h-16 shadow-md hover:shadow-lg min-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    <div className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
      <Icon className="h-4 w-4 md:h-5 md:w-5" />
    </div>
    <span className="mt-1 text-center px-1">{label}</span>
  </button>
);

ActionButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default ActionButton;