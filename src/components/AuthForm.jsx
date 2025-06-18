import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const AuthForm = ({ isLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ...(!isLogin && {
      fullName: '',
      mobile: '',
      country: ''
    })
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login, register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (formData.fullName.length < 3) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.mobile.match(/^\+?[\d\s-]{8,}$/)) {
        newErrors.mobile = 'Please enter a valid phone number';
      }
      if (formData.country.length < 2) {
        newErrors.country = 'Please select a country';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login successful!');
        navigate('/');
      } else {
        await register(formData);
        toast.success('Registration successful! Please login');
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         `Failed to ${isLogin ? 'login' : 'register'}`;
      toast.error(errorMessage);
      
      // Set field-specific errors from backend
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={submitting || loading}
                className={errors.fullName ? 'error' : ''}
                required
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                disabled={submitting || loading}
                className={errors.mobile ? 'error' : ''}
                required
              />
              {errors.mobile && <span className="error-message">{errors.mobile}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={submitting || loading}
                className={errors.country ? 'error' : ''}
                required
              >
                <option value="">Select Country</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                {/* Add more countries as needed */}
              </select>
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={submitting || loading}
            className={errors.email ? 'error' : ''}
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={submitting || loading}
            className={errors.password ? 'error' : ''}
            minLength="6"
            required
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button 
          type="submit" 
          disabled={submitting || loading}
          className="submit-btn"
        >
          {submitting ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : isLogin ? (
            'Login'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        {isLogin ? (
          <>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </p>
          </>
        ) : (
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;