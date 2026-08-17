import supabase from './_db-client.js';

export async function requireAuth(req, res, allowedRoles = []) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return null;
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role || 'tenant';
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(role) && role !== 'super_admin') {
    res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    return null;
  }
  
  return { user, role };
}
