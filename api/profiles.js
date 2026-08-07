import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, role } = req.query;
      if (id) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (role) q = q.eq('role', role);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { id, email, first_name, last_name, phone, role, avatar } = req.body;
      if (!id || !email) return res.status(400).json({ error: 'id and email required' });
      const { data: existing } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (existing) return res.status(200).json(existing);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id,
          email,
          first_name: first_name || 'User',
          last_name: last_name || '',
          phone: phone || null,
          role: role || 'student',
          avatar: avatar || null,
          is_verified: false,
          status: 'active',
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const allowed = ['first_name', 'last_name', 'phone', 'avatar', 'role', 'is_verified', 'status'];
      const payload = {};
      for (const k of allowed) if (updates[k] !== undefined) payload[k] = updates[k];
      const { data, error } = await supabase.from('profiles').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('profiles error:', err);
    res.status(500).json({ error: err.message });
  }
}
