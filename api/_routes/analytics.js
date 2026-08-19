import supabase from '../_db-client.js';
import { requireAuth } from '../_auth-helper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { scope, broker_id, user_id } = req.query;

    if (scope === 'admin') {
      const auth = await requireAuth(req, res, ['admin', 'super_admin']);
      if (!auth) return;

      // Handle resetting stats if requested by super_admin (POST request)
      if (req.method === 'POST' && req.query.action === 'reset_earnings') {
        if (auth.role !== 'super_admin') return res.status(403).json({ error: 'Super Admin only' });
        const targetAdminId = req.query.admin_id;

        // Get list of admins to reset
        let adminIds = [];
        if (targetAdminId) {
          adminIds = [targetAdminId];
        } else {
          const { data: allAdmins } = await supabase.from('profiles').select('id').in('role', ['admin', 'super_admin']);
          adminIds = (allAdmins || []).map(a => a.id);
        }

        // Insert a reset marker for each admin
        const now = new Date().toISOString();
        const resetMarkers = adminIds.map(aid => ({
          admin_id: aid,
          visit_id: null,
          amount: 0,
          operation: 'reset',
          created_at: now,
        }));
        if (resetMarkers.length) {
          await supabase.from('admin_earnings').insert(resetMarkers);
        }

        return res.status(200).json({ success: true, message: 'Earnings reset' });
      }

      const [users, properties, visits, universities, cities, reviews, adminProfiles, earningsData, completedVisitsData] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('visits').select('id', { count: 'exact', head: true }),
        supabase.from('universities').select('id', { count: 'exact', head: true }),
        supabase.from('cities').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, first_name, last_name, email, role').in('role', ['admin', 'super_admin']),
        supabase.from('admin_earnings').select('*').order('created_at', { ascending: true }),
        supabase.from('visits').select('id, status, created_at, visit_date, processed_by_admin_id').eq('status', 'completed'),
      ]);

      const { data: recentVisits } = await supabase
        .from('visits')
        .select('status, visit_date, created_at, processed_by_admin_id')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: roleCounts } = await supabase.from('profiles').select('role');
      const roles = { student: 0, broker: 0, admin: 0, owner: 0 };
      (roleCounts || []).forEach((r) => {
        if (roles[r.role] !== undefined) roles[r.role]++;
      });

      const allEarnings = earningsData.data || [];
      const completedVisits = completedVisitsData.data || [];

      // Calculate per-admin stats using reset marker timestamps
      const adminStats = (adminProfiles.data || []).map(adm => {
        // Find the latest reset marker for this admin
        const adminResets = allEarnings.filter(e => e.admin_id === adm.id && e.operation === 'reset');
        const lastResetAt = adminResets.length > 0
          ? adminResets[adminResets.length - 1].created_at
          : null;

        // Count completed visits AFTER the last reset (or all if no reset)
        const admCompletedVisits = completedVisits.filter(v => {
          if (v.processed_by_admin_id !== adm.id) return false;
          if (!lastResetAt) return true;
          return v.created_at > lastResetAt;
        });

        const completedCount = admCompletedVisits.length;
        const totalEarnings = completedCount * 400;

        return {
          id: adm.id,
          name: `${adm.first_name || ''} ${adm.last_name || ''}`.trim() || adm.email,
          role: adm.role,
          totalEarnings,
          completedCount,
        };
      });

      // Total revenue = sum of all admin counts after their respective resets
      const totalCompletedVisits = adminStats.reduce((sum, adm) => sum + adm.completedCount, 0)
        // Fallback: if no processed_by_admin_id is set, count all completed visits after global reset
        || (() => {
          const globalResets = allEarnings.filter(e => e.operation === 'reset');
          const lastGlobalReset = globalResets.length > 0 ? globalResets[globalResets.length - 1].created_at : null;
          return completedVisits.filter(v => !lastGlobalReset || v.created_at > lastGlobalReset).length;
        })();

      const totalRevenue = totalCompletedVisits * 400;

      // Only pass non-reset earnings records to frontend
      const earnings = allEarnings.filter(e => e.operation !== 'reset');

      return res.status(200).json({
        users: users.count || 0,
        properties: properties.count || 0,
        visits: visits.count || 0,
        universities: universities.count || 0,
        cities: cities.count || 0,
        reviews: reviews.count || 0,
        roles,
        recentVisits: recentVisits || [],
        completedVisits,
        earnings,
        totalCompletedVisits,
        totalRevenue,
        adminStats: adminStats || [],
      });
    }

    if (scope === 'broker' && broker_id) {
      const auth = await requireAuth(req, res, ['broker', 'owner', 'admin', 'super_admin']);
      if (!auth) return;
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
      const auth = await requireAuth(req, res, ['student', 'tenant', 'admin', 'super_admin']);
      if (!auth) return;
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
