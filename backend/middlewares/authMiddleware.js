const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token with Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      // Sync with MongoDB User
      let user = await User.findOne({ email: supabaseUser.email });

      if (!user) {
        // First time login - create user in MongoDB
        user = await User.create({
          name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
          email: supabaseUser.email,
          password: 'SUPABASE_AUTH_USER', // Placeholder
          role: 'customer' // Default role
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
