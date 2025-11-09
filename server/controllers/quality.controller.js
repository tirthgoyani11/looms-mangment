import QualityType from '../models/QualityType.model.js';
import Production from '../models/Production.model.js';

// @desc    Get all quality types
// @route   GET /api/qualities
// @access  Private
export const getQualityTypes = async (req, res) => {
  try {
    const { sortBy = 'name', order = 'asc', search = '' } = req.query;

    // Build query
    const query = { isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const qualities = await QualityType.find(query).sort(sortObj);

    // Add production stats for each quality
    const qualitiesWithStats = await Promise.all(
      qualities.map(async (quality) => {
        const qualityObj = quality.toObject();

        // Today's production
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayProduction = await Production.aggregate([
          {
            $match: {
              qualityType: quality._id,
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

        // This month's production
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthProduction = await Production.aggregate([
          {
            $match: {
              qualityType: quality._id,
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

        // Total productions count
        const totalProductions = await Production.countDocuments({
          qualityType: quality._id
        });

        qualityObj.todayStats = todayProduction[0] || { totalCount: 0, totalMeters: 0, totalEarnings: 0 };
        qualityObj.monthStats = monthProduction[0] || { totalCount: 0, totalMeters: 0, totalEarnings: 0 };
        qualityObj.totalProductions = totalProductions;

        return qualityObj;
      })
    );

    res.status(200).json({
      success: true,
      count: qualitiesWithStats.length,
      data: qualitiesWithStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quality type
// @route   GET /api/qualities/:id
// @access  Private
export const getQualityType = async (req, res) => {
  try {
    const quality = await QualityType.findById(req.params.id);

    if (!quality) {
      return res.status(404).json({ message: 'Quality type not found' });
    }

    res.status(200).json({
      success: true,
      data: quality
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create quality type
// @route   POST /api/qualities
// @access  Private
export const createQualityType = async (req, res) => {
  try {
    // Check for duplicate quality name
    const existingQuality = await QualityType.findOne({
      name: req.body.name,
      isActive: true
    });

    if (existingQuality) {
      return res.status(400).json({
        success: false,
        message: 'A quality type with this name already exists'
      });
    }

    const quality = await QualityType.create(req.body);

    res.status(201).json({
      success: true,
      data: quality
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quality type
// @route   PUT /api/qualities/:id
// @access  Private
export const updateQualityType = async (req, res) => {
  try {
    // Check for duplicate quality name (excluding current quality)
    if (req.body.name) {
      const existingQuality = await QualityType.findOne({
        name: req.body.name,
        _id: { $ne: req.params.id },
        isActive: true
      });

      if (existingQuality) {
        return res.status(400).json({
          success: false,
          message: 'A quality type with this name already exists'
        });
      }
    }

    const quality = await QualityType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quality) {
      return res.status(404).json({ message: 'Quality type not found' });
    }

    res.status(200).json({
      success: true,
      data: quality
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete quality type
// @route   DELETE /api/qualities/:id
// @access  Private
export const deleteQualityType = async (req, res) => {
  try {
    const quality = await QualityType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!quality) {
      return res.status(404).json({ message: 'Quality type not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quality type statistics
// @route   GET /api/qualities/stats
// @access  Private
export const getQualityStats = async (req, res) => {
  try {
    const totalQualities = await QualityType.countDocuments({ isActive: true });

    // Get all qualities for rate calculations
    const qualities = await QualityType.find({ isActive: true });
    const rates = qualities.map(q => q.ratePerMeter);
    
    const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    const highestRate = rates.length > 0 ? Math.max(...rates) : 0;
    const lowestRate = rates.length > 0 ? Math.min(...rates) : 0;

    // Get production stats for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayProductions = await Production.countDocuments({
      createdAt: { $gte: todayStart }
    });

    // Get production stats for this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthProductions = await Production.countDocuments({
      createdAt: { $gte: monthStart }
    });

    // Get all-time production stats
    const allTimeProductions = await Production.countDocuments({});

    // Get 7-day trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lastWeekProductions = await Production.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalQualities,
        avgRate,
        highestRate,
        lowestRate,
        productions: {
          today: todayProductions,
          month: monthProductions,
          allTime: allTimeProductions,
          lastWeek: lastWeekProductions
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
