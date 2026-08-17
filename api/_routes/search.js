import supabase from '../_db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const {
      q, university_id, city_id, district, gender, listing_type,
      min_price, max_price, furnished, for_students, sort = 'newest', districts: fetchDistricts,
    } = req.query;

    if (fetchDistricts === 'true') {
      const { data: props } = await supabase
        .from('properties')
        .select('district')
        .eq('status', 'active');
      const uniqueDistricts = Array.from(
        new Set((props || []).map((p) => p.district?.trim()).filter(Boolean))
      ).sort();
      return res.status(200).json(uniqueDistricts);
    }

    let query = supabase
      .from('properties')
      .select(`
        *,
        cities(name),
        universities(name),
        property_images(image_url, is_cover, display_order),
        listings(id, listing_type, price, status, deposit),
        broker_profiles:broker_id(company_name, verified_badge, rating, slug),
        property_amenities(amenity_id),
        rooms(id, name, beds_count, beds(id, status))
      `)
      .eq('status', 'active');

    if (university_id) query = query.eq('university_id', university_id);
    if (city_id) query = query.eq('city_id', city_id);
    if (district) query = query.eq('district', district);
    if (gender && gender !== 'any') query = query.in('gender_allowed', [gender, 'any']);
    if (furnished === 'true') query = query.eq('furnished', true);
    if (for_students === 'true') query = query.eq('for_students', true);
    if (q) query = query.or(`title.ilike.%${q}%,district.ilike.%${q}%,description.ilike.%${q}%`);

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let results = data || [];

    // Enrich results with available beds count
    results = results.map((p) => {
      let availableBeds = 0;
      if (p.rooms && p.rooms.length > 0) {
        p.rooms.forEach((r) => {
          if (r.beds) {
            availableBeds += r.beds.filter((b) => b.status === 'available').length;
          }
        });
      }
      return {
        ...p,
        available_beds_count: availableBeds,
      };
    });

    // For shared beds, we exclude properties that have 0 available beds
    results = results.filter((p) => {
      const isSharedBed = (p.listings || []).some((l) => l.listing_type === 'shared_bed' && l.status === 'active');
      if (isSharedBed && p.available_beds_count === 0) {
        return false;
      }
      return true;
    });

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
    } else {
      // Highest rating first, then newest registered by default
      results.sort((a, b) => {
        const rA = Number(a.rating_avg || a.broker_profiles?.rating || 0);
        const rB = Number(b.rating_avg || b.broker_profiles?.rating || 0);
        if (rB !== rA) return rB - rA;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error('search error:', err);
    res.status(500).json({ error: err.message });
  }
}
