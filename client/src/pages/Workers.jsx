import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaUser, FaSearch, FaChartBar,
  FaUserTie, FaUserClock, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiActivity } from 'react-icons/fi';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    workerCode: '',
    workerType: 'Permanent',
    shift: 'Day',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers');
      const workersData = response.data?.data || response.data;
      setWorkers(Array.isArray(workersData) ? workersData : []);
    } catch (error) {
      toast.error('Failed to fetch workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedWorker) {
        await api.put(`/workers/${selectedWorker._id}`, formData);
        toast.success('Worker updated successfully');
      } else {
        await api.post('/workers', formData);
        toast.success('Worker created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchWorkers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await api.delete(`/workers/${id}`);
        toast.success('Worker deleted successfully');
        fetchWorkers();
      } catch (error) {
        toast.error('Failed to delete worker');
      }
    }
  };

  const viewPerformance = async (worker) => {
    setSelectedWorker(worker);
    setShowPerformanceModal(true);
    setPerformance(null); // Reset performance data
    try {
      const response = await api.get(`/workers/${worker._id}/performance`);
      const data = response.data?.data || response.data;
      
      // Transform the data to match modal expectations
      const performanceData = {
        totalProductions: response.data?.count || 0,
        totalMeters: response.data?.totals?.totalMeters || 0,
        totalEarnings: response.data?.totals?.totalEarnings || 0,
        recentProductions: Array.isArray(data) ? data : []
      };
      
      setPerformance(performanceData);
    } catch (error) {
      console.error('Performance fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch performance data');
      setShowPerformanceModal(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      workerCode: '',
      workerType: 'Permanent',
      shift: 'Day',
      phone: '',
      address: ''
    });
    setSelectedWorker(null);
  };

  const openEditModal = (worker) => {
    setSelectedWorker(worker);
    setFormData({
      name: worker.name,
      workerCode: worker.workerCode,
      workerType: worker.workerType,
      shift: worker.shift,
      phone: worker.phone || '',
      address: worker.address || ''
    });
    setShowModal(true);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.workerCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || worker.workerType === typeFilter;
    const matchesShift = shiftFilter === 'all' || worker.shift === shiftFilter;
    return matchesSearch && matchesType && matchesShift;
  });

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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <FiUsers className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Workers Management
              </h1>
              <p className="text-green-100 mt-1">Manage your workforce and track performance</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-green-600 px-6 py-2.5 rounded-lg hover:bg-green-50 flex items-center gap-2 transition-all shadow-lg font-medium"
          >
            <FaPlus /> Add Worker
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-semibold">Total Workers</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{workers.length}</p>
              <p className="text-xs text-blue-600 mt-1">All registered workers</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <FiUsers className="text-blue-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-semibold">Permanent</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {workers.filter(w => w.workerType === 'Permanent').length}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FiTrendingUp className="text-green-600" size={12} />
                <p className="text-xs text-green-600">Full-time workers</p>
              </div>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <FaUserTie className="text-green-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-semibold">Temporary</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {workers.filter(w => w.workerType === 'Temporary').length}
              </p>
              <p className="text-xs text-orange-600 mt-1">Contract workers</p>
            </div>
            <div className="bg-orange-200 p-3 rounded-lg">
              <FaUserClock className="text-orange-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-semibold">Day Shift</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {workers.filter(w => w.shift === 'Day' || w.shift === 'Both').length}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FiActivity className="text-purple-600" size={12} />
                <p className="text-xs text-purple-600">Active day workers</p>
              </div>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <FaCheckCircle className="text-purple-700 text-2xl" />
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
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Permanent">Permanent</option>
            <option value="Temporary">Temporary</option>
          </select>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Shifts</option>
            <option value="Day">Day Shift</option>
            <option value="Night">Night Shift</option>
            <option value="Both">Both Shifts</option>
            <option value="None">Not Assigned</option>
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <div key={worker._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUser className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{worker.name}</h3>
                  <p className="text-sm text-gray-500">Code: {worker.workerCode}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${worker.workerType === 'Permanent' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {worker.workerType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Shift:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${worker.shift === 'Day' ? 'bg-yellow-100 text-yellow-800' : 
                    worker.shift === 'Night' ? 'bg-blue-100 text-blue-800' : 
                    worker.shift === 'Both' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {worker.shift}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => viewPerformance(worker)}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <FaChartBar /> Performance
              </button>
              <button
                onClick={() => openEditModal(worker)}
                className="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(worker._id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FaUser className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No workers found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new worker</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {selectedWorker ? 'Edit Worker' : 'Add New Worker'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worker Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Rajesh Kumar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worker Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.workerCode}
                  onChange={(e) => setFormData({ ...formData, workerCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., W001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worker Type
                </label>
                <select
                  value={formData.workerType}
                  onChange={(e) => setFormData({ ...formData, workerType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                  <option value="Both">Both Shifts</option>
                  <option value="None">Not Assigned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                  rows="2"
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
                  {selectedWorker ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Performance - {selectedWorker?.name}
            </h2>
            {performance ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 font-medium">Total Productions</p>
                    <p className="text-2xl font-bold text-blue-600">{performance.totalProductions}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 font-medium">Total Meters</p>
                    <p className="text-2xl font-bold text-green-600">
                      {parseFloat(performance.totalMeters || 0).toFixed(2)}m
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{parseFloat(performance.totalEarnings || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Recent Productions</h3>
                  {performance.recentProductions && performance.recentProductions.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {performance.recentProductions.map((prod) => (
                        <div key={prod._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(prod.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {prod.machine?.machineName || prod.machine?.machineCode || 'N/A'} - {prod.shift} shift
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {prod.qualityType?.name || 'N/A'} - Taka #{prod.taka?.takaNumber || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {parseFloat(prod.meters || prod.metersProduced || 0).toFixed(2)}m
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                              ₹{parseFloat(prod.earnings || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No production records found for this period</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <button
              onClick={() => setShowPerformanceModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
