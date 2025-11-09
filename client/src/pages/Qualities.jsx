import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaStar, FaSearch, 
  FaFilter, FaSort 
} from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiPackage } from 'react-icons/fi';

export default function Qualities() {
  const [qualities, setQualities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState({
    totalQualities: 0,
    avgRate: 0,
    highestRate: 0,
    lowestRate: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    ratePerMeter: 0,
    description: ''
  });

  useEffect(() => {
    fetchQualities();
    fetchStats();
  }, [sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/qualities/stats');
      const statsData = response.data?.data || {};
      setStats({
        totalQualities: statsData.totalQualities || 0,
        avgRate: statsData.avgRate || 0,
        highestRate: statsData.highestRate || 0,
        lowestRate: statsData.lowestRate || 0
      });
    } catch (error) {
      console.error('Failed to fetch quality stats:', error);
    }
  };

  const fetchQualities = async () => {
    try {
      const response = await api.get('/qualities', {
        params: { sortBy, order: sortOrder }
      });
      const qualitiesData = response.data?.data || response.data;
      setQualities(Array.isArray(qualitiesData) ? qualitiesData : []);
    } catch (error) {
      toast.error('Failed to fetch quality types');
      setQualities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedQuality) {
        await api.put(`/qualities/${selectedQuality._id}`, formData);
        toast.success('Quality type updated successfully');
      } else {
        await api.post('/qualities', formData);
        toast.success('Quality type created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchQualities();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quality type?')) {
      try {
        await api.delete(`/qualities/${id}`);
        toast.success('Quality type deleted successfully');
        fetchQualities();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete quality type');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ratePerMeter: 0,
      description: ''
    });
    setSelectedQuality(null);
  };

  const openEditModal = (quality) => {
    setSelectedQuality(quality);
    setFormData({
      name: quality.name,
      ratePerMeter: quality.ratePerMeter,
      description: quality.description || ''
    });
    setShowModal(true);
  };

  const filteredQualities = qualities.filter(quality =>
    quality.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Quality Types</h1>
            <p className="text-amber-100 text-lg">Define and manage textile quality standards</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-amber-600 px-6 py-3 rounded-lg hover:bg-amber-50 flex items-center gap-2 transition-all shadow-md font-semibold"
          >
            <FaPlus /> Add Quality Type
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Quality Types */}
        <div className="bg-blue-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-blue-600 text-sm font-semibold mb-2">Total Quality Types</p>
              <p className="text-4xl font-bold text-blue-900">
                {stats.totalQualities}
              </p>
            </div>
            <div className="bg-blue-200 p-3 rounded-xl">
              <FiPackage className="text-blue-600 text-2xl" />
            </div>
          </div>
          <p className="text-blue-600 text-sm flex items-center gap-1">
            <FiActivity className="text-xs" />
            All quality standards
          </p>
        </div>

        {/* Average Rate */}
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-green-600 text-sm font-semibold mb-2">Average Rate</p>
              <p className="text-4xl font-bold text-green-900">
                ₹{stats.avgRate.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-200 p-3 rounded-xl">
              <span className="text-green-600 text-2xl font-bold">₹</span>
            </div>
          </div>
          <p className="text-green-600 text-sm flex items-center gap-1">
            <FiActivity className="text-xs" />
            Per meter rate
          </p>
        </div>

        {/* Highest Rate */}
        <div className="bg-purple-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-purple-600 text-sm font-semibold mb-2">Highest Rate</p>
              <p className="text-4xl font-bold text-purple-900">
                ₹{stats.highestRate.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-200 p-3 rounded-xl">
              <FaStar className="text-purple-600 text-2xl" />
            </div>
          </div>
          <p className="text-purple-600 text-sm flex items-center gap-1">
            <FiTrendingUp className="text-xs" />
            Premium quality
          </p>
        </div>

        {/* Lowest Rate */}
        <div className="bg-amber-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-amber-600 text-sm font-semibold mb-2">Lowest Rate</p>
              <p className="text-4xl font-bold text-amber-900">
                ₹{stats.lowestRate.toFixed(2)}
              </p>
            </div>
            <div className="bg-amber-200 p-3 rounded-xl">
              <FaStar className="text-amber-600 text-2xl" />
            </div>
          </div>
          <p className="text-amber-600 text-sm flex items-center gap-1">
            <FiTrendingDown className="text-xs" />
            Economy quality
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quality types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="name">Name</option>
              <option value="ratePerMeter">Rate</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Qualities Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Quality Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Rate per Meter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQualities.map((quality) => (
                <tr key={quality._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span className="font-semibold text-gray-900">{quality.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-green-600">
                      ₹{quality.ratePerMeter.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {quality.description || 'No description'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(quality.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(quality)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(quality._id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredQualities.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FaStar className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No quality types found</h3>
          <p className="text-gray-500">Add a new quality type to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {selectedQuality ? 'Edit Quality Type' : 'Add New Quality Type'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Premium, Standard, Deluxe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate per Meter (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.ratePerMeter}
                  onChange={(e) => setFormData({ ...formData, ratePerMeter: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., 15.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of this quality type..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md font-semibold"
                >
                  {selectedQuality ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
