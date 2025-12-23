import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const formatIntlPhone = (phone) => {
  if (!phone || phone.trim() === '') return '';

  const cleaned = phone.replace(/\D/g, '');

  // Already in E.164 raw (like 2348123456789)
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+234 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  if (phone.startsWith('+')) return phone;

  return '+' + cleaned;
};


const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
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
  user,
}) => {
  const inputRef = useRef(null);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (fieldName === 'country') {
      const fetchCountries = async () => {
        try {
          const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
          const data = await res.json();

          const countryList = data
            .map((c) => ({
              name: c.name?.common || 'Unknown',
              code: c.cca2 || '',
              dialCode:
                c.idd?.root && c.idd?.suffixes?.length
                  ? c.idd.root + c.idd.suffixes[0]
                  : '',
            }))
            .filter((c) => c.name && c.code && c.dialCode);

          // Sort alphabetically
          setCountries(countryList.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
          console.error('Failed to fetch countries:', err);
        }
      };

      fetchCountries();
    }
  }, [fieldName]);




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
              onChange={(e) =>
                setEditedUser((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
              placeholder="First name"
            />
            <input
              type="text"
              value={editedUser.lastName || ''}
              onChange={(e) =>
                setEditedUser((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
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

  if (fieldName === 'phoneNumber') {
    const initialPhone = user.mobile || user.phoneNumber || '';
    const displayPhoneValue = editMode
      ? editedUser.phoneNumber ?? formatIntlPhone(initialPhone)
      : formatIntlPhone(initialPhone);
  
    return (
      <div>
        <p className="text-xs md:text-sm text-[#6B7280] mb-1">Mobile</p>
        {editMode ? (
          <input
            ref={inputRef}
            type="tel"
            value={editedUser.phoneNumber ?? formatIntlPhone(initialPhone)}
            onChange={(e) =>
              setEditedUser((prev) => ({
                ...prev,
                phoneNumber: e.target.value,
                _rawMobile: e.target.value.replace(/\D/g, ''),
              }))
            }
            className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
            placeholder="+234 812 345 6789"
          />
        ) : (
          <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded">
            {displayPhoneValue || user.mobile || user.phoneNumber || 'Not set'}
          </p>
        )}
      </div>
    );
  }
  


 // Inside EditableField.jsx (partial snippet)
if (fieldName === 'country') {
  return (
    <div>
      <p className="text-xs md:text-sm text-[#6B7280] mb-1">{label}</p>
      {editMode && !readOnly ? (
        <select
          ref={inputRef}
          value={editedUser.country || ''}
          onChange={(e) =>
            setEditedUser((prev) => ({
              ...prev,
              country: e.target.value,
            }))
          }
          className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-3 py-2 rounded w-full"
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.dialCode})
            </option>
          ))}
        </select>
      ) : (
        <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-3 py-2 rounded">
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
          onChange={(e) =>
            setEditedUser((prev) => ({
              ...prev,
              [fieldName]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
            }))
          }
          className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded w-full"
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? '0.01' : undefined}
        />
      ) : (
        <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded">
          {type === 'currency'
            ? formatCurrency(
                editedUser[fieldName] ?? user[fieldName] ?? 0,
                editedUser.currency || user.currency
              )
            : typeof (editedUser[fieldName] ?? user[fieldName]) === 'object'
  ? (editedUser[fieldName]?.name || user[fieldName]?.name || 'Not set')
  : (editedUser[fieldName] ?? user[fieldName] ?? 'Not set')
}
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
  user: PropTypes.object.isRequired,
};

export default EditableField;
