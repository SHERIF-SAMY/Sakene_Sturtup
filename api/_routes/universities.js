import supabase from '../_db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data: universities, error } = await supabase
        .from('universities')
        .select('*')
        .order('name');
      if (error) throw error;

      // Enrich universities with city data
      const enriched = await Promise.all((universities || []).map(async (uni) => {
        let cityData = null;
        if (uni.city_id) {
          const { data: city } = await supabase
            .from('cities')
            .select('name, governorate')
            .eq('id', uni.city_id)
            .single();
          cityData = city;
        }
        return { ...uni, cities: cityData };
      }));

      return res.status(200).json(enriched);
    }
    if (req.method === 'POST') {
      const { name, city_id, latitude, longitude, logo } = req.body;
      if (!name) return res.status(400).json({ error: 'name required' });
      const { data, error } = await supabase
        .from('universities')
        .insert({ name, city_id, latitude, longitude, logo: logo || null })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('universities').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('universities').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
