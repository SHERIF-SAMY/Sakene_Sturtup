import supabase from '../_db-client.js';
import { requireAuth } from '../_auth-helper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, broker_id, owner_id, user_id, status, featured } = req.query;

      if (id) {
        const { data, error } = await supabase.from('properties').select('*, property_number').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Property not found' });

        const { data: city } = data.city_id ? await supabase.from('cities').select('id, name, governorate').eq('id', data.city_id).maybeSingle() : { data: null };
        const { data: uni } = data.university_id ? await supabase.from('universities').select('id, name').eq('id', data.university_id).maybeSingle() : { data: null };
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

        const { data: broker } = data.broker_id ? await supabase.from('broker_profiles').select('id, user_id, company_name, bio, rating, review_count, verified_badge, slug, response_time').eq('id', data.broker_id).maybeSingle() : { data: null };
        let brokerProfile = null;
        if (broker) {
          const { data: bp } = broker.user_id ? await supabase.from('profiles').select('first_name, last_name, avatar, phone, role').eq('id', broker.user_id).maybeSingle() : { data: null };
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

      if (user_id || owner_id) {
        const targetId = owner_id || user_id;
        const { data: bp } = await supabase.from('broker_profiles').select('id').eq('user_id', targetId).maybeSingle();
        if (bp) {
          q = q.or(`owner_id.eq.${targetId},broker_id.eq.${bp.id}`);
        } else {
          q = q.eq('owner_id', targetId);
        }
      } else if (broker_id) {
        q = q.eq('broker_id', broker_id);
      }

      if (status === 'all') {
        // Return all statuses
      } else if (status) {
        q = q.eq('status', status);
      } else if (!broker_id && !owner_id && !user_id) {
        q = q.eq('status', 'active');
      }
      if (featured === 'true') {
        q = q.or('is_featured.eq.true,and(rating_avg.gte.4.5,review_count.gte.5)').limit(6);
      }

      const { data: properties, error } = await q;
      if (error) throw error;

      // Enrich properties safely
      const enriched = await Promise.all((properties || []).map(async (prop) => {
        const { data: city } = prop.city_id ? await supabase.from('cities').select('name').eq('id', prop.city_id).maybeSingle() : { data: null };
        const { data: uni } = prop.university_id ? await supabase.from('universities').select('name').eq('id', prop.university_id).maybeSingle() : { data: null };
        const { data: images } = await supabase.from('property_images').select('image_url, is_cover, display_order').eq('property_id', prop.id);
        const { data: listings } = await supabase.from('listings').select('id, listing_type, price, status, deposit').eq('property_id', prop.id);
        const { data: broker } = prop.broker_id ? await supabase.from('broker_profiles').select('company_name, verified_badge, rating, slug').eq('id', prop.broker_id).maybeSingle() : { data: null };
        const { data: owner } = prop.owner_id ? await supabase.from('profiles').select('first_name, last_name, email, phone').eq('id', prop.owner_id).maybeSingle() : { data: null };

        const ownerName = owner ? `${owner.first_name} ${owner.last_name}`.trim() : null;

        return {
          ...prop,
          cities: city || null,
          universities: uni || null,
          property_images: images || [],
          listings: listings || [],
          owner_profiles: owner || null,
          broker_profiles: broker || (ownerName ? { company_name: ownerName, verified_badge: false, rating: 5, slug: '' } : null)
        };
      }));

      return res.status(200).json(enriched);
    }

    if (req.method === 'POST') {
      const auth = await requireAuth(req, res, ['broker', 'owner', 'tenant', 'admin', 'super_admin']);
      if (!auth) return;

      const body = req.body;
      const {
        title, description, city_id, district, address, latitude, longitude,
        floor, area, bedrooms, bathrooms, furnished, gender_allowed,
        university_id, broker_id, owner_id, status, amenities, images,
        rooms, listings, for_students, beds_count, tenant_type,
      } = body;

      // Use the authenticated user's ID as owner if no owner_id was sent
      const finalOwnerId = owner_id || auth.user.id;

      if (!title) return res.status(400).json({ error: 'title is required' });

      const { data: prop, error } = await supabase
        .from('properties')
        .insert({
          title,
          description: description || '',
          city_id: city_id || null,
          district: district || '',
          address: address || '',
          latitude: latitude || null,
          longitude: longitude || null,
          floor: floor || 0,
          area: area || 0,
          bedrooms: bedrooms || 1,
          bathrooms: bathrooms || 1,
          beds_count: beds_count || bedrooms || 1,
          tenant_type: tenant_type || (for_students ? 'students' : 'all'),
          furnished: !!furnished,
          for_students: !!for_students,
          gender_allowed: gender_allowed || 'any',
          university_id: university_id || null,
          broker_id: broker_id || null,
          owner_id: finalOwnerId,
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
            image_url: typeof url === 'string' ? url : url.image_url,
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
      const auth = await requireAuth(req, res, ['broker', 'owner', 'admin', 'super_admin']);
      if (!auth) return;
      const { role } = auth;

      const { id, amenities, images, admin_action, rejection_reason, price, deposit, is_featured, listings, rooms, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const allowed = [
        'title', 'description', 'city_id', 'district', 'address', 'latitude', 'longitude',
        'floor', 'area', 'bedrooms', 'bathrooms', 'furnished', 'gender_allowed',
        'university_id', 'status', 'rejection_reason', 'for_students', 'beds_count', 'tenant_type'
      ];
      const payload = {};
      for (const k of allowed) if (rest[k] !== undefined) payload[k] = rest[k];

      if (!admin_action) {
        // Respect explicit status changes like 'inactive' (pause), 'archived' (archive), or 'pending' (re-submit)
        if (rest.status && ['inactive', 'archived', 'pending'].includes(rest.status)) {
          payload.status = rest.status;
        } else {
          payload.status = 'pending';
        }
        payload.rejection_reason = null;
        // Ensure broker/owner can only edit their own property
        const { data: existingProp } = await supabase.from('properties').select('owner_id, broker_id').eq('id', id).maybeSingle();
        if (existingProp) {
          // owner_id in properties table is the auth user UUID
          const isOwner = existingProp.owner_id === auth.user.id;
          // broker check: broker_profiles.id (int) stored in properties.broker_id
          let isBroker = false;
          if (role === 'broker') {
            const { data: bp } = await supabase.from('broker_profiles').select('id').eq('user_id', auth.user.id).maybeSingle();
            isBroker = bp != null && bp.id === existingProp.broker_id;
          }
          if (!isOwner && !isBroker && role !== 'admin' && role !== 'super_admin') {
            return res.status(403).json({ error: 'ليس لديك صلاحية تعديل هذا العقار' });
          }
        }
      } else {
        // Admin action requires admin/super_admin role
        if (role !== 'admin' && role !== 'super_admin') return res.status(403).json({ error: 'Forbidden' });
        if (rejection_reason !== undefined) payload.rejection_reason = rejection_reason;

        // Admin or super_admin can set featured
        if (is_featured !== undefined) {
          if (role !== 'admin' && role !== 'super_admin') return res.status(403).json({ error: 'Only admin can feature properties' });
          payload.is_featured = is_featured;
        }
      }

      const { data, error } = await supabase.from('properties').update(payload).eq('id', id).select().single();
      if (error) throw error;

      // Real-time Notification for property status change by Admin
      if (admin_action && data.broker_id) {
        const { data: broker } = await supabase.from('broker_profiles').select('user_id').eq('id', data.broker_id).maybeSingle();
        if (broker?.user_id) {
          if (payload.status === 'active') {
            await supabase.from('notifications').insert({
              user_id: broker.user_id,
              title: 'Property Approved',
              body: `Your property "${data.title}" has been approved and is now live.`,
              type: 'property_approved',
              is_read: false
            });
          } else if (payload.status === 'rejected') {
            await supabase.from('notifications').insert({
              user_id: broker.user_id,
              title: 'Property Rejected',
              body: `Your property "${data.title}" was rejected. Reason: ${payload.rejection_reason || 'See details'}`,
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

      if (rooms) {
        await supabase.from('rooms').delete().eq('property_id', id);
        if (rooms.length) {
          for (const room of rooms) {
            const { data: r, error: rErr } = await supabase
              .from('rooms')
              .insert({
                property_id: id,
                name: room.name,
                beds_count: room.beds_count || 1,
                gender: room.gender || rest.gender_allowed || 'any',
                available: true,
              })
              .select()
              .single();
            if (rErr) throw rErr;
            if (r && room.beds?.length) {
              const { error: bErr } = await supabase.from('beds').insert(
                room.beds.map((b) => ({
                  room_id: r.id,
                  bed_number: b.bed_number,
                  price: b.price || Number(price || rest.price || 0),
                  status: 'available',
                }))
              );
              if (bErr) throw bErr;
            }
          }
        }
      }

      // Update listing price and deposit if provided
      if (price !== undefined) {
        const { data: existingListings } = await supabase
          .from('listings')
          .select('id')
          .eq('property_id', id)
          .eq('status', 'active')
          .order('id', { ascending: true })
          .limit(1);
        if (existingListings && existingListings.length > 0) {
          const updateObj = { price: Number(price) };
          if (deposit !== undefined) updateObj.deposit = Number(deposit);
          await supabase
            .from('listings')
            .update(updateObj)
            .eq('id', existingListings[0].id);
        } else {
          // No active listing exists — create one if price provided
          await supabase.from('listings').insert({
            property_id: id,
            listing_type: 'entire_apartment',
            price: Number(price),
            deposit: deposit !== undefined ? Number(deposit) : 0,
            minimum_months: 1,
            available_from: new Date().toISOString().slice(0, 10),
            status: 'active',
          });
        }
      }

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const auth = await requireAuth(req, res, ['broker', 'owner', 'admin', 'super_admin']);
      if (!auth) return;

      const { id } = req.body;
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('properties error:', err);
    res.status(500).json({ error: err.message });
  }
}
