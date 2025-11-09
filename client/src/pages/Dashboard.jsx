import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTool, FiUsers, FiPackage, FiTrendingUp, FiPlus, 
  FiSun, FiMoon, FiFileText, FiRefreshCw, FiFilter,
  FiArrowUp, FiArrowDown, FiCalendar
} from 'react-icons/fi';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topPerformers, setTopPerformers] = useState({ workers: [], machines: [] });
  const [qualityDistribution, setQualityDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, performersRes, qualityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/monthly-trends'),
        api.get('/dashboard/top-performers'),
        api.get('/dashboard/quality-distribution')
      ]);

      setStats(statsRes.data.data);
      setMonthlyTrends(trendsRes.data.data);
      setTopPerformers(performersRes.data.data);
      setQualityDistribution(qualityRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FiTool className="text-blue-600 text-2xl animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <FiTrendingUp className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              <p className="text-blue-100 mt-1">Monitor your looms production in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <FiCalendar className="text-blue-100" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="today" className="bg-blue-600">Today</option>
                <option value="week" className="bg-blue-600">This Week</option>
                <option value="month" className="bg-blue-600">This Month</option>
                <option value="year" className="bg-blue-600">This Year</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 font-medium shadow-lg"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Machines"
          value={stats?.machines.total || 0}
          subtitle={`${stats?.machines.active || 0} Active`}
          icon={FiTool}
          color="blue"
          trend="up"
          trendValue="12"
        />
        <StatCard
          title="Total Workers"
          value={stats?.workers.total || 0}
          subtitle="Registered"
          icon={FiUsers}
          color="green"
          trend="up"
          trendValue="8"
        />
        <StatCard
          title="Active Takas"
          value={stats?.takas.active || 0}
          subtitle="In Production"
          icon={FiPackage}
          color="yellow"
          trend="down"
          trendValue="3"
        />
        <StatCard
          title="Today's Production"
          value={`${parseFloat(stats?.todayProduction.total.meters || 0).toFixed(2)}m`}
          subtitle={`₹${parseFloat(stats?.todayProduction.total.earnings || 0).toFixed(2)}`}
          icon={FiTrendingUp}
          color="purple"
          trend="up"
          trendValue="15"
        />
      </div>

      {/* Shift Comparison & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Today's Shift Production</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="space-y-4">
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg shadow-sm">
                  <FiSun className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Day Shift</p>
                  <p className="text-xl font-bold text-gray-900">
                    {parseFloat(stats?.todayProduction.day.totalMeters || 0).toFixed(2)}m
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {stats?.todayProduction.day.productionCount || 0} productions
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right ml-10 sm:ml-0">
                <p className="text-xs text-gray-500">Earnings</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{parseFloat(stats?.todayProduction.day.totalEarnings || 0).toFixed(2)}
                </p>
                <div className="flex items-center sm:justify-end gap-1 mt-0.5">
                  <FiArrowUp className="text-green-500" size={10} />
                  <span className="text-xs text-green-600 font-medium">8.5%</span>
                </div>
              </div>
            </div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg shadow-sm">
                  <FiMoon className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Night Shift</p>
                  <p className="text-xl font-bold text-gray-900">
                    {parseFloat(stats?.todayProduction.night.totalMeters || 0).toFixed(2)}m
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {stats?.todayProduction.night.productionCount || 0} productions
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right ml-10 sm:ml-0">
                <p className="text-xs text-gray-500">Earnings</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{parseFloat(stats?.todayProduction.night.totalEarnings || 0).toFixed(2)}
                </p>
                <div className="flex items-center sm:justify-end gap-1 mt-0.5">
                  <FiArrowUp className="text-green-500" size={10} />
                  <span className="text-xs text-green-600 font-medium">6.2%</span>
                </div>
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="pt-3 border-t border-gray-200 mt-3">
              <div className="flex items-center justify-between text-sm py-1.5">
                <span className="text-gray-600 font-medium">Total Production</span>
                <span className="text-base font-bold text-gray-900">
                  {parseFloat((stats?.todayProduction.day.totalMeters || 0) + (stats?.todayProduction.night.totalMeters || 0)).toFixed(2)}m
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5">
                <span className="text-gray-600 font-medium">Total Earnings</span>
                <span className="text-base font-bold text-green-600">
                  ₹{parseFloat((stats?.todayProduction.day.totalEarnings || 0) + (stats?.todayProduction.night.totalEarnings || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionButton
              to="/productions"
              icon={FiPlus}
              label="Record Production"
              color="blue"
            />
            <QuickActionButton
              to="/machines"
              icon={FiUsers}
              label="Assign Workers"
              color="green"
            />
            <QuickActionButton
              to="/takas"
              icon={FiPackage}
              label="Create Taka"
              color="yellow"
            />
            <QuickActionButton
              to="/reports"
              icon={FiFileText}
              label="View Reports"
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Production Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="meters" 
              stroke="#3b82f6" 
              fill="#93c5fd" 
              name="Meters Produced" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers and Quality Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Workers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Workers</h3>
          <div className="space-y-3">
            {topPerformers.workers.slice(0, 5).map((worker, index) => (
              <div key={worker.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{worker.name}</p>
                    <p className="text-sm text-gray-600">{worker.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">{worker.meters}m</p>
                  <p className="text-sm text-green-600 font-semibold">₹{worker.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quality Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={qualityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="meters"
              >
                {qualityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-amber-500 to-orange-600',
    purple: 'from-purple-500 to-pink-600'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-amber-50',
    purple: 'bg-purple-50'
  };

  const iconBgClasses = {
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
    green: 'bg-gradient-to-br from-green-400 to-emerald-600',
    yellow: 'bg-gradient-to-br from-amber-400 to-orange-600',
    purple: 'bg-gradient-to-br from-purple-400 to-pink-600'
  };

  return (
    <div className={`${bgColorClasses[color]} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgClasses[color]} shadow-md`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend === 'up' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
            {trendValue}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-sm text-gray-600 mt-2 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

const QuickActionButton = ({ to, icon: Icon, label, color }) => {
  const gradientClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-amber-500 to-orange-600',
    purple: 'from-purple-500 to-pink-600'
  };

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br ${gradientClasses[color]} text-white hover:shadow-lg transition-all transform hover:-translate-y-1`}
    >
      <Icon size={32} className="mb-2" />
      <span className="text-sm font-semibold text-center">{label}</span>
    </Link>
  );
};

export default Dashboard;
