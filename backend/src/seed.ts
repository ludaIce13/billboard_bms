import bcrypt from 'bcryptjs';
import { User } from './models';
import { initDatabase } from '../config/database';

async function seed() {
  try {
    await initDatabase();
    
    let created = 0;
    
    // Create default Super Admin if not exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@bms.com' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Administrator',
        email: 'admin@bms.com',
        password: hashedPassword,
        phone: '+23276000000',
        role: 'SUPER_ADMIN'
      });
      created++;
    }
    
    // Create default Billing user if not exists
    const existingBilling = await User.findOne({ where: { email: 'billing@bms.com' } });
    if (!existingBilling) {
      const billingPassword = await bcrypt.hash('billing123', 10);
      await User.create({
        name: 'Billing Officer',
        email: 'billing@bms.com',
        password: billingPassword,
        phone: '+23276111111',
        role: 'BILLING'
      });
      created++;
    }
    
    if (created === 0) {
      console.log('✅ All default users already exist');
    } else {
      console.log(`✅ Created ${created} default user(s) successfully!`);
    }
    
    console.log('==========================================');
    console.log('SUPER ADMIN:');
    console.log('Email: admin@bms.com');
    console.log('Password: admin123');
    console.log('Role: SUPER_ADMIN');
    console.log('');
    console.log('BILLING USER:');
    console.log('Email: billing@bms.com');
    console.log('Password: billing123');
    console.log('Role: BILLING');
    console.log('==========================================');
    console.log('⚠️  Please change passwords after first login');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
  }
}

export { seed };
