import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { property_id, id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('listings').select('*, properties(*)').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let q = supabase.from('listings').select('*').order('id');
      if (property_id) q = q.eq('property_id', property_id);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { data, error } = await supabase
        .from('listings')
        .insert({
          property_id: body.property_id,
          room_id: body.room_id || null,
          bed_id: body.bed_id || null,
          listing_type: body.listing_type || 'entire_apartment',
          price: body.price,
          deposit: body.deposit || 0,
          minimum_months: body.minimum_months || 1,
          available_from: body.available_from || new Date().toISOString().slice(0, 10),
          status: body.status || 'active',
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('listings').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('listings').update({ status: 'deleted' }).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
