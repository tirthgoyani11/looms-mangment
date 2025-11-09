import Taka from '../models/Taka.model.js';
import Machine from '../models/Machine.model.js';
import QualityType from '../models/QualityType.model.js';
import Production from '../models/Production.model.js';

// @desc    Get all takas
// @route   GET /api/takas
// @access  Private
export const getTakas = async (req, res) => {
  try {
    const { status, machineId, qualityTypeId, sortBy = 'createdAt', order = 'desc' } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (machineId) {
      query.machine = machineId;
    }

    if (qualityTypeId) {
      query.qualityType = qualityTypeId;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const takas = await Taka.find(query)
      .populate('machine', 'machineCode machineName status')
      .populate('qualityType', 'name ratePerMeter')
      .sort(sortOptions);

    // Add production stats for each taka
    const takasWithStats = await Promise.all(
      takas.map(async (taka) => {
        const productionCount = await Production.countDocuments({ taka: taka._id });
        
        const productionStats = await Production.aggregate([
          { $match: { taka: taka._id } },
          {
            $group: {
              _id: null,
              totalMeters: { $sum: '$meters' },
              totalEarnings: { $sum: '$earnings' }
            }
          }
        ]);

        return {
          ...taka.toObject(),
          productionCount,
          productionStats: productionStats[0] || { totalMeters: 0, totalEarnings: 0 }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: takasWithStats.length,
      data: takasWithStats
    });
  } catch (error) {
    console.error('Get takas error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch takas',
      error: error.message 
    });
  }
};

// @desc    Get single taka
// @route   GET /api/takas/:id
// @access  Private
export const getTaka = async (req, res) => {
  try {
    const taka = await Taka.findById(req.params.id)
      .populate('machine')
      .populate('qualityType');

    if (!taka) {
      return res.status(404).json({ message: 'Taka not found' });
    }

    res.status(200).json({
      success: true,
      data: taka
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create taka
// @route   POST /api/takas
// @access  Private
export const createTaka = async (req, res) => {
  try {
    const { qualityType, machine, takaNumber } = req.body;

    // Check if taka number already exists
    const existingTaka = await Taka.findOne({ takaNumber });
    if (existingTaka) {
      return res.status(400).json({ 
        success: false,
        message: 'Taka number already exists' 
      });
    }

    // Get quality type rate
    const quality = await QualityType.findById(qualityType);
    if (!quality) {
      return res.status(404).json({ 
        success: false,
        message: 'Quality type not found' 
      });
    }

    // Create taka with rate from quality type
    const taka = await Taka.create({
      ...req.body,
      ratePerMeter: quality.ratePerMeter
    });

    // Update machine's current taka
    if (machine) {
      await Machine.findByIdAndUpdate(machine, { currentTaka: taka._id });
    }

    const populatedTaka = await Taka.findById(taka._id)
      .populate('machine', 'machineCode machineName')
      .populate('qualityType', 'name ratePerMeter');

    res.status(201).json({
      success: true,
      message: 'Taka created successfully',
      data: populatedTaka
    });
  } catch (error) {
    console.error('Create taka error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create taka' 
    });
  }
};

// @desc    Update taka
// @route   PUT /api/takas/:id
// @access  Private
export const updateTaka = async (req, res) => {
  try {
    const taka = await Taka.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('machine', 'machineCode machineName').populate('qualityType', 'name ratePerMeter');

    if (!taka) {
      return res.status(404).json({ 
        success: false,
        message: 'Taka not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: taka
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete taka
// @route   DELETE /api/takas/:id
// @access  Private
export const deleteTaka = async (req, res) => {
  try {
    const taka = await Taka.findById(req.params.id);

    if (!taka) {
      return res.status(404).json({ message: 'Taka not found' });
    }

    // Remove from machine if it's current taka
    await Machine.updateOne(
      { currentTaka: taka._id },
      { $unset: { currentTaka: 1 } }
    );

    await taka.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete taka
// @route   PUT /api/takas/:id/complete
// @access  Private
export const completeTaka = async (req, res) => {
  try {
    const taka = await Taka.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        endDate: new Date()
      },
      { new: true }
    ).populate('machine').populate('qualityType');

    if (!taka) {
      return res.status(404).json({ message: 'Taka not found' });
    }

    // Remove from machine's current taka
    await Machine.updateOne(
      { currentTaka: taka._id },
      { $unset: { currentTaka: 1 } }
    );

    res.status(200).json({
      success: true,
      data: taka
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
