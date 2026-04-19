import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createSupportTicket(input) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", ticket: null };

  const payload = {
    request_type: String(input?.requestType || "other").trim(),
    source: String(input?.source || "web").trim(),
    status: "open",
    requester_name: String(input?.requesterName || "").trim() || null,
    requester_email: String(input?.requesterEmail || "").trim(),
    subject: String(input?.subject || "").trim() || null,
    message: String(input?.message || "").trim() || null,
    payload: input?.payload && typeof input.payload === "object" ? input.payload : {},
    attachment_name: String(input?.attachmentName || "").trim() || null,
  };

  const { data, error } = await admin
    .from("support_tickets")
    .insert(payload)
    .select("id,request_type,status,requester_email,subject,created_at")
    .single();

  if (error) return { ok: false, error: error.message || "insert_failed", ticket: null };
  return { ok: true, error: null, ticket: data };
}

export async function listSupportTickets({ limit = 200, type = "", status = "" } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", tickets: [] };

  let query = admin
    .from("support_tickets")
    .select("id,request_type,source,status,requester_name,requester_email,subject,message,payload,attachment_name,created_at,updated_at,last_reply_at,last_replied_by,closed_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(500, Math.max(1, Number(limit || 200))));

  if (type) query = query.eq("request_type", type);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message || "query_failed", tickets: [] };

  return { ok: true, error: null, tickets: data || [] };
}

export async function listTicketReplies(ticketId) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", replies: [] };

  const id = String(ticketId || "").trim();
  if (!id) return { ok: true, error: null, replies: [] };

  const { data, error } = await admin
    .from("support_ticket_replies")
    .select("id,ticket_id,author_name,author_email,message,sent_to_email,email_delivery_status,email_error,created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if (error) return { ok: false, error: error.message || "query_failed", replies: [] };
  return { ok: true, error: null, replies: data || [] };
}

export async function listRepliesForTickets(ticketIds) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", repliesByTicket: {} };

  const ids = Array.isArray(ticketIds)
    ? ticketIds.map((id) => String(id || "").trim()).filter(Boolean)
    : [];

  if (!ids.length) return { ok: true, error: null, repliesByTicket: {} };

  const { data, error } = await admin
    .from("support_ticket_replies")
    .select("id,ticket_id,author_name,author_email,message,sent_to_email,email_delivery_status,email_error,created_at")
    .in("ticket_id", ids)
    .order("created_at", { ascending: true });

  if (error) return { ok: false, error: error.message || "query_failed", repliesByTicket: {} };

  const repliesByTicket = {};
  for (const reply of data || []) {
    const id = String(reply?.ticket_id || "").trim();
    if (!id) continue;
    if (!repliesByTicket[id]) repliesByTicket[id] = [];
    repliesByTicket[id].push(reply);
  }

  return { ok: true, error: null, repliesByTicket };
}

export async function addTicketReply({ ticketId, authorName, authorEmail, message, sentToEmail, emailDeliveryStatus, emailError }) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", reply: null };

  const id = String(ticketId || "").trim();
  if (!id) return { ok: false, error: "ticket_id_required", reply: null };

  const insertPayload = {
    ticket_id: id,
    author_name: String(authorName || "Support Team").trim() || "Support Team",
    author_email: String(authorEmail || "").trim() || null,
    message: String(message || "").trim(),
    sent_to_email: String(sentToEmail || "").trim() || null,
    email_delivery_status: String(emailDeliveryStatus || "pending").trim() || "pending",
    email_error: String(emailError || "").trim() || null,
  };

  const { data, error } = await admin
    .from("support_ticket_replies")
    .insert(insertPayload)
    .select("id,ticket_id,created_at")
    .single();

  if (error) return { ok: false, error: error.message || "insert_failed", reply: null };

  await admin
    .from("support_tickets")
    .update({
      status: "answered",
      last_reply_at: new Date().toISOString(),
      last_replied_by: insertPayload.author_name,
    })
    .eq("id", id);

  return { ok: true, error: null, reply: data };
}

export async function updateTicketStatus({ ticketId, status }) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured" };

  const id = String(ticketId || "").trim();
  const nextStatus = String(status || "").trim();
  if (!id || !nextStatus) return { ok: false, error: "invalid_input" };

  const updatePayload = {
    status: nextStatus,
    closed_at: nextStatus === "closed" ? new Date().toISOString() : null,
  };

  const { error } = await admin.from("support_tickets").update(updatePayload).eq("id", id);
  if (error) return { ok: false, error: error.message || "update_failed" };

  return { ok: true, error: null };
}

export async function getSupportInboxStats() {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", stats: null };

  const [{ count: openCount, error: openError }, { data: latestData, error: latestError }] = await Promise.all([
    admin.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("support_tickets").select("id,created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (openError) return { ok: false, error: openError.message || "stats_query_failed", stats: null };
  if (latestError) return { ok: false, error: latestError.message || "stats_query_failed", stats: null };

  return {
    ok: true,
    error: null,
    stats: {
      openCount: Number(openCount || 0),
      latestTicketId: latestData?.id || null,
      latestCreatedAt: latestData?.created_at || null,
      generatedAt: new Date().toISOString(),
    },
  };
}
