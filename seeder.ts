import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import bcrypt from 'bcryptjs';
import User from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// 1️⃣ Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// 2️⃣ Seed data
const seedUsers = async () => {
  try {
    await connectDB();

    // Optionally clear existing users
    await User.deleteMany();

    // Create a default admin user
    // const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin1@example.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created:', adminUser.email);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seeder failed:', error.message);
    process.exit(1);
  }
};

seedUsers();
