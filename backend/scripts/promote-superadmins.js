const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const emails = [
  'vipassibajracharya@gmail.com',
  'binodstha060@gmail.com'
];

const promote = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        for (const email of emails) {
            const formattedEmail = email.toLowerCase().trim();
            const user = await User.findOne({ email: formattedEmail });

            if (user) {
                user.role = 'superadmin';
                await user.save();
                console.log(`[SUCCESS] Promoted ${formattedEmail} to superadmin.`);
            } else {
                // Create a placeholder if they haven't signed up yet
                await User.create({
                    name: formattedEmail.split('@')[0],
                    email: formattedEmail,
                    password: 'SUPABASE_AUTH_USER',
                    role: 'superadmin'
                });
                console.log(`[SUCCESS] Created new superadmin account for ${formattedEmail}.`);
            }
        }

        console.log("Success! All specified accounts are now SuperAdmins.");
        process.exit(0);
    } catch (error) {
        console.error("Error promoting users:", error);
        process.exit(1);
    }
};

promote();
