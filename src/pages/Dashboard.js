import React, { useState, useEffect } from 'react';

// In a real application, you would import your Firebase services.
// import { db } from '../services/firebase';
// import { collection, onSnapshot } from "firebase/firestore";

// --- MOCK DATA ---
// This simulates the more detailed data you would fetch from different Firestore collections.
const mockDashboardData = {
  stats: {
    looms: 5,
    activeLooms: 3,
    totalProduction: 12580,
    lowStockAlerts: 2,
  },
  looms: [
    { id: 'L001', name: 'Loom 01', type: 'Air-Jet', status: 'Running' },
    { id: 'L002', name: 'Loom 02', type: 'Rapier', status: 'Running' },
    { id: 'L003', name: 'Loom 03', type: 'Power Loom', status: 'Stopped' },
    { id: 'L004', name: 'Loom 04', type: 'Air-Jet', status: 'Maintenance' },
    { id: 'L005', name: 'Loom 05', type: 'Water-Jet', status: 'Running' },
  ],
  production: [
    { id: 'PO2401', fabric: 'Denim', status: 'In Progress', progress: 65 },
    { id: 'PO2402', fabric: 'Cotton Twill', status: 'In Progress', progress: 40 },
    { id: 'PO2403', fabric: 'Nylon', status: 'Completed', progress: 100 },
  ],
};

// Helper component to render the status with appropriate colors.
const StatusIndicator = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  let statusClasses = "";

  switch (status) {
    case 'Running':
      statusClasses = "bg-green-500/20 text-green-300";
      break;
    case 'Stopped':
      statusClasses = "bg-red-500/20 text-red-300";
      break;
    case 'Maintenance':
      statusClasses = "bg-yellow-500/20 text-yellow-300";
      break;
    default:
      statusClasses = "bg-gray-500/20 text-gray-300";
  }

  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};


/**
 * The full Dashboard component with KPI cards, lists, and chart placeholders.
 */
const Dashboard = () => {
  // State to hold all the data for the dashboard.
  const [dashboardData, setDashboardData] = useState(null);

  // This useEffect simulates fetching the data when the component mounts.
  useEffect(() => {
    // In a real app, you would fetch data from Firebase here.
    // For now, we just set the state with our mock data after a short delay
    // to simulate a network request.
    const timer = setTimeout(() => {
      setDashboardData(mockDashboardData);
    }, 500); // 0.5 second delay

    // Cleanup function to clear the timer if the component unmounts.
    return () => clearTimeout(timer);
  }, []); // The empty dependency array ensures this runs only once.

  // Display a loading message until the data is available.
  if (!dashboardData) {
    return <div className="text-center text-gray-400">Loading Dashboard...</div>;
  }

  const { stats, looms, production } = dashboardData;
  const activeProduction = production.filter(p => p.status === 'In Progress');

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      
      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Looms</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats.looms}</p>
        </div>
        <div className="card p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Active Looms</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">{stats.activeLooms}</p>
        </div>
        <div className="card p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Production (m)</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">{stats.totalProduction.toLocaleString()}</p>
        </div>
        <div className="card p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-red-400 mt-2">{stats.lowStockAlerts}</p>
        </div>
      </div>
      
      {/* Section 2: Lists and Overviews */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Looms Status Overview */}
        <div className="card p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">Looms Status Overview</h3>
          <div className="space-y-4">
            {looms.map(loom => (
              <div key={loom.id} className="flex items-center justify-between">
                <span className="text-gray-300">{loom.name} - <span className="text-gray-400 text-sm">{loom.type}</span></span>
                <StatusIndicator status={loom.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Active Production Orders */}
        <div className="card p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">Active Production Orders</h3>
          <ul className="space-y-4">
            {activeProduction.map(p => (
              <li key={p.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-300">{p.fabric} ({p.id})</span>
                  <span className="text-sm text-gray-400">{p.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${p.progress}%`}}></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 3: Charts */}
      <div className="mt-8">
        <div className="card p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Production Chart</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            {/* Your chart component (e.g., from Chart.js or Recharts) would go here */}
            Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
