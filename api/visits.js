import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { student_id, broker_id, id } = req.query;
      if (id) {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;

        // Fetch listing + property separately
        let listing = null;
        if (data.listing_id) {
          const { data: l } = await supabase
            .from('listings')
            .select('id, listing_type, price, property_id, status')
            .eq('id', data.listing_id)
            .single();
          if (l) {
            const { data: prop } = await supabase
              .from('properties')
              .select('id, title, district, address')
              .eq('id', l.property_id)
              .single();
            const { data: imgs } = await supabase
              .from('property_images')
              .select('image_url, is_cover')
              .eq('property_id', l.property_id);
            listing = { ...l, properties: prop ? { ...prop, property_images: imgs || [] } : null };
          }
        }
        return res.status(200).json({ ...data, listings: listing });
      }

      let q = supabase.from('visits').select('*').order('visit_date', { ascending: false });
      if (student_id) q = q.eq('student_id', student_id);

      // broker_id query param is a UUID (user_id from auth) — convert to broker_profiles.id (integer)
      if (broker_id) {
        const { data: bpRow } = await supabase
          .from('broker_profiles')
          .select('id')
          .eq('user_id', broker_id)
          .maybeSingle();
        if (bpRow) {
          q = q.eq('broker_id', bpRow.id);
        } else {
          // No broker profile found for this user, return empty
          return res.status(200).json([]);
        }
      }

      const { data: qData, error: qError } = await q;
      if (qError) throw qError;

      // Enrich each visit with listing+property data
      const enriched = await Promise.all((qData || []).map(async (v) => {
        let listing = null;
        let student = null;
        let broker = null;

        if (v.listing_id) {
          const { data: l } = await supabase
            .from('listings')
            .select('id, listing_type, price, property_id, status')
            .eq('id', v.listing_id)
            .single();
          if (l) {
            const { data: prop } = await supabase
              .from('properties')
              .select('id, title, district, address')
              .eq('id', l.property_id)
              .single();
            const { data: imgs } = await supabase
              .from('property_images')
              .select('image_url, is_cover')
              .eq('property_id', l.property_id);
            listing = { ...l, properties: prop ? { ...prop, property_images: imgs || [] } : null };
          }
        }
        if (v.student_id) {
          const { data: s } = await supabase.from('profiles').select('first_name, last_name, email, phone, avatar').eq('id', v.student_id).single();
          student = s;
        }
        // v.broker_id is broker_profiles.id (integer) — look up the profile via broker_profiles
        if (v.broker_id) {
          const { data: bp } = await supabase
            .from('broker_profiles')
            .select('user_id, company_name')
            .eq('id', v.broker_id)
            .single();
          if (bp?.user_id) {
            const { data: b } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, phone')
              .eq('id', bp.user_id)
              .single();
            broker = b;
          }
        }
        return { ...v, listings: listing, student, broker };
      }));

      return res.status(200).json(enriched);
    }

    if (req.method === 'POST') {
      const { listing_id, student_id, broker_id, visit_date, visit_time, notes, booking_fee } = req.body;
      if (!listing_id || !student_id || !visit_date || !visit_time) {
        return res.status(400).json({ error: 'listing_id, student_id, visit_date, visit_time required' });
      }

      let resolvedBrokerId = null;   // integer (broker_profiles.id) — for DB insert
      let resolvedBrokerUserId = null; // UUID — for notifications

      if (broker_id) {
        // broker_id passed from frontend is a UUID (user_id)
        resolvedBrokerUserId = broker_id;
        const { data: bp } = await supabase
          .from('broker_profiles')
          .select('id')
          .eq('user_id', broker_id)
          .maybeSingle();
        resolvedBrokerId = bp?.id || null;
      } else {
        // Look up broker from the listing's property
        const { data: listing } = await supabase
          .from('listings')
          .select('property_id, properties(broker_id)')
          .eq('id', listing_id)
          .single();
        resolvedBrokerId = listing?.properties?.broker_id || null; // already an integer
        if (resolvedBrokerId) {
          const { data: bp } = await supabase
            .from('broker_profiles')
            .select('user_id')
            .eq('id', resolvedBrokerId)
            .single();
          resolvedBrokerUserId = bp?.user_id || null;
        }
      }

      // Validate: visit date must not be in the past
      const today = new Date().toISOString().slice(0, 10);
      if (visit_date < today) {
        return res.status(400).json({ error: 'Visit date cannot be in the past.' });
      }
      // If today, validate that time hasn't already passed
      if (visit_date === today) {
        const nowHour = new Date().getHours();
        const visitHour = parseInt(visit_time.split(':')[0], 10);
        if (visitHour <= nowHour) {
          return res.status(400).json({ error: 'Visit time has already passed for today. Please choose a future time.' });
        }
      }

      // Double-booking check: prevent two students from booking the same slot
      const { data: existing } = await supabase
        .from('visits')
        .select('id')
        .eq('listing_id', listing_id)
        .eq('visit_date', visit_date)
        .eq('visit_time', visit_time)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle();
      if (existing) {
        return res.status(409).json({ error: 'This time slot is already booked. Please choose a different date or time.' });
      }

      const { data, error } = await supabase
        .from('visits')
        .insert({
          listing_id,
          student_id,
          broker_id: resolvedBrokerId,  // integer (broker_profiles.id)
          visit_date,
          visit_time,
          status: 'pending',
          notes: notes || '',
        })
        .select()
        .single();
      if (error) throw error;

      // Send notifications using UUID (user_id)
      const notifRows = [
        {
          user_id: student_id,
          title: 'Visit Booked',
          message: `Your visit on ${visit_date} at ${visit_time} has been requested.`,
          type: 'new_visit',
          is_read: false,
        },
        resolvedBrokerUserId
          ? {
              user_id: resolvedBrokerUserId,
              title: 'New Visit Request',
              message: `A student requested a visit on ${visit_date} at ${visit_time}.`,
              type: 'new_visit',
              is_read: false,
            }
          : null,
      ].filter(Boolean);
      await supabase.from('notifications').insert(notifRows);

      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, notes } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const payload = {};
      if (status) payload.status = status;
      if (notes !== undefined) payload.notes = notes;

      const { data, error } = await supabase.from('visits').update(payload).eq('id', id).select().single();
      if (error) throw error;

      if (status && data.student_id) {
        await supabase.from('notifications').insert({
          user_id: data.student_id,
          title: `Visit ${status}`,
          message: `Your visit on ${data.visit_date} was marked as ${status}.`,
          type: status === 'confirmed' ? 'visit_confirmed' : status === 'cancelled' ? 'visit_cancelled' : 'booking',
          is_read: false,
        });
      }

      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('visits error:', err);
    res.status(500).json({ error: err.message });
  }
}
