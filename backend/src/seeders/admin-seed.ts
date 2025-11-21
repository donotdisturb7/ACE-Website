import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { config } from '../config/env';

export const createAdminUser = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ where: { email: config.adminEmail } });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(config.adminPassword, salt);
      
      await User.create({
        email: config.adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'ACE',
        school: 'Administration',
        grade: 'N/A',
        specialty: 'N/A',
        isAdmin: true,
        emailVerified: true,
      });
      
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};


