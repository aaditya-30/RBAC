const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const DATA_DIR = path.join(__dirname, '../data');

const seedUsers = async () => {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Seed users
    const users = [
      {
        id: Date.now().toString(),
        name: 'Admin User',
        email: 'admin@test.com',
        password: await bcrypt.hash('admin123', 10),
        roles: ['admin'],
        createdAt: new Date().toISOString()
      },
      {
        id: (Date.now() + 1).toString(),
        name: 'Editor User',
        email: 'editor@test.com',
        password: await bcrypt.hash('editor123', 10),
        roles: ['editor'],
        createdAt: new Date().toISOString()
      },
      {
        id: (Date.now() + 2).toString(),
        name: 'Viewer User',
        email: 'viewer@test.com',
        password: await bcrypt.hash('viewer123', 10),
        roles: ['viewer'],
        createdAt: new Date().toISOString()
      },
      {
        id: (Date.now() + 3).toString(),
        name: 'Multi Role User',
        email: 'multi@test.com',
        password: await bcrypt.hash('multi123', 10),
        roles: ['editor', 'viewer'],
        createdAt: new Date().toISOString()
      }
    ];

    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    
    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Test Users Created:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ Admin:  admin@test.com  / admin123          │');
    console.log('│ Editor: editor@test.com / editor123         │');
    console.log('│ Viewer: viewer@test.com / viewer123         │');
    console.log('│ Multi:  multi@test.com  / multi123          │');
    console.log('└─────────────────────────────────────────────┘');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
