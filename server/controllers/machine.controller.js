import Machine from '../models/Machine.model.js';
import Production from '../models/Production.model.js';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Private
export const getMachines = async (req, res) => {
  try {
    const { status, search, sortBy = 'machineCode', order = 'asc' } = req.query;
    let query = { isActive: true };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { machineCode: { $regex: search, $options: 'i' } },
        { machineName: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const machines = await Machine.find(query)
      .populate('dayShiftWorker', 'name workerCode phone')
      .populate('nightShiftWorker', 'name workerCode phone')
      .populate('currentTaka', 'takaNumber status totalMeters remainingMeters')
      .sort(sortOptions);

    // Calculate additional stats for each machine
    const machinesWithStats = await Promise.all(
      machines.map(async (machine) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayProduction = await Production.aggregate([
          {
            $match: {
              machine: machine._id,
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

        const totalProduction = await Production.countDocuments({ machine: machine._id });

        return {
          ...machine.toObject(),
          todayProduction: todayProduction[0] || { totalMeters: 0, totalEarnings: 0, count: 0 },
          totalProductions: totalProduction
        };
      })
    );

    res.status(200).json({
      success: true,
      count: machinesWithStats.length,
      data: machinesWithStats
    });
  } catch (error) {
    console.error('Get machines error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch machines',
      error: error.message 
    });
  }
};

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Private
export const getMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id)
      .populate('dayShiftWorker')
      .populate('nightShiftWorker')
      .populate('currentTaka');

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create machine
// @route   POST /api/machines
// @access  Private
export const createMachine = async (req, res) => {
  try {
    // Check if machine code already exists
    const existingMachine = await Machine.findOne({ 
      machineCode: req.body.machineCode,
      isActive: true 
    });

    if (existingMachine) {
      return res.status(400).json({ 
        success: false,
        message: 'Machine code already exists' 
      });
    }

    const machine = await Machine.create(req.body);

    // Populate the created machine
    await machine.populate([
      { path: 'dayShiftWorker', select: 'name workerCode phone' },
      { path: 'nightShiftWorker', select: 'name workerCode phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Machine created successfully',
      data: machine
    });
  } catch (error) {
    console.error('Create machine error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create machine' 
    });
  }
};

// @desc    Update machine
// @route   PUT /api/machines/:id
// @access  Private
export const updateMachine = async (req, res) => {
  try {
    // Check if updating machine code and if it already exists
    if (req.body.machineCode) {
      const existingMachine = await Machine.findOne({ 
        machineCode: req.body.machineCode,
        _id: { $ne: req.params.id },
        isActive: true 
      });

      if (existingMachine) {
        return res.status(400).json({ 
          success: false,
          message: 'Machine code already exists' 
        });
      }
    }

    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'dayShiftWorker', select: 'name workerCode phone' },
      { path: 'nightShiftWorker', select: 'name workerCode phone' },
      { path: 'currentTaka', select: 'takaNumber status totalMeters remainingMeters' }
    ]);

    if (!machine) {
      return res.status(404).json({ 
        success: false,
        message: 'Machine not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Machine updated successfully',
      data: machine
    });
  } catch (error) {
    console.error('Update machine error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to update machine' 
    });
  }
};

// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Private
export const deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk delete machines
// @route   POST /api/machines/bulk-delete
// @access  Private
export const bulkDeleteMachines = async (req, res) => {
  try {
    const { ids } = req.body;

    await Machine.updateMany(
      { _id: { $in: ids } },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Machines deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign worker to machine
// @route   PUT /api/machines/:id/assign-worker
// @access  Private
export const assignWorker = async (req, res) => {
  try {
    const { workerId, shift } = req.body;
    const updateField = shift === 'Day' ? 'dayShiftWorker' : 'nightShiftWorker';

    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { [updateField]: workerId },
      { new: true }
    ).populate(updateField);

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get machine production history
// @route   GET /api/machines/:id/production
// @access  Private
export const getMachineProduction = async (req, res) => {
  try {
    const { startDate, endDate, shift } = req.query;
    let query = { machine: req.params.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (shift) {
      query.shift = shift;
    }

    const production = await Production.find(query)
      .populate('worker', 'name workerCode')
      .populate('taka', 'takaNumber')
      .populate('qualityType', 'name ratePerMeter')
      .sort({ date: -1 });

    // Calculate totals
    const totals = production.reduce((acc, prod) => {
      acc.totalMeters += prod.metersProduced;
      acc.totalEarnings += prod.earnings;
      return acc;
    }, { totalMeters: 0, totalEarnings: 0 });

    res.status(200).json({
      success: true,
      count: production.length,
      totals,
      data: production
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get machine statistics
// @route   GET /api/machines/:id/stats
// @access  Private
export const getMachineStats = async (req, res) => {
  try {
    const machineId = req.params.id;
    
    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayStats = await Production.aggregate([
      {
        $match: {
          machine: machineId,
          createdAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: '$shift',
          totalMeters: { $sum: '$meters' },
          totalEarnings: { $sum: '$earnings' },
          count: { $sum: 1 }
        }
      }
    ]);

    // This month's stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthStats = await Production.aggregate([
      {
        $match: {
          machine: machineId,
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

    // All time stats
    const allTimeStats = await Production.aggregate([
      {
        $match: { machine: machineId }
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

    // Last 7 days production trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekTrend = await Production.aggregate([
      {
        $match: {
          machine: machineId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          meters: { $sum: '$meters' },
          earnings: { $sum: '$earnings' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        today: todayStats,
        month: monthStats[0] || { totalMeters: 0, totalEarnings: 0, count: 0 },
        allTime: allTimeStats[0] || { totalMeters: 0, totalEarnings: 0, count: 0 },
        weekTrend
      }
    });
  } catch (error) {
    console.error('Get machine stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch machine statistics',
      error: error.message 
    });
  }
};
