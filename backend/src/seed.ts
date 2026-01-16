import bcrypt from 'bcryptjs';
import { User, Council } from './models';
import { initDatabase } from '../config/database';

async function seed() {
  try {
    await initDatabase();
    
    let created = 0;
    
    // Create default councils if not exist (matching REVMIS API)
    const defaultCouncils = [
      { id: 1, name: 'Bo city council' },
      { id: 2, name: 'Moyamba District Council' },
      { id: 3, name: 'Kambia District Council' },
      { id: 4, name: 'Western Area Rural District Council' }
    ];
    
    for (const councilData of defaultCouncils) {
      const existingCouncil = await Council.findByPk(councilData.id);
      if (!existingCouncil) {
        await Council.create(councilData);
        created++;
      }
    }
    
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
      console.log('✅ All default data already exists');
    } else {
      console.log(`✅ Created ${created} default item(s) successfully!`);
    }
    
    console.log('==========================================');
    console.log('DEFAULT COUNCILS:');
    console.log('1 - Bo city council');
    console.log('2 - Moyamba District Council');
    console.log('3 - Kambia District Council');
    console.log('4 - Western Area Rural District Council');
    console.log('');
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
