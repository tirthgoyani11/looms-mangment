import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaHistory, FaCog, FaSearch, 
  FaTimes, FaCheckCircle, FaExclamationCircle, FaChartLine,
  FaUsers, FaFilter, FaSort
} from 'react-icons/fa';
import { FiActivity, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [productionHistory, setProductionHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [formData, setFormData] = useState({
    machineName: '',
    machineCode: '',
    status: 'Active',
    dayShiftWorker: '',
    nightShiftWorker: ''
  });

  useEffect(() => {
    fetchMachines();
    fetchWorkers();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await api.get('/machines');
      const machinesData = response.data?.data || response.data;
      setMachines(Array.isArray(machinesData) ? machinesData : []);
    } catch (error) {
      toast.error('Failed to fetch machines');
      setMachines([]);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMachine) {
        await api.put(`/machines/${selectedMachine._id}`, formData);
        toast.success('Machine updated successfully');
      } else {
        await api.post('/machines', formData);
        toast.success('Machine created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchMachines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        await api.delete(`/machines/${id}`);
        toast.success('Machine deleted successfully');
        fetchMachines();
      } catch (error) {
        toast.error('Failed to delete machine');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMachines.length === 0) {
      toast.error('Please select machines to delete');
      return;
    }
    if (window.confirm(`Delete ${selectedMachines.length} machines?`)) {
      try {
        await Promise.all(selectedMachines.map(id => api.delete(`/machines/${id}`)));
        toast.success('Machines deleted successfully');
        setSelectedMachines([]);
        fetchMachines();
      } catch (error) {
        toast.error('Failed to delete machines');
      }
    }
  };

  const handleAssignWorker = async (machineId, shift, workerId) => {
    try {
      await api.put(`/machines/${machineId}/assign-worker`, { 
        shift, 
        workerId: workerId || null 
      });
      toast.success('Worker assigned successfully');
      fetchMachines();
    } catch (error) {
      toast.error('Failed to assign worker');
    }
  };

  const viewProductionHistory = async (machine) => {
    setSelectedMachine(machine);
    setShowHistoryModal(true);
    try {
      const response = await api.get(`/machines/${machine._id}/production-history`);
      const historyData = response.data?.data || response.data;
      setProductionHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      toast.error('Failed to fetch production history');
      setProductionHistory([]);
    }
  };

  const resetForm = () => {
    setFormData({
      machineName: '',
      machineCode: '',
      status: 'Active',
      dayShiftWorker: '',
      nightShiftWorker: ''
    });
    setSelectedMachine(null);
  };

  const openEditModal = (machine) => {
    setSelectedMachine(machine);
    setFormData({
      machineName: machine.machineName,
      machineCode: machine.machineCode,
      status: machine.status,
      dayShiftWorker: machine.dayShiftWorker?._id || '',
      nightShiftWorker: machine.nightShiftWorker?._id || ''
    });
    setShowModal(true);
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.machineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.machineCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectMachine = (id) => {
    setSelectedMachines(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMachines.length === filteredMachines.length) {
      setSelectedMachines([]);
    } else {
      setSelectedMachines(filteredMachines.map(m => m._id));
    }
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <FaCog className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Machines Management
              </h1>
              <p className="text-blue-100 mt-1">Manage your looms and production machines</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-50 flex items-center gap-2 transition-all shadow-lg font-medium"
          >
            <FaPlus /> Add Machine
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-semibold">Total Machines</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{machines.length}</p>
              <p className="text-xs text-blue-600 mt-1">All registered machines</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <FaCog className="text-blue-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-semibold">Active Machines</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {machines.filter(m => m.status === 'Active').length}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FiTrendingUp className="text-green-600" size={12} />
                <p className="text-xs text-green-600">Currently running</p>
              </div>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <FaCheckCircle className="text-green-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-sm font-semibold">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {machines.filter(m => m.status === 'Maintenance').length}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Under maintenance</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-lg">
              <FaExclamationCircle className="text-yellow-700 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-semibold">Inactive</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {machines.filter(m => m.status === 'Inactive').length}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FiTrendingDown className="text-red-600" size={12} />
                <p className="text-xs text-red-600">Not operational</p>
              </div>
            </div>
            <div className="bg-red-200 p-3 rounded-lg">
              <FaCog className="text-red-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
            <option value="Broken">Broken</option>
          </select>
          {selectedMachines.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FaTrash /> Delete Selected ({selectedMachines.length})
            </button>
          )}
        </div>
      </div>

      {/* Machines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMachines.length === filteredMachines.length && filteredMachines.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Machine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Day Shift Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Night Shift Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                        <FaCog className="text-blue-600 text-6xl animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Machines Found</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your filters to see more results.'
                          : 'Get started by adding your first machine to the system.'}
                      </p>
                      {!searchTerm && statusFilter === 'all' && (
                        <button
                          onClick={() => {
                            resetForm();
                            setShowModal(true);
                          }}
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <FaPlus /> Add Your First Machine
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMachines.map((machine) => (
                <tr key={machine._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedMachines.includes(machine._id)}
                      onChange={() => toggleSelectMachine(machine._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{machine.machineName}</div>
                      <div className="text-sm text-gray-500">Code: {machine.machineCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${machine.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        machine.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                        machine.status === 'Broken' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {machine.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={machine.dayShiftWorker?._id || ''}
                      onChange={(e) => handleAssignWorker(machine._id, 'day', e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Not Assigned</option>
                      {workers.filter(w => w.shift === 'Day' || w.shift === 'Both').map(worker => (
                        <option key={worker._id} value={worker._id}>
                          {worker.name} ({worker.workerCode})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={machine.nightShiftWorker?._id || ''}
                      onChange={(e) => handleAssignWorker(machine._id, 'night', e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Not Assigned</option>
                      {workers.filter(w => w.shift === 'Night' || w.shift === 'Both').map(worker => (
                        <option key={worker._id} value={worker._id}>
                          {worker.name} ({worker.workerCode})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewProductionHistory(machine)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="View History"
                      >
                        <FaHistory />
                      </button>
                      <button
                        onClick={() => openEditModal(machine)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(machine._id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {selectedMachine ? 'Edit Machine' : 'Add New Machine'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.machineName}
                  onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Loom 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.machineCode}
                  onChange={(e) => setFormData({ ...formData, machineCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., M001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Broken">Broken</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Shift Worker
                </label>
                <select
                  value={formData.dayShiftWorker}
                  onChange={(e) => setFormData({ ...formData, dayShiftWorker: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Not Assigned</option>
                  {workers.filter(w => w.shift === 'Day' || w.shift === 'Both').map(worker => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name} ({worker.workerCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Night Shift Worker
                </label>
                <select
                  value={formData.nightShiftWorker}
                  onChange={(e) => setFormData({ ...formData, nightShiftWorker: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Not Assigned</option>
                  {workers.filter(w => w.shift === 'Night' || w.shift === 'Both').map(worker => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name} ({worker.workerCode})
                    </option>
                  ))}
                </select>
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
                  {selectedMachine ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Production History - {selectedMachine?.name}
            </h2>
            {productionHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No production history available</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Productions</p>
                    <p className="text-2xl font-bold text-blue-600">{productionHistory.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Meters</p>
                    <p className="text-2xl font-bold text-green-600">
                      {productionHistory.reduce((sum, p) => sum + p.meters, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{productionHistory.reduce((sum, p) => sum + p.totalEarnings, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Worker</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Shift</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Meters</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quality</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {productionHistory.map((prod) => (
                      <tr key={prod._id}>
                        <td className="px-4 py-2 text-sm">
                          {new Date(prod.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">{prod.worker?.name}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            prod.shift === 'day' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {prod.shift}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">{prod.meters}</td>
                        <td className="px-4 py-2 text-sm">{prod.taka?.quality?.name}</td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">
                          ₹{prod.totalEarnings.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => setShowHistoryModal(false)}
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
