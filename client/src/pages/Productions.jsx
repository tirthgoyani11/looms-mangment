import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FaPlus, FaCalendar, FaCog, FaUser, FaBox,
  FaFilter, FaSort
} from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiPackage } from 'react-icons/fi';

export default function Productions() {
  const [productions, setProductions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [takas, setTakas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalProductions: 0,
    today: { totalCount: 0, totalMeters: 0, totalEarnings: 0 },
    month: { totalCount: 0, totalMeters: 0, totalEarnings: 0 },
    allTime: { totalMeters: 0, totalEarnings: 0, avgMeters: 0 }
  });
  const [formData, setFormData] = useState({
    machine: '',
    worker: '',
    taka: '',
    qualityType: '',
    shift: 'Day',
    metersProduced: 0,
    ratePerMeter: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [calculatedEarnings, setCalculatedEarnings] = useState(0);

  useEffect(() => {
    fetchProductions();
    fetchMachines();
    fetchWorkers();
    fetchTakas();
    fetchStats();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    calculateEarnings();
  }, [formData.taka, formData.metersProduced, takas]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/productions/stats');
      const statsData = response.data?.data || {};
      setStats({
        totalProductions: statsData.totalProductions || 0,
        today: statsData.today || { totalCount: 0, totalMeters: 0, totalEarnings: 0 },
        month: statsData.month || { totalCount: 0, totalMeters: 0, totalEarnings: 0 },
        allTime: statsData.allTime || { totalMeters: 0, totalEarnings: 0, avgMeters: 0 }
      });
    } catch (error) {
      console.error('Failed to fetch production stats:', error);
    }
  };

  const fetchProductions = async () => {
    try {
      const response = await api.get('/productions', {
        params: { sortBy, order: sortOrder }
      });
      const productionsData = response.data?.data || response.data;
      setProductions(Array.isArray(productionsData) ? productionsData : []);
    } catch (error) {
      toast.error('Failed to fetch productions');
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await api.get('/machines');
      const machinesData = response.data?.data || response.data;
      const data = Array.isArray(machinesData) ? machinesData : [];
      setMachines(data.filter(m => m.status === 'Active'));
    } catch (error) {
      console.error('Failed to fetch machines');
      setMachines([]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers');
      const workersData = response.data?.data || response.data;
      setWorkers(Array.isArray(workersData) ? workersData : []);
    } catch (error) {
      console.error('Failed to fetch workers');
      setWorkers([]);
    }
  };

  const fetchTakas = async () => {
    try {
      const response = await api.get('/takas');
      const takasData = response.data?.data || response.data;
      const data = Array.isArray(takasData) ? takasData : [];
      setTakas(data.filter(t => t.status === 'Active'));
    } catch (error) {
      console.error('Failed to fetch takas');
      setTakas([]);
    }
  };

  const calculateEarnings = () => {
    if (formData.taka && formData.metersProduced) {
      const selectedTaka = takas.find(t => t._id === formData.taka);
      if (selectedTaka) {
        const earnings = formData.metersProduced * (selectedTaka.ratePerMeter || 0);
        setCalculatedEarnings(earnings);
        setFormData(prev => ({ ...prev, ratePerMeter: selectedTaka.ratePerMeter || 0 }));
      }
    } else {
      setCalculatedEarnings(0);
    }
  };

  const handleMachineChange = (machineId) => {
    const machine = machines.find(m => m._id === machineId);
    const selectedTaka = takas.find(t => t.machine?._id === machineId && t.status === 'Active');
    
    setFormData({
      ...formData,
      machine: machineId,
      taka: selectedTaka?._id || '',
      qualityType: selectedTaka?.qualityType?._id || selectedTaka?.qualityType || '',
      ratePerMeter: selectedTaka?.ratePerMeter || 0,
      worker: formData.shift === 'Day' ? machine?.dayShiftWorker?._id || '' : machine?.nightShiftWorker?._id || ''
    });
  };

  const handleShiftChange = (shift) => {
    const machine = machines.find(m => m._id === formData.machine);
    setFormData({
      ...formData,
      shift,
      worker: shift === 'Day' ? machine?.dayShiftWorker?._id || '' : machine?.nightShiftWorker?._id || ''
    });
  };

  const handleTakaChange = (takaId) => {
    const selectedTaka = takas.find(t => t._id === takaId);
    setFormData({
      ...formData,
      taka: takaId,
      qualityType: selectedTaka?.qualityType?._id || selectedTaka?.qualityType || '',
      ratePerMeter: selectedTaka?.ratePerMeter || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up formData - remove empty qualityType if present
      const submitData = { ...formData };
      if (!submitData.qualityType) {
        delete submitData.qualityType;
      }
      
      await api.post('/productions', submitData);
      toast.success('Production recorded successfully');
      setShowModal(false);
      resetForm();
      fetchProductions();
      fetchTakas(); // Refresh takas to show updated progress
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record production');
    }
  };

  const resetForm = () => {
    setFormData({
      machine: '',
      worker: '',
      taka: '',
      qualityType: '',
      shift: 'Day',
      metersProduced: 0,
      ratePerMeter: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setCalculatedEarnings(0);
  };

  const getWorkersByShift = () => {
    return workers.filter(w => w.shift === formData.shift || w.shift === 'Both');
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
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Production Recording</h1>
            <p className="text-green-100 text-lg">Record daily production and track performance</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 flex items-center gap-2 transition-all shadow-md font-semibold"
          >
            <FaPlus /> Record Production
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Productions */}
        <div className="bg-blue-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-blue-600 text-sm font-semibold mb-2">Total Productions</p>
              <p className="text-4xl font-bold text-blue-900">
                {stats.totalProductions}
              </p>
            </div>
            <div className="bg-blue-200 p-3 rounded-xl">
              <FiPackage className="text-blue-600 text-2xl" />
            </div>
          </div>
          <p className="text-blue-600 text-sm flex items-center gap-1">
            <FiActivity className="text-xs" />
            All recorded units
          </p>
        </div>

        {/* Total Meters */}
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-green-600 text-sm font-semibold mb-2">Total Meters</p>
              <p className="text-4xl font-bold text-green-900">
                {stats.allTime.totalMeters?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-green-200 p-3 rounded-xl">
              <span className="text-green-600 text-2xl font-bold">M</span>
            </div>
          </div>
          <p className="text-green-600 text-sm flex items-center gap-1">
            <FiActivity className="text-xs" />
            All-time production
          </p>
        </div>

        {/* Total Earnings */}
        <div className="bg-purple-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-purple-600 text-sm font-semibold mb-2">Total Earnings</p>
              <p className="text-4xl font-bold text-purple-900">
                ₹{stats.allTime.totalEarnings?.toFixed(0) || '0'}
              </p>
            </div>
            <div className="bg-purple-200 p-3 rounded-xl">
              <span className="text-purple-600 text-2xl font-bold">₹</span>
            </div>
          </div>
          <p className="text-purple-600 text-sm flex items-center gap-1">
            <FiTrendingUp className="text-xs" />
            Revenue generated
          </p>
        </div>

        {/* Average per Production */}
        <div className="bg-orange-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-orange-600 text-sm font-semibold mb-2">Avg per Production</p>
              <p className="text-4xl font-bold text-orange-900">
                {stats.allTime.avgMeters?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-orange-200 p-3 rounded-xl">
              <FaCalendar className="text-orange-600 text-2xl" />
            </div>
          </div>
          <p className="text-orange-600 text-sm flex items-center gap-1">
            <FiActivity className="text-xs" />
            Meters per unit
          </p>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="date">Date</option>
              <option value="metersProduced">Meters</option>
              <option value="earnings">Earnings</option>
              <option value="shift">Shift</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{productions.length}</span> productions
          </div>
        </div>
      </div>

      {/* Recent Productions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Productions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Machine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Taka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Meters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative w-32 h-32 mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full animate-pulse"></div>
                        <FaCalendar className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 text-6xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Productions Yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        Start recording daily production to track performance and calculate earnings.
                      </p>
                      <button
                        onClick={() => {
                          resetForm();
                          setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                      >
                        <FaPlus /> Record Your First Production
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                productions.slice(0, 20).map((production) => (
                <tr key={production._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(production.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaCog className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {production.machine?.machineName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-green-600" />
                      <span className="text-sm text-gray-900">
                        {production.worker?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaBox className="text-purple-600" />
                      <span className="text-sm text-gray-900">
                        {production.taka?.takaNumber || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${production.shift === 'Day' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {production.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {production.metersProduced || 0} meters
                      {production.meters}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {production.taka?.qualityType?.name || production.qualityType?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-600">
                      ₹{(production.earnings || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {productions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FaCalendar className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No productions recorded</h3>
          <p className="text-gray-500">Start recording production to track performance</p>
        </div>
      )}

      {/* Record Production Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Record Production</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift
                </label>
                <select
                  required
                  value={formData.shift}
                  onChange={(e) => handleShiftChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine
                </label>
                <select
                  required
                  value={formData.machine}
                  onChange={(e) => handleMachineChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Machine</option>
                  {machines.map(machine => (
                    <option key={machine._id} value={machine._id}>
                      {machine.machineName} ({machine.machineCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worker
                </label>
                <select
                  required
                  value={formData.worker}
                  onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Worker</option>
                  {getWorkersByShift().map(worker => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name} ({worker.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taka
                </label>
                <select
                  required
                  value={formData.taka}
                  onChange={(e) => handleTakaChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Taka</option>
                  {takas.map(taka => (
                    <option key={taka._id} value={taka._id}>
                      {taka.takaNumber || 'N/A'} - {taka.qualityType?.name || 'N/A'} (₹{taka.qualityType?.ratePerMeter || 0}/meter)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meters Produced
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.metersProduced}
                  onChange={(e) => setFormData({ ...formData, metersProduced: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 100.5"
                />
              </div>

              {/* Calculated Earnings Display */}
              {calculatedEarnings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Calculated Earnings:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{calculatedEarnings.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-md font-semibold"
                >
                  Record Production
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
