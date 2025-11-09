import Production from '../models/Production.model.js';
import Taka from '../models/Taka.model.js';
import Machine from '../models/Machine.model.js';
import Worker from '../models/Worker.model.js';

// @desc    Get all productions
// @route   GET /api/productions
// @access  Private
export const getProductions = async (req, res) => {
  try {
    const { startDate, endDate, shift, machineId, workerId, sortBy = 'date', order = 'desc' } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (shift) {
      query.shift = shift;
    }

    if (machineId) {
      query.machine = machineId;
    }

    if (workerId) {
      query.worker = workerId;
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const productions = await Production.find(query)
      .populate('machine', 'machineCode machineName')
      .populate('worker', 'name workerCode')
      .populate('taka', 'takaNumber')
      .populate('qualityType', 'name ratePerMeter')
      .sort(sortObj);

    res.status(200).json({
      success: true,
      count: productions.length,
      data: productions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single production
// @route   GET /api/productions/:id
// @access  Private
export const getProduction = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id)
      .populate('machine')
      .populate('worker')
      .populate('taka')
      .populate('qualityType');

    if (!production) {
      return res.status(404).json({ message: 'Production record not found' });
    }

    res.status(200).json({
      success: true,
      data: production
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create production
// @route   POST /api/productions
// @access  Private
export const createProduction = async (req, res) => {
  try {
    const production = await Production.create(req.body);

    // Update taka's total meters
    const taka = await Taka.findById(req.body.taka);
    if (taka) {
      taka.totalMeters += req.body.metersProduced;
      await taka.save();
    }

    const populatedProduction = await Production.findById(production._id)
      .populate('machine', 'machineCode machineName')
      .populate('worker', 'name workerCode')
      .populate('taka', 'takaNumber')
      .populate('qualityType', 'name ratePerMeter');

    res.status(201).json({
      success: true,
      data: populatedProduction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update production
// @route   PUT /api/productions/:id
// @access  Private
export const updateProduction = async (req, res) => {
  try {
    const oldProduction = await Production.findById(req.params.id);
    const oldMeters = oldProduction.metersProduced;

    const production = await Production.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('machine').populate('worker').populate('taka').populate('qualityType');

    if (!production) {
      return res.status(404).json({ message: 'Production record not found' });
    }

    // Update taka's total meters
    if (req.body.metersProduced !== undefined) {
      const taka = await Taka.findById(production.taka);
      if (taka) {
        taka.totalMeters = taka.totalMeters - oldMeters + req.body.metersProduced;
        await taka.save();
      }
    }

    res.status(200).json({
      success: true,
      data: production
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete production
// @route   DELETE /api/productions/:id
// @access  Private
export const deleteProduction = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id);

    if (!production) {
      return res.status(404).json({ message: 'Production record not found' });
    }

    // Update taka's total meters
    const taka = await Taka.findById(production.taka);
    if (taka) {
      taka.totalMeters -= production.metersProduced;
      await taka.save();
    }

    await production.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get production statistics
// @route   GET /api/productions/stats
// @access  Private
export const getProductionStats = async (req, res) => {
  try {
    // Total productions
    const totalProductions = await Production.countDocuments({});

    // Today's production stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayStats = await Production.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' }
        }
      }
    ]);

    // This month's production stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthStats = await Production.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' }
        }
      }
    ]);

    // All-time stats
    const allTimeStats = await Production.aggregate([
      {
        $group: {
          _id: null,
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' },
          avgMeters: { $avg: '$metersProduced' }
        }
      }
    ]);

    // Shift-wise stats for today
    const shiftStats = await Production.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: '$shift',
          count: { $sum: 1 },
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' }
        }
      }
    ]);

    // Top performing machines (this month)
    const topMachines = await Production.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: '$machine',
          totalMeters: { $sum: '$metersProduced' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalMeters: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Populate machine details
    const populatedTopMachines = await Machine.populate(topMachines, {
      path: '_id',
      select: 'machineCode machineName'
    });

    // Top performing workers (this month)
    const topWorkers = await Production.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: '$worker',
          totalMeters: { $sum: '$metersProduced' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalMeters: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Populate worker details
    const populatedTopWorkers = await Worker.populate(topWorkers, {
      path: '_id',
      select: 'name workerCode'
    });

    res.status(200).json({
      success: true,
      data: {
        totalProductions,
        today: todayStats[0] || { totalCount: 0, totalMeters: 0, totalEarnings: 0 },
        month: monthStats[0] || { totalCount: 0, totalMeters: 0, totalEarnings: 0 },
        allTime: allTimeStats[0] || { totalMeters: 0, totalEarnings: 0, avgMeters: 0 },
        shiftStats,
        topMachines: populatedTopMachines,
        topWorkers: populatedTopWorkers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
