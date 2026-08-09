import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, broker_id, status, featured } = req.query;

      if (id) {
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (error) throw error;

        const { data: city } = await supabase.from('cities').select('id, name, governorate').eq('id', data.city_id).single();
        const { data: uni } = await supabase.from('universities').select('id, name').eq('id', data.university_id).single();
        const { data: images } = await supabase.from('property_images').select('*').eq('property_id', id);
        const { data: listings } = await supabase.from('listings').select('*').eq('property_id', id);
        const { data: propAmenities } = await supabase.from('property_amenities').select('amenity_id').eq('property_id', id);
        
        let amenitiesData = [];
        if (propAmenities && propAmenities.length) {
          const { data: a } = await supabase.from('amenities').select('id, name, icon').in('id', propAmenities.map(p => p.amenity_id));
          amenitiesData = (a || []).map(am => ({ amenity_id: am.id, amenities: am }));
        }

        const { data: rooms } = await supabase.from('rooms').select('*').eq('property_id', id);
        let roomsData = rooms || [];
        if (roomsData.length) {
          const { data: beds } = await supabase.from('beds').select('*').in('room_id', roomsData.map(r => r.id));
          roomsData = roomsData.map(r => ({ ...r, beds: (beds || []).filter(b => b.room_id === r.id) }));
        }

        const { data: reviews } = await supabase.from('reviews').select('*').eq('property_id', id);
        let reviewsData = reviews || [];
        if (reviewsData.length) {
          const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, avatar').in('id', reviewsData.map(r => r.student_id));
          reviewsData = reviewsData.map(r => ({ ...r, profiles: (profiles || []).find(p => p.id === r.student_id) || null }));
        }

        const { data: broker } = await supabase.from('broker_profiles').select('id, user_id, company_name, bio, rating, review_count, verified_badge, slug, response_time').eq('id', data.broker_id).single();
        let brokerProfile = null;
        if (broker) {
          const { data: bp } = await supabase.from('profiles').select('first_name, last_name, avatar, phone').eq('id', broker.user_id).single();
          brokerProfile = { ...broker, profiles: bp || null };
        }

        const result = {
          ...data,
          cities: city || null,
          universities: uni || null,
          property_images: images || [],
          property_amenities: amenitiesData,
          rooms: roomsData,
          listings: listings || [],
          reviews: reviewsData,
          broker_profiles: brokerProfile
        };
        return res.status(200).json(result);
      }

      let q = supabase.from('properties').select('*').order('created_at', { ascending: false });

      if (broker_id) q = q.eq('broker_id', broker_id);
      if (status === 'all') {
        // No status filter — return every property (admin use only)
      } else if (status) {
        q = q.eq('status', status);
      } else if (!broker_id) {
        q = q.eq('status', 'active');
      }
      if (featured === 'true') q = q.limit(6);

      const { data: properties, error } = await q;
      if (error) throw error;

      // Enrich properties
      const enriched = await Promise.all((properties || []).map(async (prop) => {
        const { data: city } = await supabase.from('cities').select('name').eq('id', prop.city_id).single();
        const { data: uni } = await supabase.from('universities').select('name').eq('id', prop.university_id).single();
        const { data: images } = await supabase.from('property_images').select('image_url, is_cover, display_order').eq('property_id', prop.id);
        const { data: listings } = await supabase.from('listings').select('id, listing_type, price, status, deposit').eq('property_id', prop.id);
        const { data: broker } = await supabase.from('broker_profiles').select('company_name, verified_badge, rating, slug').eq('id', prop.broker_id).single();

        return {
          ...prop,
          cities: city || null,
          universities: uni || null,
          property_images: images || [],
          listings: listings || [],
          broker_profiles: broker || null
        };
      }));

      return res.status(200).json(enriched);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const {
        title, description, city_id, district, address, latitude, longitude,
        floor, area, bedrooms, bathrooms, furnished, gender_allowed,
        university_id, broker_id, owner_id, status, amenities, images,
        rooms, listings,
      } = body;

      if (!title || !broker_id) return res.status(400).json({ error: 'title and broker_id required' });

      const { data: prop, error } = await supabase
        .from('properties')
        .insert({
          title,
          description: description || '',
          city_id,
          district: district || '',
          address: address || '',
          latitude: latitude || null,
          longitude: longitude || null,
          floor: floor || 0,
          area: area || 0,
          bedrooms: bedrooms || 1,
          bathrooms: bathrooms || 1,
          furnished: !!furnished,
          gender_allowed: gender_allowed || 'any',
          university_id: university_id || null,
          broker_id,
          owner_id: owner_id || broker_id,
          status: 'pending',
          rejection_reason: null,
        })
        .select()
        .single();
      if (error) throw error;

      if (images?.length) {
        await supabase.from('property_images').insert(
          images.map((url, i) => ({
            property_id: prop.id,
            image_url: url,
            display_order: i,
            is_cover: i === 0,
          }))
        );
      }

      if (amenities?.length) {
        await supabase.from('property_amenities').insert(
          amenities.map((amenity_id) => ({ property_id: prop.id, amenity_id }))
        );
      }

      if (rooms?.length) {
        for (const room of rooms) {
          const { data: r } = await supabase
            .from('rooms')
            .insert({
              property_id: prop.id,
              name: room.name,
              beds_count: room.beds_count || 1,
              gender: room.gender || 'any',
              available: true,
            })
            .select()
            .single();
          if (r && room.beds?.length) {
            await supabase.from('beds').insert(
              room.beds.map((b) => ({
                room_id: r.id,
                bed_number: b.bed_number,
                price: b.price,
                status: 'available',
              }))
            );
          }
        }
      }

      if (listings?.length) {
        await supabase.from('listings').insert(
          listings.map((l) => ({
            property_id: prop.id,
            room_id: l.room_id || null,
            bed_id: l.bed_id || null,
            listing_type: l.listing_type || 'entire_apartment',
            price: l.price,
            deposit: l.deposit || 0,
            minimum_months: l.minimum_months || 1,
            available_from: l.available_from || new Date().toISOString().slice(0, 10),
            status: 'active',
          }))
        );
      }

      return res.status(201).json(prop);
    }

    if (req.method === 'PUT') {
      const { id, amenities, images, admin_action, rejection_reason, price, deposit, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const allowed = [
        'title', 'description', 'city_id', 'district', 'address', 'latitude', 'longitude',
        'floor', 'area', 'bedrooms', 'bathrooms', 'furnished', 'gender_allowed',
        'university_id', 'status', 'rejection_reason'
      ];
      const payload = {};
      for (const k of allowed) if (rest[k] !== undefined) payload[k] = rest[k];
      
      // If a broker is editing their property, it must go back to pending
      if (!admin_action) {
        payload.status = 'pending';
        payload.rejection_reason = null;
      } else {
        // Admin action can set rejection reason
        if (rejection_reason !== undefined) payload.rejection_reason = rejection_reason;
      }

      const { data, error } = await supabase.from('properties').update(payload).eq('id', id).select().single();
      if (error) throw error;

      // Real-time Notification for property status change by Admin
      if (admin_action && data.broker_id) {
        // Need to get user_id of the broker to send notification
        const { data: broker } = await supabase.from('broker_profiles').select('user_id').eq('id', data.broker_id).single();
        if (broker?.user_id) {
          if (payload.status === 'active') {
            await supabase.from('notifications').insert({
              user_id: broker.user_id,
              title: 'Property Approved',
              message: `Your property "${data.title}" has been approved and is now live.`,
              type: 'property_approved',
              is_read: false
            });
          } else if (payload.status === 'rejected') {
            await supabase.from('notifications').insert({
              user_id: broker.user_id,
              title: 'Property Rejected',
              message: `Your property "${data.title}" was rejected. Reason: ${payload.rejection_reason || 'See details'}`,
              type: 'property_rejected',
              is_read: false
            });
          }
        }
      }

      if (amenities) {
        await supabase.from('property_amenities').delete().eq('property_id', id);
        if (amenities.length) {
          await supabase.from('property_amenities').insert(
            amenities.map((amenity_id) => ({ property_id: id, amenity_id }))
          );
        }
      }

      if (images) {
        await supabase.from('property_images').delete().eq('property_id', id);
        if (images.length) {
          await supabase.from('property_images').insert(
            images.map((url, i) => ({
              property_id: id,
              image_url: typeof url === 'string' ? url : url.image_url,
              display_order: typeof url === 'object' ? url.display_order : i,
              is_cover: typeof url === 'object' ? url.is_cover : i === 0,
            }))
          );
        }
      }

      // Update listing price and deposit if provided
      if (price !== undefined) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id')
          .eq('property_id', id)
          .eq('status', 'active')
          .order('id', { ascending: true })
          .limit(1);
        if (listings && listings.length > 0) {
          await supabase
            .from('listings')
            .update({ price: Number(price), deposit: deposit !== undefined ? Number(deposit) : undefined })
            .eq('id', listings[0].id);
        }
      }

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('properties').update({ status: 'archived' }).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('properties error:', err);
    res.status(500).json({ error: err.message });
  }
}
