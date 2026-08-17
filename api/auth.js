import supabase from './_db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const action = req.query.action || req.body.action || 'register';

    if (action === 'seed') {
      const demoUsers = [
        { email: 'admin@agarly.com', first_name: 'مدير', last_name: 'النظام', role: 'admin' },
        { email: 'tenant@agarly.com', first_name: 'مستأجر', last_name: 'تجريبي', role: 'tenant' },
        { email: 'broker@agarly.com', first_name: 'وسيط', last_name: 'تجريبي', role: 'broker' },
        { email: 'owner@agarly.com', first_name: 'مالك', last_name: 'تجريبي', role: 'owner' },
      ];

      const results = [];
      for (const u of demoUsers) {
        const { data: existing } = await supabase.from('profiles').select('*').eq('email', u.email).maybeSingle();
        if (existing) {
          const { data: updated, error: updateErr } = await supabase
            .from('profiles')
            .update({ role: u.role })
            .eq('id', existing.id)
            .select()
            .single();
          if (updateErr) console.error('Seed update error:', updateErr);
          results.push(updated || existing);
        } else {
          // generate fixed deterministic id or let supabase generate
          const fakeUid = `00000000-0000-4000-a000-${u.role.padEnd(12, '0').slice(0, 12)}`;
          const { data, error } = await supabase
            .from('profiles')
            .upsert({
              id: fakeUid,
              email: u.email,
              first_name: u.first_name,
              last_name: u.last_name,
              role: u.role,
              is_verified: true,
              status: 'active',
            })
            .select()
            .single();
          if (!error) results.push(data);
        }
      }
      return res.status(200).json({ ok: true, seeded: results });
    }

    if (req.method === 'POST') {
      const { id, email, first_name, last_name, phone, role, is_broker_account } = req.body;
      if (!id || !email) {
        return res.status(400).json({ error: 'id and email required' });
      }

      const userRole = ['tenant', 'broker', 'owner', 'admin', 'super_admin'].includes(role) ? role : 'tenant';

      // Use upsert to handle the race condition with AuthContext and ensure the correct role is saved
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id,
          email,
          first_name: first_name || 'User',
          last_name: last_name || '',
          phone: phone || null,
          role: userRole,
          is_broker_account: !!is_broker_account,
          is_verified: true,
          status: 'active',
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      if (userRole === 'broker' || userRole === 'owner') {
        const { data: existingBroker } = await supabase.from('broker_profiles').select('id').eq('user_id', id).maybeSingle();
        if (!existingBroker) {
          const slug = `${first_name}-${last_name || userRole}-${Date.now().toString(36)}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-');

          try {
            await supabase.from('broker_profiles').insert({
              user_id: id,
              company_name: `${first_name} ${last_name || ''}`.trim(),
              bio: is_broker_account ? 'سمسار عقاري معتمد في كفر الشيخ' : userRole === 'owner' ? 'مالك عقار مباشر' : 'وسيط عقاري في كفر الشيخ',
              experience_years: 1,
              slug,
            });
          } catch (bpErr) {
            console.error('Error creating broker profile:', bpErr);
          }
        }
      }

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('auth API error:', err);
    res.status(500).json({ error: err.message });
  }
}
