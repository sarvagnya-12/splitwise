const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const makeAdmin = async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Please provide an email address. Usage: node makeAdmin.js <email>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Success! ${email} is now an administrator.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

makeAdmin();
