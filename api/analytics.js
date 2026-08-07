import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { scope, broker_id, user_id } = req.query;

    if (scope === 'admin') {
      const [users, properties, visits, universities, cities, reviews] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('visits').select('id', { count: 'exact', head: true }),
        supabase.from('universities').select('id', { count: 'exact', head: true }),
        supabase.from('cities').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
      ]);

      const { data: recentVisits } = await supabase
        .from('visits')
        .select('status, visit_date, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: roleCounts } = await supabase.from('profiles').select('role');
      const roles = { student: 0, broker: 0, admin: 0, owner: 0 };
      (roleCounts || []).forEach((r) => {
        if (roles[r.role] !== undefined) roles[r.role]++;
      });

      return res.status(200).json({
        users: users.count || 0,
        properties: properties.count || 0,
        visits: visits.count || 0,
        universities: universities.count || 0,
        cities: cities.count || 0,
        reviews: reviews.count || 0,
        roles,
        recentVisits: recentVisits || [],
      });
    }

    if (scope === 'broker' && broker_id) {
      const { data: props } = await supabase.from('properties').select('id, status').eq('broker_id', broker_id);
      const propIds = (props || []).map((p) => p.id);

      let visits = [];
      let reviews = [];
      let qr = [];
      if (propIds.length) {
        const v = await supabase.from('visits').select('*').in(
          'listing_id',
          (
            await supabase.from('listings').select('id').in('property_id', propIds)
          ).data?.map((l) => l.id) || [-1]
        );
        visits = v.data || [];
        const r = await supabase.from('reviews').select('*').in('property_id', propIds);
        reviews = r.data || [];
      }
      const q = await supabase.from('qr_codes').select('*').eq('broker_id', broker_id);
      qr = q.data || [];

      const pending = visits.filter((v) => v.status === 'pending').length;
      const confirmed = visits.filter((v) => v.status === 'confirmed').length;
      const completed = visits.filter((v) => v.status === 'completed').length;

      return res.status(200).json({
        properties: props?.length || 0,
        activeProperties: (props || []).filter((p) => p.status === 'active').length,
        visits: visits.length,
        pendingVisits: pending,
        confirmedVisits: confirmed,
        completedVisits: completed,
        reviews: reviews.length,
        avgRating: reviews.length
          ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
          : 0,
        qrScans: qr.reduce((s, c) => s + (c.scan_count || 0), 0),
        conversionRate: visits.length
          ? Math.round((completed / visits.length) * 100)
          : 0,
      });
    }

    if (scope === 'student' && user_id) {
      const [fav, vis, notif] = await Promise.all([
        supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user_id),
        supabase.from('visits').select('*').eq('student_id', user_id),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user_id).eq('is_read', false),
      ]);
      const visits = vis.data || [];
      return res.status(200).json({
        favorites: fav.count || 0,
        bookings: visits.length,
        upcoming: visits.filter((v) => ['pending', 'confirmed'].includes(v.status)).length,
        unread: notif.count || 0,
      });
    }

    return res.status(400).json({ error: 'invalid scope' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
