require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

async function makeAdmin() {
  if (!email) {
    console.error('Uso: npm run make-admin -- <email>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );
  if (!user) {
    console.error(`No existe un usuario con el email: ${email}`);
  } else {
    console.log(`✅ ${user.name} (${user.email}) ahora es admin`);
  }
  await mongoose.disconnect();
}

makeAdmin().catch(console.error);
