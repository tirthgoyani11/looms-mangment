import Production from '../models/Production.model.js';
import Worker from '../models/Worker.model.js';
import Machine from '../models/Machine.model.js';
import PDFDocument from 'pdfkit';
import { startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get worker production report
// @route   GET /api/reports/worker
// @access  Private
export const getWorkerReport = async (req, res) => {
  try {
    const { workerId, startDate, endDate, shift } = req.query;

    let query = {};

    if (workerId) {
      query.worker = workerId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (shift) {
      query.shift = shift;
    }

    const productions = await Production.find(query)
      .populate('worker', 'name workerCode workerType')
      .populate('machine', 'machineCode machineName')
      .populate('taka', 'takaNumber')
      .populate('qualityType', 'name ratePerMeter')
      .sort({ date: -1 });

    // Group by worker
    const workerGroups = {};
    productions.forEach(prod => {
      const workerId = prod.worker._id.toString();
      if (!workerGroups[workerId]) {
        workerGroups[workerId] = {
          worker: prod.worker,
          productions: [],
          totals: {
            meters: 0,
            earnings: 0,
            dayShiftMeters: 0,
            nightShiftMeters: 0
          }
        };
      }
      workerGroups[workerId].productions.push(prod);
      workerGroups[workerId].totals.meters += prod.metersProduced;
      workerGroups[workerId].totals.earnings += prod.earnings;
      if (prod.shift === 'Day') {
        workerGroups[workerId].totals.dayShiftMeters += prod.metersProduced;
      } else {
        workerGroups[workerId].totals.nightShiftMeters += prod.metersProduced;
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(workerGroups)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get machine production report
// @route   GET /api/reports/machine
// @access  Private
export const getMachineReport = async (req, res) => {
  try {
    const { machineId, startDate, endDate, shift } = req.query;

    let query = {};

    if (machineId) {
      query.machine = machineId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (shift) {
      query.shift = shift;
    }

    const productions = await Production.find(query)
      .populate('machine', 'machineCode machineName')
      .populate('worker', 'name workerCode')
      .populate('taka', 'takaNumber')
      .populate('qualityType', 'name ratePerMeter')
      .sort({ date: -1 });

    // Group by machine
    const machineGroups = {};
    productions.forEach(prod => {
      const machineId = prod.machine._id.toString();
      if (!machineGroups[machineId]) {
        machineGroups[machineId] = {
          machine: prod.machine,
          productions: [],
          totals: {
            meters: 0,
            earnings: 0,
            dayShiftMeters: 0,
            nightShiftMeters: 0
          }
        };
      }
      machineGroups[machineId].productions.push(prod);
      machineGroups[machineId].totals.meters += prod.metersProduced;
      machineGroups[machineId].totals.earnings += prod.earnings;
      if (prod.shift === 'Day') {
        machineGroups[machineId].totals.dayShiftMeters += prod.metersProduced;
      } else {
        machineGroups[machineId].totals.nightShiftMeters += prod.metersProduced;
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(machineGroups)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get salary report
// @route   GET /api/reports/salary
// @access  Private
export const getSalaryReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const monthStart = startOfMonth(new Date(targetYear, targetMonth));
    const monthEnd = endOfMonth(new Date(targetYear, targetMonth));

    const salaryData = await Production.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$worker',
          totalMeters: { $sum: '$metersProduced' },
          totalEarnings: { $sum: '$earnings' },
          dayShiftMeters: {
            $sum: {
              $cond: [{ $eq: ['$shift', 'Day'] }, '$metersProduced', 0]
            }
          },
          nightShiftMeters: {
            $sum: {
              $cond: [{ $eq: ['$shift', 'Night'] }, '$metersProduced', 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'workers',
          localField: '_id',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' },
      { $sort: { 'worker.workerCode': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: salaryData.map(s => ({
        worker: {
          id: s.worker._id,
          name: s.worker.name,
          code: s.worker.workerCode,
          type: s.worker.workerType
        },
        metrics: {
          totalMeters: s.totalMeters,
          dayShiftMeters: s.dayShiftMeters,
          nightShiftMeters: s.nightShiftMeters,
          totalEarnings: s.totalEarnings
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate PDF report
// @route   POST /api/reports/pdf
// @access  Private
export const generatePDFReport = async (req, res) => {
  try {
    const { reportType, data } = req.body;

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.pdf`);

    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('Looms Management System', { align: 'center' });
    doc.fontSize(16).text(`${reportType} Report`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Add content based on report type
    if (reportType === 'salary') {
      doc.fontSize(14).text('Monthly Salary Report', { underline: true });
      doc.moveDown();

      data.forEach(item => {
        doc.fontSize(12).text(`Worker: ${item.worker.name} (${item.worker.code})`);
        doc.fontSize(10).text(`Type: ${item.worker.type}`);
        doc.text(`Total Meters: ${item.metrics.totalMeters}`);
        doc.text(`Day Shift: ${item.metrics.dayShiftMeters} | Night Shift: ${item.metrics.nightShiftMeters}`);
        doc.text(`Total Earnings: ₹${item.metrics.totalEarnings}`);
        doc.moveDown();
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
