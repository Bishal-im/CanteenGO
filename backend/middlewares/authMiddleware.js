const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');
const AdminWhitelist = require('../models/AdminWhitelist');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const protect = async (req, res, next) => {
  let token;

  // Check Authorization Header first (Fallback)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Then check specific separate cookies
  else if (req.cookies?.cg_admin_session) {
    token = req.cookies.cg_admin_session;
    console.log("[Auth] Found Admin Cookie for session verification");
  } else if (req.cookies?.cg_customer_session) {
    token = req.cookies.cg_customer_session;
    console.log("[Auth] Found Customer Cookie for session verification");
  }

  if (!token) {
    console.log("[Auth] No session token found in headers or cookies");
    return res.status(401).json({ message: 'Not authorized, no session found' });
  }

  try {
    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ message: 'Not authorized, session expired' });
    }

    // Sync with MongoDB User
    let user = await User.findOne({ email: supabaseUser.email });

    if (!user) {
      // First time login — check if email is on the Admin Whitelist
      const whitelisted = await AdminWhitelist.findOne({ email: supabaseUser.email.toLowerCase() });
      const assignedRole = whitelisted ? 'admin' : 'customer';
      const assignedName = whitelisted?.name || supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0];

      console.log(`[Auth] First login for ${supabaseUser.email} — assigning role: ${assignedRole}`);

      user = await User.create({
        name: assignedName,
        email: supabaseUser.email,
        password: 'SUPABASE_AUTH_USER',
        role: assignedRole,
      });
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

module.exports = { protect, admin };
