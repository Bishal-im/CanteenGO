const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const wipeDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Define simple models for cleanup
        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}, { strict: false }));
        const Cafeteria = mongoose.model('Cafeteria', new mongoose.Schema({}, { strict: false }));
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const AdminWhitelist = mongoose.model('AdminWhitelist', new mongoose.Schema({}, { strict: false }));

        console.log('Purging records...');

        const orderResult = await Order.deleteMany({});
        console.log(`- Deleted ${orderResult.deletedCount} orders.`);

        const menuResult = await MenuItem.deleteMany({});
        console.log(`- Deleted ${menuResult.deletedCount} menu items.`);

        const cafeResult = await Cafeteria.deleteMany({});
        console.log(`- Deleted ${cafeResult.deletedCount} cafeterias.`);

        const whitelistResult = await AdminWhitelist.deleteMany({});
        console.log(`- Deleted ${whitelistResult.deletedCount} whitelist entries.`);

        // Delete all users EXCEPT the designated SuperAdmin
        const userResult = await User.deleteMany({ 
            email: { $ne: 'binodstha06@gmail.com' } 
        });
        console.log(`- Deleted ${userResult.deletedCount} users (Preserved binodstha06@gmail.com).`);

        console.log('\n✅ Database wipe complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error during wipe:', error);
        process.exit(1);
    }
};

wipeDatabase();
