import Machine from '../models/Machine.model.js';
import Worker from '../models/Worker.model.js';
import Production from '../models/Production.model.js';
import Taka from '../models/Taka.model.js';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Get counts
    const totalMachines = await Machine.countDocuments({ isActive: true });
    const activeMachines = await Machine.countDocuments({ isActive: true, status: 'Active' });
    const totalWorkers = await Worker.countDocuments({ isActive: true });
    const activeTakas = await Taka.countDocuments({ status: 'Active' });

    // Today's production
    const todayProduction = await Production.aggregate([
      {
        $match: {
          date: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: '$shift',
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' },
          count: { $sum: 1 }
        }
      }
    ]);

    const dayShift = todayProduction.find(p => p._id === 'Day') || { totalMeters: 0, totalEarnings: 0, count: 0 };
    const nightShift = todayProduction.find(p => p._id === 'Night') || { totalMeters: 0, totalEarnings: 0, count: 0 };

    // This month's production
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const monthProduction = await Production.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' }
        }
      }
    ]);

    const monthStats = monthProduction[0] || { totalMeters: 0, totalEarnings: 0 };

    res.status(200).json({
      success: true,
      data: {
        machines: {
          total: totalMachines,
          active: activeMachines,
          inactive: totalMachines - activeMachines
        },
        workers: {
          total: totalWorkers
        },
        takas: {
          active: activeTakas
        },
        todayProduction: {
          day: dayShift,
          night: nightShift,
          total: {
            meters: dayShift.totalMeters + nightShift.totalMeters,
            earnings: dayShift.totalEarnings + nightShift.totalEarnings
          }
        },
        monthProduction: monthStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly production trends
// @route   GET /api/dashboard/monthly-trends
// @access  Private
export const getMonthlyTrends = async (req, res) => {
  try {
    const months = 6;
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const production = await Production.aggregate([
        {
          $match: {
            date: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            totalMeters: { $sum: '$metersProduced' },
            totalEarnings: { $sum: '$earnings' }
          }
        }
      ]);

      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        meters: production[0]?.totalMeters || 0,
        earnings: production[0]?.totalEarnings || 0
      });
    }

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top performers
// @route   GET /api/dashboard/top-performers
// @access  Private
export const getTopPerformers = async (req, res) => {
  try {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // Top workers
    const topWorkers = await Production.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$worker',
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' }
        }
      },
      { $sort: { totalMeters: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'workers',
          localField: '_id',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' }
    ]);

    // Top machines
    const topMachines = await Production.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$machine',
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' }
        }
      },
      { $sort: { totalMeters: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'machines',
          localField: '_id',
          foreignField: '_id',
          as: 'machine'
        }
      },
      { $unwind: '$machine' }
    ]);

    res.status(200).json({
      success: true,
      data: {
        workers: topWorkers.map(w => ({
          id: w.worker._id,
          name: w.worker.name,
          code: w.worker.workerCode,
          meters: w.totalMeters,
          earnings: w.totalEarnings
        })),
        machines: topMachines.map(m => ({
          id: m.machine._id,
          name: m.machine.machineName,
          code: m.machine.machineCode,
          meters: m.totalMeters,
          earnings: m.totalEarnings
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quality distribution
// @route   GET /api/dashboard/quality-distribution
// @access  Private
export const getQualityDistribution = async (req, res) => {
  try {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const distribution = await Production.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$qualityType',
          totalMeters: { $sum: '$metersProduced' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'qualitytypes',
          localField: '_id',
          foreignField: '_id',
          as: 'quality'
        }
      },
      { $unwind: '$quality' }
    ]);

    res.status(200).json({
      success: true,
      data: distribution.map(d => ({
        name: d.quality.name,
        meters: d.totalMeters,
        count: d.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
