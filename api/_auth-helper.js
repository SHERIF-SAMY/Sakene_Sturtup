import supabase from './_db-client.js';

export async function requireAuth(req, res, allowedRoles = []) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return null;
  }

  let user = null;
  let role = 'tenant';

  // 1. Try standard Supabase Auth token validation
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (err) {
    console.error('Supabase getUser error:', err);
  }

  // 2. Fallback: if token expired or invalid, check profiles table by user ID
  if (!user && token) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', token)
      .maybeSingle();

    if (profile) {
      user = { id: profile.id, email: profile.email };
      role = profile.role || 'tenant';
    }
  } else if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile) role = profile.role;
  }

  if (!user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role) && role !== 'super_admin') {
    res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    return null;
  }

  return { user, role };
}
