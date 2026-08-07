import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ error: 'user_id required' });
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Enrich favorites with property data
      const enriched = await Promise.all((favorites || []).map(async (fav) => {
        let propertyData = null;
        if (fav.property_id) {
          const { data: prop } = await supabase
            .from('properties')
            .select('*')
            .eq('id', fav.property_id)
            .single();
          
          if (prop) {
            const { data: city } = await supabase.from('cities').select('name').eq('id', prop.city_id).single();
            const { data: uni } = await supabase.from('universities').select('name').eq('id', prop.university_id).single();
            const { data: imgs } = await supabase.from('property_images').select('image_url, is_cover, display_order').eq('property_id', prop.id);
            const { data: listings } = await supabase.from('listings').select('id, listing_type, price, status').eq('property_id', prop.id);
            const { data: broker } = await supabase.from('broker_profiles').select('company_name, verified_badge, rating, slug').eq('id', prop.broker_id).single();

            propertyData = {
              ...prop,
              cities: city || null,
              universities: uni || null,
              property_images: imgs || [],
              listings: listings || [],
              broker_profiles: broker || null
            };
          }
        }
        return { ...fav, properties: propertyData };
      }));

      return res.status(200).json(enriched);
    }

    if (req.method === 'POST') {
      const { user_id, property_id } = req.body;
      if (!user_id || !property_id) return res.status(400).json({ error: 'user_id and property_id required' });
      const { data: existing } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user_id)
        .eq('property_id', property_id)
        .maybeSingle();
      if (existing) return res.status(200).json(existing);
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id, property_id })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { user_id, property_id, id } = req.body;
      if (id) {
        const { error } = await supabase.from('favorites').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user_id)
          .eq('property_id', property_id);
        if (error) throw error;
      }
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
