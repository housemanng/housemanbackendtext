/// <reference types="node" />
import 'dotenv/config';
import mongoose from 'mongoose';
import AdminUser from '../src/models/AdminUser';

async function run() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
  await mongoose.connect(process.env.MONGODB_URI as string);
  const admin = new (AdminUser as any)({
    first_name: 'Super',
    surname: 'Admin',
    phone_number: '08000000000',
    password: 'ChangeMe123!',
    isAdmin: true,
    isSuperAdmin: true
  });
  await admin.save();
  console.log('Super admin created:', admin.phone_number);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });


