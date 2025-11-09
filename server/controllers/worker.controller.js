import Worker from '../models/Worker.model.js';
import Production from '../models/Production.model.js';
import { startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get all workers
// @route   GET /api/workers
// @access  Private
export const getWorkers = async (req, res) => {
  try {
    const { workerType, shift, search, sortBy = 'workerCode', order = 'asc' } = req.query;
    let query = { isActive: true };

    if (workerType && workerType !== 'all') {
      query.workerType = workerType;
    }

    if (shift && shift !== 'all' && shift !== 'All') {
      query.shift = shift;
    }

    if (search) {
      query.$or = [
        { workerCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const workers = await Worker.find(query)
      .populate('assignedMachines.machine', 'machineCode machineName status')
      .sort(sortOptions);

    // Calculate additional stats for each worker
    const workersWithStats = await Promise.all(
      workers.map(async (worker) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Today's production
        const todayProduction = await Production.aggregate([
          {
            $match: {
              worker: worker._id,
              createdAt: { $gte: todayStart }
            }
          },
          {
            $group: {
              _id: null,
              totalMeters: { $sum: '$meters' },
              totalEarnings: { $sum: '$earnings' },
              count: { $sum: 1 }
            }
          }
        ]);

        // This month's production
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthProduction = await Production.aggregate([
          {
            $match: {
              worker: worker._id,
              createdAt: { $gte: monthStart }
            }
          },
          {
            $group: {
              _id: null,
              totalMeters: { $sum: '$meters' },
              totalEarnings: { $sum: '$earnings' },
              count: { $sum: 1 }
            }
          }
        ]);

        // Total productions count
        const totalProductions = await Production.countDocuments({ worker: worker._id });

        return {
          ...worker.toObject(),
          todayProduction: todayProduction[0] || { totalMeters: 0, totalEarnings: 0, count: 0 },
          monthProduction: monthProduction[0] || { totalMeters: 0, totalEarnings: 0, count: 0 },
          totalProductions
        };
      })
    );

    res.status(200).json({
      success: true,
      count: workersWithStats.length,
      data: workersWithStats
    });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch workers',
      error: error.message 
    });
  }
};

// @desc    Get single worker
// @route   GET /api/workers/:id
// @access  Private
export const getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('assignedMachines.machine');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create worker
// @route   POST /api/workers
// @access  Private
export const createWorker = async (req, res) => {
  try {
    // Check if worker code already exists
    const existingWorker = await Worker.findOne({ 
      workerCode: req.body.workerCode,
      isActive: true 
    });

    if (existingWorker) {
      return res.status(400).json({ 
        success: false,
        message: 'Worker code already exists' 
      });
    }

    const worker = await Worker.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Worker created successfully',
      data: worker
    });
  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create worker' 
    });
  }
};

// @desc    Update worker
// @route   PUT /api/workers/:id
// @access  Private
export const updateWorker = async (req, res) => {
  try {
    // Check if updating worker code and if it already exists
    if (req.body.workerCode) {
      const existingWorker = await Worker.findOne({ 
        workerCode: req.body.workerCode,
        _id: { $ne: req.params.id },
        isActive: true 
      });

      if (existingWorker) {
        return res.status(400).json({ 
          success: false,
          message: 'Worker code already exists' 
        });
      }
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedMachines.machine', 'machineCode machineName status');

    if (!worker) {
      return res.status(404).json({ 
        success: false,
        message: 'Worker not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Worker updated successfully',
      data: worker
    });
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to update worker' 
    });
  }
};

// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Private
export const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk delete workers
// @route   POST /api/workers/bulk-delete
// @access  Private
export const bulkDeleteWorkers = async (req, res) => {
  try {
    const { ids } = req.body;

    await Worker.updateMany(
      { _id: { $in: ids } },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Workers deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get worker performance
// @route   GET /api/workers/:id/performance
// @access  Private
export const getWorkerPerformance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = startOfMonth(new Date(targetYear, targetMonth));
    const endDate = endOfMonth(new Date(targetYear, targetMonth));

    const production = await Production.find({
      worker: req.params.id,
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate('machine', 'machineCode machineName')
      .populate('taka', 'takaNumber')
      .populate('qualityType', 'name ratePerMeter')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 productions

    // Calculate totals
    const totals = production.reduce((acc, prod) => {
      acc.totalMeters += prod.meters || 0;
      acc.totalEarnings += prod.earnings || 0;
      acc.dayShiftMeters += prod.shift === 'Day' ? (prod.meters || 0) : 0;
      acc.nightShiftMeters += prod.shift === 'Night' ? (prod.meters || 0) : 0;
      return acc;
    }, {
      totalMeters: 0,
      totalEarnings: 0,
      dayShiftMeters: 0,
      nightShiftMeters: 0
    });

    res.status(200).json({
      success: true,
      count: production.length,
      totals,
      data: production
    });
  } catch (error) {
    console.error('Get worker performance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch worker performance',
      error: error.message 
    });
  }
};
