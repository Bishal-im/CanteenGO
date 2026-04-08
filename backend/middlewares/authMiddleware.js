const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  else if (req.cookies?.cg_admin_session) {
    token = req.cookies.cg_admin_session;
  } else if (req.cookies?.cg_customer_session) {
    token = req.cookies.cg_customer_session;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no session found' });
  }

  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ message: 'Not authorized, session expired' });
    }

    let user = await User.findOne({ email: supabaseUser.email.toLowerCase().trim() });

    if (!user) {
      // First time login - Create user and let getProfile handle auto-linking
      user = await User.create({
        name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        email: supabaseUser.email.toLowerCase().trim(),
        password: 'SUPABASE_AUTH_USER', // Placeholder
        role: 'customer', // Default, auto-upgraded in profile fetch if cafeteria owner
      });
      console.log(`[Auth] Created new user entry for ${user.email}`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Authorization error' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Unauthorized - Admin role required' });
  }
};

const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
      next();
    } else {
      res.status(403).json({ message: 'Unauthorized - SuperAdmin role required' });
    }
  };

module.exports = { protect, admin, superAdmin };
