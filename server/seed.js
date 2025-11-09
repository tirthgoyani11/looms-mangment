// Database seed script for testing
// Run this after setting up the database to populate with sample data

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Machine from './models/Machine.model.js';
import Worker from './models/Worker.model.js';
import QualityType from './models/QualityType.model.js';
import Taka from './models/Taka.model.js';
import Production from './models/Production.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Machine.deleteMany({});
    await Worker.deleteMany({});
    await QualityType.deleteMany({});
    await Taka.deleteMany({});
    await Production.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const owner = await User.create({
      name: 'Owner User',
      email: 'owner@looms.com',
      password: 'owner123',
      role: 'Owner',
      phone: '9876543210'
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@looms.com',
      password: 'manager123',
      role: 'Manager',
      phone: '9876543211'
    });

    console.log('✅ Created users');

    // Create quality types
    const qualityTypes = await QualityType.insertMany([
      { name: 'Standard', description: 'Basic quality fabric', ratePerMeter: 10 },
      { name: 'Premium', description: 'High quality fabric', ratePerMeter: 15 },
      { name: 'Deluxe', description: 'Luxury quality fabric', ratePerMeter: 20 },
      { name: 'Economy', description: 'Budget quality fabric', ratePerMeter: 7 }
    ]);

    console.log('✅ Created quality types');

    // Create workers
    const workers = await Worker.insertMany([
      {
        workerCode: 'W001',
        name: 'Rajesh Kumar',
        workerType: 'Permanent',
        phone: '9876543201',
        address: 'Mumbai',
        shift: 'Day'
      },
      {
        workerCode: 'W002',
        name: 'Amit Sharma',
        workerType: 'Permanent',
        phone: '9876543202',
        address: 'Delhi',
        shift: 'Night'
      },
      {
        workerCode: 'W003',
        name: 'Priya Patel',
        workerType: 'Permanent',
        phone: '9876543203',
        address: 'Surat',
        shift: 'Day'
      },
      {
        workerCode: 'W004',
        name: 'Vijay Singh',
        workerType: 'Temporary',
        phone: '9876543204',
        address: 'Ahmedabad',
        shift: 'Night'
      },
      {
        workerCode: 'W005',
        name: 'Sunita Reddy',
        workerType: 'Permanent',
        phone: '9876543205',
        address: 'Bangalore',
        shift: 'Day'
      }
    ]);

    console.log('✅ Created workers');

    // Create machines
    const machines = await Machine.insertMany([
      {
        machineCode: 'M001',
        machineName: 'Loom Alpha',
        machineType: 'Power Loom',
        status: 'Active',
        dayShiftWorker: workers[0]._id,
        nightShiftWorker: workers[1]._id,
        location: 'Floor 1'
      },
      {
        machineCode: 'M002',
        machineName: 'Loom Beta',
        machineType: 'Power Loom',
        status: 'Active',
        dayShiftWorker: workers[2]._id,
        nightShiftWorker: workers[3]._id,
        location: 'Floor 1'
      },
      {
        machineCode: 'M003',
        machineName: 'Loom Gamma',
        machineType: 'Power Loom',
        status: 'Active',
        dayShiftWorker: workers[4]._id,
        location: 'Floor 2'
      },
      {
        machineCode: 'M004',
        machineName: 'Loom Delta',
        machineType: 'Hand Loom',
        status: 'Maintenance',
        location: 'Floor 2'
      },
      {
        machineCode: 'M005',
        machineName: 'Loom Epsilon',
        machineType: 'Power Loom',
        status: 'Active',
        location: 'Floor 3'
      }
    ]);

    console.log('✅ Created machines');

    // Create takas
    const takas = await Taka.insertMany([
      {
        takaNumber: 'T001',
        machine: machines[0]._id,
        qualityType: qualityTypes[0]._id,
        totalMeters: 150,
        targetMeters: 500,
        status: 'Active',
        ratePerMeter: qualityTypes[0].ratePerMeter
      },
      {
        takaNumber: 'T002',
        machine: machines[1]._id,
        qualityType: qualityTypes[1]._id,
        totalMeters: 200,
        targetMeters: 400,
        status: 'Active',
        ratePerMeter: qualityTypes[1].ratePerMeter
      },
      {
        takaNumber: 'T003',
        machine: machines[2]._id,
        qualityType: qualityTypes[2]._id,
        totalMeters: 450,
        targetMeters: 500,
        status: 'Active',
        ratePerMeter: qualityTypes[2].ratePerMeter
      },
      {
        takaNumber: 'T004',
        machine: machines[4]._id,
        qualityType: qualityTypes[0]._id,
        totalMeters: 500,
        targetMeters: 500,
        status: 'Completed',
        ratePerMeter: qualityTypes[0].ratePerMeter,
        endDate: new Date()
      }
    ]);

    console.log('✅ Created takas');

    // Update machines with current takas
    await Machine.findByIdAndUpdate(machines[0]._id, { currentTaka: takas[0]._id });
    await Machine.findByIdAndUpdate(machines[1]._id, { currentTaka: takas[1]._id });
    await Machine.findByIdAndUpdate(machines[2]._id, { currentTaka: takas[2]._id });

    // Create production records for the last 30 days
    const productions = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Day shift production
      productions.push({
        date,
        machine: machines[0]._id,
        worker: workers[0]._id,
        taka: takas[0]._id,
        qualityType: qualityTypes[0]._id,
        shift: 'Day',
        metersProduced: Math.floor(Math.random() * 30) + 20,
        ratePerMeter: qualityTypes[0].ratePerMeter
      });

      // Night shift production
      productions.push({
        date,
        machine: machines[0]._id,
        worker: workers[1]._id,
        taka: takas[0]._id,
        qualityType: qualityTypes[0]._id,
        shift: 'Night',
        metersProduced: Math.floor(Math.random() * 25) + 15,
        ratePerMeter: qualityTypes[0].ratePerMeter
      });

      // Machine 2 production
      productions.push({
        date,
        machine: machines[1]._id,
        worker: workers[2]._id,
        taka: takas[1]._id,
        qualityType: qualityTypes[1]._id,
        shift: 'Day',
        metersProduced: Math.floor(Math.random() * 35) + 25,
        ratePerMeter: qualityTypes[1].ratePerMeter
      });

      // Machine 3 production
      productions.push({
        date,
        machine: machines[2]._id,
        worker: workers[4]._id,
        taka: takas[2]._id,
        qualityType: qualityTypes[2]._id,
        shift: 'Day',
        metersProduced: Math.floor(Math.random() * 40) + 30,
        ratePerMeter: qualityTypes[2].ratePerMeter
      });
    }

    await Production.insertMany(productions);

    console.log('✅ Created production records');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 2 (1 Owner, 1 Manager)`);
    console.log(`   - Quality Types: ${qualityTypes.length}`);
    console.log(`   - Workers: ${workers.length}`);
    console.log(`   - Machines: ${machines.length}`);
    console.log(`   - Takas: ${takas.length}`);
    console.log(`   - Production Records: ${productions.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Owner:   owner@looms.com / owner123');
    console.log('   Manager: manager@looms.com / manager123');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed
connectDB().then(() => seedData());
