import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { slug, user_id, id } = req.query;

      if (slug || id || user_id) {
        let q = supabase.from('broker_profiles').select('*');
        if (slug) q = q.eq('slug', slug);
        else if (id) q = q.eq('id', id);
        else q = q.eq('user_id', user_id);
        const { data: broker, error } = await q.single();
        if (error) throw error;

        // fetch profile separately to avoid FK cache issues
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone, avatar, is_verified')
          .eq('id', broker.user_id)
          .single();

        const { data: properties } = await supabase
          .from('properties')
          .select(`
            *,
            cities(name),
            universities(name),
            property_images(image_url, is_cover, display_order),
            listings(id, listing_type, price, status)
          `)
          .eq('broker_id', broker.id)
          .eq('status', 'active');

        return res.status(200).json({ ...broker, profiles: profileData || null, properties: properties || [] });
      }

      const { data, error } = await supabase
        .from('broker_profiles')
        .select('*')
        .order('rating', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { user_id, company_name, bio, experience_years, slug } = req.body;
      if (!user_id || !slug) return res.status(400).json({ error: 'user_id and slug required' });
      const { data, error } = await supabase
        .from('broker_profiles')
        .insert({
          user_id,
          company_name: company_name || '',
          bio: bio || '',
          experience_years: experience_years || 0,
          rating: 5,
          review_count: 0,
          response_rate: 100,
          response_time: '1 hour',
          verified_badge: false,
          qr_code: slug,
          slug,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from('profiles').update({ role: 'broker' }).eq('id', user_id);
      await supabase.from('qr_codes').insert({
        broker_id: data.id,
        property_id: null,
        code_type: 'broker',
        code_value: slug,
        scan_count: 0,
      });
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const allowed = [
        'company_name', 'bio', 'experience_years', 'verified_badge',
        'response_time', 'response_rate', 'slug',
      ];
      const payload = {};
      for (const k of allowed) if (rest[k] !== undefined) payload[k] = rest[k];
      const { data, error } = await supabase.from('broker_profiles').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
