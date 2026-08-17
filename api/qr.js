import supabase from './_db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { broker_id } = req.query;
      let q = supabase.from('qr_codes').select('*').order('created_at', { ascending: false });
      if (broker_id) q = q.eq('broker_id', broker_id);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { broker_id, property_id, code_type, code_value } = req.body;
      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          broker_id,
          property_id: property_id || null,
          code_type: code_type || 'broker',
          code_value,
          scan_count: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, code_value } = req.body;
      // increment scan
      if (code_value && !id) {
        const { data: row } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('code_value', code_value)
          .maybeSingle();
        if (row) {
          const { data, error } = await supabase
            .from('qr_codes')
            .update({ scan_count: (row.scan_count || 0) + 1 })
            .eq('id', row.id)
            .select()
            .single();
          if (error) throw error;
          return res.status(200).json(data);
        }
        return res.status(404).json({ error: 'QR not found' });
      }
      return res.status(400).json({ error: 'invalid request' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
