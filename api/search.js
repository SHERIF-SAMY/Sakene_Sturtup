import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const {
      q, university_id, city_id, gender, listing_type,
      min_price, max_price, furnished, sort = 'newest',
    } = req.query;

    let query = supabase
      .from('properties')
      .select(`
        *,
        cities(name),
        universities(name),
        property_images(image_url, is_cover, display_order),
        listings(id, listing_type, price, status, deposit),
        broker_profiles:broker_id(company_name, verified_badge, rating, slug),
        property_amenities(amenity_id)
      `)
      .eq('status', 'active');

    if (university_id) query = query.eq('university_id', university_id);
    if (city_id) query = query.eq('city_id', city_id);
    if (gender && gender !== 'any') query = query.in('gender_allowed', [gender, 'any']);
    if (furnished === 'true') query = query.eq('furnished', true);
    if (q) query = query.or(`title.ilike.%${q}%,district.ilike.%${q}%,description.ilike.%${q}%`);

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let results = data || [];

    if (listing_type) {
      results = results.filter((p) =>
        (p.listings || []).some((l) => l.listing_type === listing_type && l.status === 'active')
      );
    }

    const minP = min_price ? Number(min_price) : null;
    const maxP = max_price ? Number(max_price) : null;
    if (minP != null || maxP != null) {
      results = results.filter((p) => {
        const prices = (p.listings || []).filter((l) => l.status === 'active').map((l) => l.price);
        if (!prices.length) return false;
        const lowest = Math.min(...prices);
        if (minP != null && lowest < minP) return false;
        if (maxP != null && lowest > maxP) return false;
        return true;
      });
    }

    if (sort === 'price_asc') {
      results.sort((a, b) => {
        const pa = Math.min(...(a.listings || []).map((l) => l.price).concat([Infinity]));
        const pb = Math.min(...(b.listings || []).map((l) => l.price).concat([Infinity]));
        return pa - pb;
      });
    } else if (sort === 'price_desc') {
      results.sort((a, b) => {
        const pa = Math.min(...(a.listings || []).map((l) => l.price).concat([0]));
        const pb = Math.min(...(b.listings || []).map((l) => l.price).concat([0]));
        return pb - pa;
      });
    } else if (sort === 'rating') {
      results.sort((a, b) => (b.broker_profiles?.rating || 0) - (a.broker_profiles?.rating || 0));
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error('search error:', err);
    res.status(500).json({ error: err.message });
  }
}
