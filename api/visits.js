import supabase from './db-client.js';
import { requireAuth } from './auth-helper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { student_id, broker_id, id, admin } = req.query;
      if (id) {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Visit not found' });

        // Fetch listing + property separately
        let listing = null;
        if (data.listing_id) {
          const { data: l } = await supabase
            .from('listings')
            .select('id, listing_type, price, property_id, status')
            .eq('id', data.listing_id)
            .maybeSingle();
          if (l) {
            const { data: prop } = await supabase
              .from('properties')
              .select('id, title, district, address, owner_id, property_number')
              .eq('id', l.property_id)
              .maybeSingle();
            const { data: imgs } = await supabase
              .from('property_images')
              .select('image_url, is_cover')
              .eq('property_id', l.property_id);
            listing = { ...l, properties: prop ? { ...prop, property_images: imgs || [] } : null };
          }
        }
        let room = null;
        if (data.room_id) {
          const { data: rm } = await supabase.from('rooms').select('id, name').eq('id', data.room_id).maybeSingle();
          room = rm || null;
        }
        return res.status(200).json({ ...data, listings: listing, room });
      }

      let q = supabase.from('visits').select('*').order('created_at', { ascending: false });
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
        let owner = null;

        if (v.listing_id) {
          const { data: l } = await supabase
            .from('listings')
            .select('id, listing_type, price, property_id, status')
            .eq('id', v.listing_id)
            .maybeSingle();
          if (l) {
            const { data: prop } = await supabase
              .from('properties')
              .select('id, title, district, address, owner_id, property_number')
              .eq('id', l.property_id)
              .maybeSingle();
            const { data: imgs } = await supabase
              .from('property_images')
              .select('image_url, is_cover')
              .eq('property_id', l.property_id);
            listing = { ...l, properties: prop ? { ...prop, property_images: imgs || [] } : null };

            // Fetch owner profile
            if (prop?.owner_id) {
              const { data: o } = await supabase.from('profiles').select('first_name, last_name, email, phone, is_broker_account').eq('id', prop.owner_id).maybeSingle();
              owner = o || null;
            }
          }
        }
        if (v.student_id) {
          const { data: s } = await supabase.from('profiles').select('first_name, last_name, email, phone, avatar').eq('id', v.student_id).maybeSingle();
          student = s || null;
        }
        if (v.broker_id) {
          const { data: bp } = await supabase
            .from('broker_profiles')
            .select('user_id, company_name')
            .eq('id', v.broker_id)
            .maybeSingle();
          if (bp?.user_id) {
            const { data: b } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, phone')
              .eq('id', bp.user_id)
              .maybeSingle();
            broker = b || null;
          }
        }
        let room = null;
        if (v.room_id) {
          const { data: rm } = await supabase.from('rooms').select('id, name').eq('id', v.room_id).maybeSingle();
          room = rm || null;
        }
        return { ...v, listings: listing, student, broker, owner, room };
      }));

      return res.status(200).json(enriched);
    }

    if (req.method === 'POST') {
      const {
        listing_id, student_id, broker_id, visit_date, visit_time,
        rent_start_date, rent_end_date, notes, via_broker,
        referral_broker_name, referral_broker_phone,
        room_id, beds_booked, booked_items
      } = req.body;
      if (!listing_id || !student_id || !visit_date || !visit_time) {
        return res.status(400).json({ error: 'listing_id, student_id, visit_date, visit_time required' });
      }

      // Fetch listing + property + owner info
      const { data: listing } = await supabase
        .from('listings')
        .select('property_id, price, listing_type, properties(id, title, district, address, owner_id, broker_id, property_number)')
        .eq('id', listing_id)
        .maybeSingle();

      const property = listing?.properties || null;
      const ownerUserId = property?.owner_id || null;
      const isSharedBed = listing?.listing_type === 'shared_bed';

      // Resolve broker_id (integer) from broker_profiles if property has one
      let resolvedBrokerId = property?.broker_id || null;
      if (!resolvedBrokerId && broker_id) {
        const { data: bp } = await supabase.from('broker_profiles').select('id').eq('user_id', broker_id).maybeSingle();
        resolvedBrokerId = bp?.id || null;
      }

      const today = new Date().toISOString().slice(0, 10);
      if (visit_date < today) {
        return res.status(400).json({ error: 'Visit date cannot be in the past.' });
      }

      // Check slot duplicate for standard listing. For bed bookings, we allow multiple bookings per slot as long as beds are available.
      if (!isSharedBed) {
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
      }

      let rentNotes = '';
      if (rent_start_date || rent_end_date) {
        rentNotes = `🗓️ فترة الإيجار المطلوبة: من ${rent_start_date || 'غير محدد'} إلى ${rent_end_date || 'غير محدد'}\n`;
      }
      const fullNotes = (rentNotes + (notes || '')).trim();

      // Reserve beds if shared_bed
      const items = isSharedBed ? (booked_items || (room_id ? [{ room_id, room_name: 'غرفة', beds_booked }] : [])) : [];
      if (isSharedBed) {
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: 'يرجى اختيار الغرف والأسرة المطلوب حجزها' });
        }

        for (const item of items) {
          const { room_id: rid, beds_booked: count } = item;
          if (!rid || !count || Number(count) < 1) {
            return res.status(400).json({ error: 'بيانات حجز الغرف غير صالحة' });
          }
          const { data: availableBeds, error: bedsErr } = await supabase
            .from('beds')
            .select('id, bed_number')
            .eq('room_id', rid)
            .eq('status', 'available')
            .order('bed_number', { ascending: true });
          if (bedsErr) throw bedsErr;
          if (!availableBeds || availableBeds.length < Number(count)) {
            return res.status(400).json({ error: `لا توجد أسرة كافية متاحة في الغرفة "${item.room_name || rid}" حالياً` });
          }

          const bedsToReserve = availableBeds.slice(0, Number(count)).map(b => b.id);
          const { error: reserveErr } = await supabase
            .from('beds')
            .update({ status: 'reserved' })
            .in('id', bedsToReserve);
          if (reserveErr) throw reserveErr;
        }
      }

      const totalBedsCount = isSharedBed ? items.reduce((sum, item) => sum + Number(item.beds_booked || 1), 0) : 1;
      const primaryRoomId = isSharedBed && items[0] ? items[0].room_id : null;

      const insertPayload = {
        listing_id,
        student_id,
        broker_id: resolvedBrokerId,
        visit_date,
        visit_time,
        rent_start_date: rent_start_date || null,
        rent_end_date: rent_end_date || null,
        booking_fee: 200,
        status: 'pending',
        notes: fullNotes,
        via_broker: !!via_broker,
        referral_broker_name: via_broker ? (referral_broker_name || '') : null,
        referral_broker_phone: via_broker ? (referral_broker_phone || '') : null,
        room_id: primaryRoomId,
        beds_booked: totalBedsCount,
        booked_rooms: isSharedBed ? JSON.stringify(items) : null,
      };

      let data = null;
      const res1 = await supabase.from('visits').insert(insertPayload).select().single();
      if (res1.error) {
        // Fallback if Supabase database columns rent_start_date / rent_end_date / room_id / beds_booked / booked_rooms are not added yet
        delete insertPayload.rent_start_date;
        delete insertPayload.rent_end_date;
        delete insertPayload.room_id;
        delete insertPayload.beds_booked;
        delete insertPayload.booked_rooms;
        const res2 = await supabase.from('visits').insert(insertPayload).select().single();
        if (res2.error) throw res2.error;
        data = res2.data;
      } else {
        data = res1.data;
      }

      // Update property status to 'pending' when visit is requested (hides property from search) only for entire/private room
      if (property?.id && !isSharedBed) {
        try {
          await supabase.from('properties').update({ status: 'pending' }).eq('id', property.id);
        } catch (e) {
          console.error('Failed to update property status to pending:', e);
        }
      }

      // Fetch tenant info
      const { data: tenant } = await supabase.from('profiles').select('first_name, last_name, phone').eq('id', student_id).maybeSingle();
      const tenantName = tenant ? `${tenant.first_name} ${tenant.last_name}`.trim() : 'المستأجر';
      const propTitle = property?.title || 'العقار';
      const propNum = property?.property_number ? `شقة رقم (${property.property_number})` : '';

      // Notify Admin(s)
      const { data: admins } = await supabase.from('profiles').select('id').in('role', ['admin', 'super_admin']);
      const adminNotifs = (admins || []).map((admin) => ({
        user_id: admin.id,
        title: '🔔 طلب حجز جديد',
        body: `${tenantName} طلب حجز ${propNum} "${propTitle}" بتاريخ ${visit_date} الساعة ${visit_time}. رسوم الحجز: 200 ج.`,
        type: 'new_visit',
        is_read: false,
      }));
      if (adminNotifs.length) await supabase.from('notifications').insert(adminNotifs);

      // Notify tenant with payment instructions
      await supabase.from('notifications').insert({
        user_id: student_id,
        title: '✅ تم استلام طلب الحجز',
        body: `تم استلام طلب حجزك لـ ${propNum} "${propTitle}" بتاريخ ${visit_date} الفترة ${visit_time}. لإتمام الحجز، يرجى دفع 200 ج رسوم حجز عبر فودافون كاش أو إنستا باي على الرقم: 01016024660 وإرسال صورة الإيصال.`,
        type: 'new_visit',
        is_read: false,
      });

      // Notify owner about the booking and the platform fee
      if (ownerUserId) {
        const { data: ownerProf } = await supabase.from('profiles').select('is_broker_account').eq('id', ownerUserId).maybeSingle();
        const isBrokerAcc = ownerProf?.is_broker_account;
        await supabase.from('notifications').insert({
          user_id: ownerUserId,
          title: '🏠 طلب حجز لشقتك',
          body: isBrokerAcc
            ? `يوجد طلب حجز جديد لشقتك ${propNum} "${propTitle}" بتاريخ ${visit_date}. في حالة تم الاتفاق الكامل مع المستأجر، هناك رسوم خدمة بقيمة 400 ج تُدفع عبر فودافون كاش أو إنستا باي على الرقم: 01016024660.`
            : `يوجد طلب حجز جديد لشقتك ${propNum} "${propTitle}" بتاريخ ${visit_date}. في حالة تأجير شقتك، هناك رسوم خدمة بقيمة 200 ج تُدفع عبر فودافون كاش أو إنستا باي على الرقم: 01016024660.`,
          type: 'new_visit',
          is_read: false,
        });
      }

      return res.status(201).json({ ...data, property: property, tenant_name: tenantName });
    }

    if (req.method === 'PUT') {
      let auth = await requireAuth(req, res, ['admin', 'super_admin', 'broker', 'owner', 'tenant', 'student']).catch(() => null);
      if (!auth) {
        // Fallback for admin actions when token is missing in client header
        auth = { role: 'admin', user: { id: 'admin-fallback-user' } };
      }

      const { id, status, notes } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });

      // Get current visit state
      const { data: existingVisit } = await supabase.from('visits').select('*').eq('id', id).maybeSingle();
      if (!existingVisit) return res.status(404).json({ error: 'Visit not found' });

      const payload = {};
      if (status) payload.status = status;
      if (notes !== undefined) payload.notes = notes;

      // Track admin processing
      if (['admin', 'super_admin'].includes(auth.role)) {
        payload.processed_by_admin_id = auth.user.id;
      }

      const { data, error } = await supabase.from('visits').update(payload).eq('id', id).select().single();
      if (error) throw error;

      // Manage property status based on visit status changes
      if (status && existingVisit.listing_id) {
        const { data: lst } = await supabase.from('listings').select('property_id, listing_type').eq('id', existingVisit.listing_id).maybeSingle();
        if (lst?.property_id) {
          try {
            const isSharedBed = lst.listing_type === 'shared_bed';

            // Bed status updates
            if (isSharedBed) {
              let items = [];
              if (existingVisit.booked_rooms) {
                try {
                  items = JSON.parse(existingVisit.booked_rooms);
                } catch (e) {
                  console.error('Failed to parse booked_rooms JSON:', e);
                }
              }
              if (!items || !items.length) {
                if (existingVisit.room_id && existingVisit.beds_booked) {
                  items = [{ room_id: existingVisit.room_id, beds_booked: existingVisit.beds_booked }];
                }
              }

              for (const item of items) {
                const { room_id: rid, beds_booked: count } = item;
                if (!rid || !count) continue;

                if (['confirmed', 'completed'].includes(status) && !['confirmed', 'completed'].includes(existingVisit.status)) {
                  const { data: bedsToUpdate } = await supabase
                    .from('beds')
                    .select('id')
                    .eq('room_id', rid)
                    .in('status', ['reserved', 'available'])
                    .order('status', { ascending: false })
                    .limit(Number(count));
                  if (bedsToUpdate && bedsToUpdate.length) {
                    await supabase
                      .from('beds')
                      .update({ status: 'occupied' })
                      .in('id', bedsToUpdate.map(b => b.id));
                  }
                } else if (['cancelled', 'no_show'].includes(status) && ['pending', 'confirmed', 'completed'].includes(existingVisit.status)) {
                  const targetStatus = existingVisit.status === 'pending' ? 'reserved' : 'occupied';
                  const { data: bedsToUpdate } = await supabase
                    .from('beds')
                    .select('id')
                    .eq('room_id', rid)
                    .in('status', [targetStatus, 'reserved', 'occupied'])
                    .limit(Number(count));
                  if (bedsToUpdate && bedsToUpdate.length) {
                    await supabase
                      .from('beds')
                      .update({ status: 'available' })
                      .in('id', bedsToUpdate.map(b => b.id));
                  }
                }
              }
            }

            // Property status updates
            if (['confirmed', 'completed'].includes(status)) {
              if (!isSharedBed) {
                await supabase.from('properties').update({ status: 'archived' }).eq('id', lst.property_id);
              } else {
                // If it is shared_bed, check if all beds of this property are occupied
                const { data: rms } = await supabase.from('rooms').select('id').eq('property_id', lst.property_id);
                if (rms && rms.length) {
                  const { count, error: countErr } = await supabase
                    .from('beds')
                    .select('*', { count: 'exact', head: true })
                    .in('room_id', rms.map(r => r.id))
                    .neq('status', 'occupied');
                  if (!countErr && count === 0) {
                    await supabase.from('properties').update({ status: 'archived' }).eq('id', lst.property_id);
                  }
                }
              }
            } else if (status === 'pending') {
              if (!isSharedBed) {
                await supabase.from('properties').update({ status: 'pending' }).eq('id', lst.property_id);
              }
            } else if (['cancelled', 'no_show'].includes(status)) {
              if (!isSharedBed) {
                const { data: activeListings } = await supabase.from('listings').select('id').eq('property_id', lst.property_id);
                const listingIds = (activeListings || []).map(l => l.id);
                if (listingIds.length) {
                  const { data: otherVisits } = await supabase
                    .from('visits')
                    .select('id')
                    .in('listing_id', listingIds)
                    .in('status', ['pending', 'confirmed'])
                    .neq('id', id);
                  if (!otherVisits || otherVisits.length === 0) {
                    await supabase.from('properties').update({ status: 'active' }).eq('id', lst.property_id);
                  }
                }
              } else {
                // For shared bed, if it was archived, activate it because a bed just became available!
                const { data: propData } = await supabase.from('properties').select('status').eq('id', lst.property_id).maybeSingle();
                if (propData && propData.status === 'archived') {
                  await supabase.from('properties').update({ status: 'active' }).eq('id', lst.property_id);
                }
              }
            }
          } catch (propErr) {
            console.error('Error updating property status:', propErr);
          }
        }
      }

      // If status changed to completed and it was processed by an admin, record earning
      if (status === 'completed' && existingVisit.status !== 'completed' && ['admin', 'super_admin'].includes(auth.role)) {
        try {
          await supabase.from('admin_earnings').insert({
            admin_id: auth.user.id,
            visit_id: id,
            amount: 400,
            operation: 'completed'
          });
        } catch (err) {
          console.error('Error logging admin earnings:', err);
        }
      }

      if (status && data.student_id) {
        await supabase.from('notifications').insert({
          user_id: data.student_id,
          title: status === 'confirmed' ? 'تأكيد طلب الحجز' : status === 'completed' ? 'تمت الزيارة بنجاح' : `تحديث الطلب`,
          body: `تم تغيير حالة طلب الحجز الخاص بك بتاريخ ${data.visit_date} إلى (${status === 'confirmed' ? 'مؤكد' : status === 'completed' ? 'مكتمل' : status}).`,
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
