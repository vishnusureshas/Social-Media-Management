import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import AdminActionLog from '../models/AdminActionLogModel.js';

const SEED_USERS = [
  {
    username: 'admin',
    email: 'admin@nexus.test',
    password: 'Admin@123',
    fullName: 'Nexus Admin',
    role: 'admin',
  },
  {
    username: 'superadmin',
    email: 'superadmin@nexus.test',
    password: 'Super@123',
    fullName: 'Nexus Superadmin',
    role: 'superadmin',
  },
];

const upsertSeedUser = async ({ username, email, password, fullName, role }) => {
  const existing = await User.findOne({ $or: [{ username }, { email }] });

  if (existing) {
    existing.role = role;
    existing.fullName = fullName;
    existing.isActive = true;
    existing.isBanned = false;
    existing.emailVerified = true;
    if (existing.password !== undefined) {
      const stillValid = await existing.comparePassword(password);
      if (!stillValid) {
        const salt = await bcrypt.genSalt(10);
        existing.password = await bcrypt.hash(password, salt);
      }
    }
    await existing.save();
    return { created: false, user: existing };
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    role,
    isActive: true,
    isBanned: false,
    emailVerified: true,
  });
  return { created: true, user };
};

const run = async () => {
  await connectDB();
  const results = [];
  for (const seed of SEED_USERS) {
    const { created, user } = await upsertSeedUser(seed);
    results.push({ username: user.username, role: user.role, created });
  }

  // Thin demo audit trail so the Audit Logs page has data.
  const superAdmin = await User.findOne({ username: 'superadmin' });
  if (superAdmin) {
    await AdminActionLog.create({
      admin: superAdmin._id,
      action: 'admin_login',
      targetType: 'system',
      metadata: { seed: true },
      ip: 'seed',
    });
  } else {
    console.error('[seed] superadmin user not found for audit log entry.');
  }

  console.log('Demo accounts ready:');
  results.forEach(({ username, role, created }) => {
    console.log(`- ${role.padEnd(10)} ${username} ${created ? '(created)' : '(updated)'}`);
  });
  console.log('Demo credentials (do not use in production):');
  SEED_USERS.forEach(({ username, email, password }) => {
    console.log(`- ${email} / ${password}  (username: ${username})`);
  });

  await mongoose.connection.close();
  console.log('Seed complete — connection closed.');
};

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});