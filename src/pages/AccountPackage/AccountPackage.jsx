import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PackageHeader from './PackageHeader';
import PackageForm from './PackageForm';
import PackageList from './PackageList';
import packageService from '../../api/packageService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccountPackage = () => {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState({
    name: '',
    icon: '',
    amount: '',
    status: 'Active',
    benefits: [''],
    threshold: '',
    requiredSignal: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug function with enhanced token info
  const getAuthDebugInfo = () => ({
    user: user ? { email: user.email } : null,
    token: {
      exists: !!token,
      length: token?.length || 0,
      start: token?.substring(0, 5) || null,
      end: token?.substring(token?.length - 5) || null
    },
    storage: {
      localStorage: localStorage.getItem('adminToken')?.length ? 'Exists' : 'Empty',
      sessionStorage: sessionStorage.getItem('adminToken')?.length ? 'Exists' : 'Empty'
    },
    authState: {
      isAuthenticated,
      authLoading
    }
  });

  useEffect(() => {
    console.log('Current Auth State:', getAuthDebugInfo());

    const fetchPackages = async () => {
      if (!token) {
        setError('Authentication token not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching packages with token:', token.substring(0, 10) + '...');
        const response = await packageService.getPackages(token);
        setPackages(response.packages || []);
        setError(null);
      } catch (err) {
        console.error('Fetch Error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        setError(`Failed to load packages: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchPackages();
    }
  }, [token, authLoading]);

// Modify the handleAddPackage function
const handleAddPackage = async () => {
  if (!token) {
    setError('No authentication token available');
    return;
  }

  if (!newPackage.name?.trim() || !newPackage.amount) {
    setError('Package name and amount are required');
    return;
  }

  try {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('name', newPackage.name.trim());
    if (newPackage.iconFile) {
      formData.append('icon', newPackage.iconFile); // Append the file directly
    }
    formData.append('amount', parseFloat(newPackage.amount));
    formData.append('status', newPackage.status || 'Active');
    formData.append('benefits', JSON.stringify(newPackage.benefits.filter(b => b.trim() !== '')));
    
    if (newPackage.threshold) formData.append('threshold', parseFloat(newPackage.threshold));
    if (newPackage.requiredSignal) formData.append('requiredSignal', parseFloat(newPackage.requiredSignal));

    let response;
    if (editingId) {
      response = await packageService.updatePackage(editingId, formData, token);
      setPackages(packages.map(p => p._id === editingId ? response.package : p));
    } else {
      response = await packageService.createPackage(formData, token);
      setPackages([response.package, ...packages]);
    }
    
    resetForm();
    setError(null);
  } catch (err) {
    console.error('Save Error:', err);
    setError(`Save failed: ${err.response?.data?.message || err.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleDeletePackage = async (id) => {
    if (!user?.token) {
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      setIsLoading(true);
      await packageService.deletePackage(id, user.token);
      setPackages(packages.filter(p => p._id !== id));
      setError(null);
    } catch (err) {
      console.error('Failed to delete package:', err);
      setError(err.response?.data?.message || 'Failed to delete package. Please try again.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPackage = (pkg) => {
    setNewPackage({
      name: pkg.name,
      icon: pkg.icon || '',
      amount: pkg.amount.toString(),
      status: pkg.status || 'Active',
      benefits: pkg.benefits?.length > 0 
        ? [...pkg.benefits, ''] 
        : [''],
      threshold: pkg.threshold ? pkg.threshold.toString() : '',
      requiredSignal: pkg.requiredSignal ? pkg.requiredSignal.toString() : '',
    });
    setEditingId(pkg._id);
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setNewPackage({
      name: '',
      icon: '',
      amount: '',
      status: 'Active',
      benefits: [''],
      threshold: '',
      requiredSignal: ''
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...newPackage.benefits];
    updatedBenefits[index] = value;
    setNewPackage({...newPackage, benefits: updatedBenefits});
  };

  const addBenefitField = () => {
    setNewPackage({...newPackage, benefits: [...newPackage.benefits, '']});
  };

  const removeBenefitField = (index) => {
    if (newPackage.benefits.length <= 1) return;
    const updatedBenefits = [...newPackage.benefits];
    updatedBenefits.splice(index, 1);
    setNewPackage({...newPackage, benefits: updatedBenefits});
  };

  const toggleStatus = async (id) => {
    if (!user?.token) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await packageService.togglePackageStatus(id, user.token);
      setPackages(packages.map(pkg => 
        pkg._id === id ? response.package : pkg
      ));
      setError(null);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setError(err.response?.data?.message || 'Failed to update status. Please try again.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-4 md:p-6">
      {/* Enhanced Debug Panel */}
     

    <PackageHeader packages={packages} />
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-900 text-blue-100 rounded-md">
          Loading packages...
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 overflow-hidden bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <PackageForm
              newPackage={newPackage}
              setNewPackage={setNewPackage}
              handleBenefitChange={handleBenefitChange}
              addBenefitField={addBenefitField}
              removeBenefitField={removeBenefitField}
              handleAddPackage={handleAddPackage}
              resetForm={resetForm}
              editingId={editingId}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-4">
        <PackageList
          packages={packages}
          setShowCreateForm={setShowCreateForm}
          handleEditPackage={handleEditPackage}
          handleDeletePackage={handleDeletePackage}
          toggleStatus={toggleStatus}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AccountPackage;