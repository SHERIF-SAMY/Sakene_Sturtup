import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // GET — Admin fetches all messages
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST — Anyone sends a message
    if (req.method === 'POST') {
      const { name, email, phone, message } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: 'الاسم والرسالة مطلوبان' });
      }
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({ name, email: email || null, phone: phone || null, message, is_read: false })
        .select()
        .single();
      if (error) throw error;

      // Notify all admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'super_admin']);

      if (admins && admins.length) {
        await supabase.from('notifications').insert(
          admins.map((a) => ({
            user_id: a.id,
            title: '📩 رسالة تواصل جديدة',
            body: `من: ${name} — "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
            type: 'contact_message',
            is_read: false,
          }))
        );
      }

      return res.status(201).json(data);
    }

    // PUT — Admin marks message as read
    if (req.method === 'PUT') {
      const { id, is_read } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ is_read: is_read !== undefined ? is_read : true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // DELETE — Admin deletes a message
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
