import supabase from './_db-client.js';
import { requireAuth } from './_auth-helper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { property_id } = req.query;
      let q = supabase
        .from('reviews')
        .select('*, profiles:student_id(first_name, last_name, avatar)')
        .order('created_at', { ascending: false });
      if (property_id) q = q.eq('property_id', property_id);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const auth = await requireAuth(req, res, ['student', 'tenant', 'broker', 'owner', 'admin', 'super_admin']);
      if (!auth) return;
      const { user } = auth;

      const { property_id, rating, comment } = req.body;
      if (!property_id || !rating) {
        return res.status(400).json({ error: 'property_id, rating required' });
      }

      // 1. Check uniqueness (though DB handles it, good for graceful error)
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('property_id', property_id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (existing) {
        return res.status(409).json({ error: 'You have already reviewed this property.' });
      }

      // 2. Insert Review
      const { data, error } = await supabase
        .from('reviews')
        .insert({ property_id, student_id: user.id, rating, comment: comment || '' })
        .select()
        .single();
      if (error) throw error;

      // 3. Update Property avg rating
      const { data: propReviews } = await supabase.from('reviews').select('rating').eq('property_id', property_id);
      if (propReviews && propReviews.length > 0) {
        const avg = propReviews.reduce((s, r) => s + r.rating, 0) / propReviews.length;
        await supabase
          .from('properties')
          .update({ rating_avg: avg.toFixed(2), review_count: propReviews.length })
          .eq('id', property_id);
      }

      // 4. Update Broker rating
      const { data: prop } = await supabase.from('properties').select('broker_id').eq('id', property_id).single();
      if (prop?.broker_id) {
        const { data: props } = await supabase.from('properties').select('id').eq('broker_id', prop.broker_id);
        const ids = (props || []).map((p) => p.id);
        if (ids.length) {
          const { data: allReviews } = await supabase.from('reviews').select('rating').in('property_id', ids);
          if (allReviews?.length) {
            const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
            await supabase
              .from('broker_profiles')
              .update({ rating: Math.round(avg * 10) / 10, review_count: allReviews.length })
              .eq('id', prop.broker_id);
          }
        }
      }

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
