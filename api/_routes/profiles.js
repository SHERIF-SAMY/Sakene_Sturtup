import supabase from '../_db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, role, email, phone, check } = req.query;

      if (check === 'unique') {
        const checkEmail = email ? email.trim().toLowerCase() : null;
        const checkPhone = phone ? phone.trim() : null;

        if (checkEmail) {
          const { data: eMatch } = await supabase.from('profiles').select('id').eq('email', checkEmail).maybeSingle();
          if (eMatch) return res.status(409).json({ error: 'البريد الإلكتروني مستخدم بالفعل بحساب آخر.' });
        }
        if (checkPhone) {
          const { data: pMatch } = await supabase.from('profiles').select('id').eq('phone', checkPhone).maybeSingle();
          if (pMatch) return res.status(409).json({ error: 'رقم الهاتف مستخدم بالفعل بحساب آخر.' });
        }
        return res.status(200).json({ unique: true });
      }

      if (id) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Profile not found' });
        return res.status(200).json(data);
      }
      if (email) {
        const { data, error } = await supabase.from('profiles').select('*').eq('email', email.trim().toLowerCase()).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Profile not found' });
        return res.status(200).json(data);
      }
      if (phone) {
        const { data, error } = await supabase.from('profiles').select('*').eq('phone', phone.trim()).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Profile not found' });
        return res.status(200).json(data);
      }
      let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (role) q = q.eq('role', role);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { id, email, first_name, last_name, phone, role, avatar, is_broker_account } = req.body;
      if (!id || !email) return res.status(400).json({ error: 'id and email required' });

      if (phone) {
        const { data: pMatch } = await supabase.from('profiles').select('id').eq('phone', phone.trim()).neq('id', id).maybeSingle();
        if (pMatch) return res.status(409).json({ error: 'رقم الهاتف مستخدم بالفعل بحساب آخر.' });
      }

      const { data: existing } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      
      const targetRole = role || (email.includes('admin') ? 'admin' : 'tenant');

      if (existing) {
        if (role && existing.role !== targetRole) {
          const { data: updated } = await supabase
            .from('profiles')
            .update({ role: targetRole, is_broker_account: !!is_broker_account })
            .eq('id', id)
            .select()
            .single();
          return res.status(200).json(updated || existing);
        }
        return res.status(200).json(existing);
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id,
          email,
          first_name: first_name || 'User',
          last_name: last_name || '',
          phone: phone || null,
          role: targetRole,
          is_broker_account: !!is_broker_account,
          avatar: avatar || null,
          is_verified: true,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          const { data: existing2 } = await supabase.from('profiles').select('*').eq('id', id).single();
          return res.status(200).json(existing2);
        }
        throw error;
      }
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });

      if (updates.phone) {
        const { data: pMatch } = await supabase.from('profiles').select('id').eq('phone', updates.phone.trim()).neq('id', id).maybeSingle();
        if (pMatch) return res.status(409).json({ error: 'رقم الهاتف مستخدم بالفعل بحساب آخر.' });
      }

      const allowed = ['first_name', 'last_name', 'phone', 'avatar', 'role', 'is_verified', 'status', 'is_broker_account'];
      const payload = {};
      for (const k of allowed) if (updates[k] !== undefined) payload[k] = updates[k];
      const { data, error } = await supabase.from('profiles').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('profiles error:', err);
    res.status(500).json({ error: err.message });
  }
}
