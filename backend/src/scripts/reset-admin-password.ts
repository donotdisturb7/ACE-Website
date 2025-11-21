/**
 * Script pour réinitialiser le mot de passe admin
 * Usage: npx ts-node src/scripts/reset-admin-password.ts
 */

import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { config } from '../config/env';

const resetAdminPassword = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Find admin user
    const admin = await User.findOne({ where: { email: config.adminEmail } });

    if (!admin) {
      console.error(`❌ Admin user with email ${config.adminEmail} not found`);
      process.exit(1);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(config.adminPassword, salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    console.log(`✅ Admin password reset successfully for ${config.adminEmail}`);
    console.log(`   New password: ${config.adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();
