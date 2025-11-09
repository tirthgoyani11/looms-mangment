import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FaFileDownload, FaCalendar, FaUser, FaCog, FaChartBar 
} from 'react-icons/fa';
import { FiTrendingUp, FiActivity, FiPackage } from 'react-icons/fi';

export default function Reports() {
  const [reportType, setReportType] = useState('worker');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/${reportType}`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      const data = response.data?.data || response.data;
      
      // Calculate summary based on report type
      let summary = {
        totalProductions: 0,
        totalMeters: 0,
        totalEarnings: 0,
        averagePerDay: 0
      };

      if (reportType === 'worker') {
        data.forEach(workerGroup => {
          summary.totalProductions += workerGroup.productions?.length || 0;
          summary.totalMeters += workerGroup.totals?.meters || 0;
          summary.totalEarnings += workerGroup.totals?.earnings || 0;
        });
      } else if (reportType === 'machine') {
        data.forEach(machineGroup => {
          summary.totalProductions += machineGroup.productions?.length || 0;
          summary.totalMeters += machineGroup.totals?.meters || 0;
          summary.totalEarnings += machineGroup.totals?.earnings || 0;
        });
      } else if (reportType === 'salary') {
        data.forEach(item => {
          summary.totalProductions += item.workingDays || 0;
          summary.totalMeters += item.totalMeters || 0;
          summary.totalEarnings += item.totalSalary || 0;
        });
      }

      // Calculate average per day
      const daysDiff = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      summary.averagePerDay = daysDiff > 0 ? summary.totalMeters / daysDiff : 0;

      setReportData({ data, summary, type: reportType });
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      const response = await api.get('/reports/export-pdf', {
        params: {
          type: reportType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Reports & Analysis</h1>
            <p className="text-indigo-100 text-lg">Generate comprehensive production reports and insights</p>
          </div>
          {reportData && (
            <button
              onClick={exportPDF}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 flex items-center gap-2 transition-all shadow-md font-semibold"
            >
              <FaFileDownload /> Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartBar className="text-indigo-600" />
          Report Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="worker">Worker Production Report</option>
              <option value="machine">Machine Production Report</option>
              <option value="salary">Salary Report</option>
              <option value="quality">Quality Analysis Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <FaChartBar /> Generate Report
            </>
          )}
        </button>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {reportType === 'worker' && 'Worker Production Report'}
              {reportType === 'machine' && 'Machine Production Report'}
              {reportType === 'salary' && 'Salary Report'}
              {reportType === 'quality' && 'Quality Analysis Report'}
            </h2>
            <div className="text-sm text-gray-600">
              {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total Productions */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-blue-600 text-sm font-semibold mb-2">Total Productions</p>
                  <p className="text-4xl font-bold text-blue-900">
                    {reportData.summary?.totalProductions || 0}
                  </p>
                </div>
                <div className="bg-blue-200 p-3 rounded-xl">
                  <FiPackage className="text-blue-600 text-2xl" />
                </div>
              </div>
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <FiActivity className="text-xs" />
                Recorded units
              </p>
            </div>

            {/* Total Meters */}
            <div className="bg-green-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-green-600 text-sm font-semibold mb-2">Total Meters</p>
                  <p className="text-4xl font-bold text-green-900">
                    {reportData.summary?.totalMeters?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-green-200 p-3 rounded-xl">
                  <span className="text-green-600 text-2xl font-bold">M</span>
                </div>
              </div>
              <p className="text-green-600 text-sm flex items-center gap-1">
                <FiActivity className="text-xs" />
                Total production
              </p>
            </div>

            {/* Total Earnings */}
            <div className="bg-purple-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-purple-600 text-sm font-semibold mb-2">Total Earnings</p>
                  <p className="text-4xl font-bold text-purple-900">
                    ₹{reportData.summary?.totalEarnings?.toFixed(2) || '0.00'}
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

            {/* Average per Day */}
            <div className="bg-orange-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-orange-600 text-sm font-semibold mb-2">Average per Day</p>
                  <p className="text-4xl font-bold text-orange-900">
                    {reportData.summary?.averagePerDay?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-orange-200 p-3 rounded-xl">
                  <FaCalendar className="text-orange-600 text-2xl" />
                </div>
              </div>
              <p className="text-orange-600 text-sm flex items-center gap-1">
                <FiActivity className="text-xs" />
                Daily average
              </p>
            </div>
          </div>

          {/* Worker Production Report */}
          {reportType === 'worker' && reportData.data && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Productions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Meters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Avg Meters/Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{item.worker?.name}</div>
                            <div className="text-sm text-gray-500">{item.worker?.workerCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${item.worker?.workerType === 'Permanent' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {item.worker?.workerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{item.productions?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{item.totals?.meters?.toFixed(2) || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        {item.productions?.length > 0 
                          ? (item.totals?.meters / item.productions.length).toFixed(2) 
                          : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ₹{item.totals?.earnings?.toFixed(2) || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Machine Production Report */}
          {reportType === 'machine' && reportData.data && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Machine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Productions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Meters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Utilization %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCog className="text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{item.machine?.machineName}</div>
                            <div className="text-sm text-gray-500">{item.machine?.machineCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${item.machine?.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            item.machine?.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {item.machine?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{item.productions?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{item.totals?.meters?.toFixed(2) || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        {item.totals?.utilization?.toFixed(1) || 0}%
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ₹{item.totals?.earnings?.toFixed(2) || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Salary Report */}
          {reportType === 'salary' && reportData.data && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Working Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Meters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Production Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Salary
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{item.worker?.name}</div>
                            <div className="text-sm text-gray-500">{item.worker?.workerCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${item.worker?.workerType === 'Permanent' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {item.worker?.workerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{item.workingDays}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{item.totalMeters?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ₹{item.productionEarnings?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-purple-600">
                        ₹{item.totalSalary?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quality Analysis Report */}
          {reportType === 'quality' && reportData.data && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Quality Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Rate/Meter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Productions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Meters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.quality?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">₹{item.quality?.ratePerMeter}</td>
                      <td className="px-6 py-4 text-sm font-medium">{item.count}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{item.totalMeters?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">{item.percentage?.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ₹{item.totalValue?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!reportData && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full animate-pulse"></div>
            <FaChartBar className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-6xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Report Generated</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Configure report parameters above and click Generate Report to view insights
          </p>
        </div>
      )}
    </div>
  );
}
