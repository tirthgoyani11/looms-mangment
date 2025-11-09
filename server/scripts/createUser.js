import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User Schema (inline for script)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'manager'], default: 'manager' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/looms');
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'tirthgoyani123@gmail.com' });
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('tillu3888', salt);
      
      // Update user
      existingUser.password = hashedPassword;
      existingUser.name = 'Tirth Goyani';
      existingUser.role = 'owner';
      await existingUser.save();
      
      console.log('✅ User updated successfully!');
    } else {
      console.log('Creating new user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('tillu3888', salt);

      // Create new user
      const newUser = new User({
        name: 'Tirth Goyani',
        email: 'tirthgoyani123@gmail.com',
        password: hashedPassword,
        role: 'owner'
      });

      await newUser.save();
      console.log('✅ User created successfully!');
    }

    console.log('\n📧 Email: tirthgoyani123@gmail.com');
    console.log('🔑 Password: tillu3888');
    console.log('👤 Role: owner\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUser();
