import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaBox, FaSearch, FaCheckCircle,
  FaClock, FaExclamationCircle, FaTimesCircle
} from 'react-icons/fa';
import { FiTrendingUp, FiActivity, FiPackage } from 'react-icons/fi';

export default function Takas() {
  const [takas, setTakas] = useState([]);
  const [machines, setMachines] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTaka, setSelectedTaka] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    takaNumber: '',
    machine: '',
    qualityType: '',
    targetMeters: 0,
    ratePerMeter: 0
  });

  useEffect(() => {
    fetchTakas();
    fetchMachines();
    fetchQualities();
  }, []);

  const fetchTakas = async () => {
    try {
      const response = await api.get('/takas');
      const takasData = response.data?.data || response.data;
      setTakas(Array.isArray(takasData) ? takasData : []);
    } catch (error) {
      toast.error('Failed to fetch takas');
      setTakas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQualities = async () => {
    try {
      const response = await api.get('/qualities');
      const qualitiesData = response.data?.data || response.data;
      setQualities(Array.isArray(qualitiesData) ? qualitiesData : []);
    } catch (error) {
      console.error('Failed to fetch qualities');
      setQualities([]);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await api.get('/machines');
      const machinesData = response.data?.data || response.data;
      setMachines(Array.isArray(machinesData) ? machinesData : []);
    } catch (error) {
      console.error('Failed to fetch machines');
      setMachines([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTaka) {
        await api.put(`/takas/${selectedTaka._id}`, formData);
        toast.success('Taka updated successfully');
      } else {
        await api.post('/takas', formData);
        toast.success('Taka created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTakas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this taka?')) {
      try {
        await api.delete(`/takas/${id}`);
        toast.success('Taka deleted successfully');
        fetchTakas();
      } catch (error) {
        toast.error('Failed to delete taka');
      }
    }
  };

  const handleCompleteTaka = async (id) => {
    if (window.confirm('Mark this taka as completed?')) {
      try {
        await api.put(`/takas/${id}/complete`);
        toast.success('Taka marked as completed');
        fetchTakas();
      } catch (error) {
        toast.error('Failed to complete taka');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      takaNumber: '',
      machine: '',
      qualityType: '',
      targetMeters: 0,
      ratePerMeter: 0
    });
    setSelectedTaka(null);
  };

  const openEditModal = (taka) => {
    setSelectedTaka(taka);
    setFormData({
      takaNumber: taka.takaNumber,
      machine: taka.machine?._id || '',
      qualityType: taka.qualityType?._id || '',
      targetMeters: taka.targetMeters || 0,
      ratePerMeter: taka.ratePerMeter || 0
    });
    setShowModal(true);
  };

  const filteredTakas = takas.filter(taka => {
    const matchesSearch = taka.takaNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || taka.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateProgress = (taka) => {
    if (!taka.targetMeters) return 0;
    return Math.min((taka.totalMeters / taka.targetMeters) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <FiPackage className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Takas Management
              </h1>
              <p className="text-purple-100 mt-1">Track and manage production units</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-purple-600 px-6 py-2.5 rounded-lg hover:bg-purple-50 flex items-center gap-2 transition-all shadow-lg font-medium"
          >
            <FaPlus /> Add Taka
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-semibold">Total Takas</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{takas.length}</p>
              <p className="text-xs text-blue-600 mt-1">All production units</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <FiPackage className="text-blue-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-semibold">Active Takas</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {takas.filter(t => t.status === 'Active').length}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FiActivity className="text-green-600" size={12} />
                <p className="text-xs text-green-600">In production</p>
              </div>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <FiActivity className="text-green-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-semibold">Completed</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {takas.filter(t => t.status === 'Completed').length}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FaCheckCircle className="text-purple-600" size={12} />
                <p className="text-xs text-purple-600">Finished units</p>
              </div>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <FaCheckCircle className="text-purple-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {takas.filter(t => t.status === 'Pending').length}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FaClock className="text-orange-600" size={12} />
                <p className="text-xs text-orange-600">Awaiting start</p>
              </div>
            </div>
            <div className="bg-orange-200 p-3 rounded-lg">
              <FaClock className="text-orange-700 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search takas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Takas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTakas.map((taka) => {
          const progress = calculateProgress(taka);
          return (
            <div key={taka._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{taka.takaNumber}</h3>
                  <p className="text-sm text-gray-500">{taka.qualityType?.qualityName || 'N/A'}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${taka.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    taka.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {taka.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{taka.totalMeters || 0} / {taka.targetMeters} meters</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate per meter:</span>
                  <span className="font-medium">₹{taka.ratePerMeter || 0}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-semibold text-green-600">₹{(taka.totalEarnings || 0).toFixed(2)}</span>
                </div>

                {taka.startDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium">{new Date(taka.startDate).toLocaleDateString()}</span>
                  </div>
                )}

                {taka.endDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">{new Date(taka.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                {taka.status === 'Active' && (
                  <button
                    onClick={() => handleCompleteTaka(taka._id)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <FaCheckCircle /> Complete
                  </button>
                )}
                <button
                  onClick={() => openEditModal(taka)}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(taka._id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTakas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FaBox className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No takas found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new taka</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {selectedTaka ? 'Edit Taka' : 'Add New Taka'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taka Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.takaNumber}
                  onChange={(e) => setFormData({ ...formData, takaNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., T001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine
                </label>
                <select
                  required
                  value={formData.machine}
                  onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Machine</option>
                  {machines.filter(m => m.status === 'Active').map(machine => (
                    <option key={machine._id} value={machine._id}>
                      {machine.machineCode} - {machine.machineName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Type
                </label>
                <select
                  required
                  value={formData.qualityType}
                  onChange={(e) => {
                    const selectedQuality = qualities.find(q => q._id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      qualityType: e.target.value,
                      ratePerMeter: selectedQuality?.ratePerMeter || 0
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Quality</option>
                  {qualities.map(quality => (
                    <option key={quality._id} value={quality._id}>
                      {quality.qualityName} (₹{quality.ratePerMeter}/meter)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Per Meter
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.ratePerMeter}
                  onChange={(e) => setFormData({ ...formData, ratePerMeter: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Rate per meter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Meters
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.targetMeters}
                  onChange={(e) => setFormData({ ...formData, targetMeters: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1000"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedTaka ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
