// pages/admin/SignalPackage.jsx
import { useState, useEffect } from 'react';
import SignalPackageHeader from './SignalPackageHeader';
import SignalPackageForm from './SignalPackageForm';
import SignalPackageList from './SignalPackageList';
import signalPackageService from '../../api/signalPackageService';
import { useAuth } from '../../context/AuthContext';

const SignalPackage = () => {
  const { token } = useAuth();

  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState({
    name: '',
    strength: '',
    amount: '',
    duration: '', 
    benefits: [''],
    icon: '',
    active: true
  });

  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH PACKAGES ================= */

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await signalPackageService.getPackages(token);
        setPackages(res.packages || []);
      } catch (err) {
        setError('Failed to load signal packages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [token]);

  /* ================= CREATE / UPDATE ================= */

  const handleAddPackage = async () => {
    try {
      const formData = new FormData();

      formData.append('name', newPackage.name);
      formData.append('strength', Number(newPackage.strength));
      formData.append('amount', Number(newPackage.amount));
      formData.append('duration', newPackage.duration);   
      formData.append('benefits', JSON.stringify(newPackage.benefits));

      if (newPackage.iconFile) {
        formData.append('icon', newPackage.iconFile);
      }

      const response = editingId
        ? await signalPackageService.updatePackage(editingId, formData, token)
        : await signalPackageService.createPackage(formData, token);

      if (editingId) {
        setPackages(packages.map(p => p._id === editingId ? response.package : p));
      } else {
        setPackages([response.package, ...packages]);
      }

      resetForm();

    } catch (err) {
      console.error('Create/update signal package error:', err);
      setError(err.response?.data?.message || 'Failed to save signal package');
    }
  };

  /* ================= DELETE ================= */

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this signal package?')) return;

    try {
      await signalPackageService.deletePackage(id, token);
      setPackages(packages.filter(p => p._id !== id));
    } catch {
      setError('Failed to delete package');
    }
  };

  /* ================= EDIT ================= */

  const handleEditPackage = (pkg) => {
    setNewPackage({
      name: pkg.name,
      strength: pkg.strength?.toString() || '',
      amount: pkg.amount.toString(),
      duration: pkg.duration || '',
      benefits: pkg.benefits?.length ? [...pkg.benefits, ''] : [''],
      icon: pkg.icon || ''
    });

    setEditingId(pkg._id);
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setNewPackage({
      name: '',
      strength: '',
      amount: '',
      duration: '',
      benefits: [''],
      icon: ''
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-4 md:p-6">

      <SignalPackageHeader packages={packages} />

      {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">{error}</div>}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg w-full max-w-2xl">
            <SignalPackageForm
              newPackage={newPackage}
              setNewPackage={setNewPackage}
              handleAddPackage={handleAddPackage}
              resetForm={resetForm}
              editingId={editingId}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <SignalPackageList
        packages={packages}
        setShowCreateForm={setShowCreateForm}
        handleEditPackage={handleEditPackage}
        handleDeletePackage={handleDeletePackage}
        isLoading={isLoading}
      />

    </div>
  );
};

export default SignalPackage;


