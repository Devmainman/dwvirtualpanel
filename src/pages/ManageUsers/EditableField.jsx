import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const EditableField = ({ 
  label, 
  fieldName, 
  type = 'text', 
  readOnly = false, 
  editedUser, 
  setEditedUser, 
  editMode, 
  user 
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editMode, fieldName]);

  if (fieldName === 'fullName') {
    return (
      <div>
        <p className="text-xs md:text-sm text-[#6B7280] mb-1">{label}</p>
        {editMode && !readOnly ? (
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={editedUser.firstName || ''}
              onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
              className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
              placeholder="First name"
            />
            <input
              type="text"
              value={editedUser.lastName || ''}
              onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
              className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
              placeholder="Last name"
            />
          </div>
        ) : (
          <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded">
            {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not set'}
          </p>
        )}
      </div>
    );
  }

  // In the phoneNumber field section, replace the current implementation with:
if (fieldName === 'phoneNumber') {
  return (
    <div>
      <p className="text-xs md:text-sm text-[#6B7280] mb-1">Mobile</p>
      {editMode ? (
        <input
          ref={inputRef}
          type="tel"
          value={editedUser.phoneNumber || user._rawMobile || ''}
          onChange={(e) => setEditedUser(prev => ({ 
            ...prev, 
            phoneNumber: e.target.value,
            // Keep raw mobile in sync for backend
            _rawMobile: e.target.value.replace(/\D/g, '')
          }))}
          className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
          placeholder="+234 812 345 6789"
        />
      ) : (
        <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded">
          {user.mobile ? user.mobile.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : 'Not set'}
        </p>
      )}
    </div>
  );
}

  if (fieldName === 'country') {
    return (
      <div>
        <p className="text-xs md:text-sm text-[#6B7280] mb-1">{label}</p>
        {editMode && !readOnly ? (
          <input
            ref={inputRef}
            type="text"
            value={editedUser.country || ''}
            onChange={(e) => setEditedUser(prev => ({ ...prev, country: e.target.value }))}
            placeholder="Enter country"
            className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
          />
        ) : (
          <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded">
            {user.country || 'Not set'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs md:text-sm text-[#6B7280] mb-1">{label}</p>
      {editMode && !readOnly ? (
        <input
          ref={inputRef}
          type={type === 'currency' ? 'number' : type}
          value={editedUser[fieldName]}
          onChange={(e) => setEditedUser(prev => ({
            ...prev,
            [fieldName]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
          }))}
          className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? '0.01' : undefined}
        />
      ) : (
        <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded">
          {type === 'currency' 
            ? formatCurrency(editedUser[fieldName] || 0, editedUser.currency) 
            : editedUser[fieldName] || 'Not set'}
        </p>
      )}
    </div>
  );
};

EditableField.propTypes = {
  label: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  type: PropTypes.string,
  readOnly: PropTypes.bool,
  editedUser: PropTypes.object.isRequired,
  setEditedUser: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired
};

export default EditableField;