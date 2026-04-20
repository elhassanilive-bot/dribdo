import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function toPositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

export async function createSupportTicket(input) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", ticket: null };

  const payload = {
    request_type: String(input?.requestType || "other").trim(),
    source: String(input?.source || "web").trim(),
    status: "open",
    is_read: false,
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
    .select("id,request_type,status,is_read,requester_email,subject,created_at")
    .single();

  if (error) return { ok: false, error: error.message || "insert_failed", ticket: null };
  return { ok: true, error: null, ticket: data };
}

export async function listSupportTickets({ page = 1, pageSize = 7, type = "", status = "", readState = "" } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", tickets: [], total: 0, totalPages: 1, page: 1, pageSize: 7 };

  const safePage = toPositiveInt(page, 1);
  const safePageSize = Math.min(50, toPositiveInt(pageSize, 7));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = admin
    .from("support_tickets")
    .select(
      "id,request_type,source,status,is_read,read_at,requester_name,requester_email,subject,message,payload,attachment_name,created_at,updated_at,last_reply_at,last_replied_by,closed_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (type) query = query.eq("request_type", type);
  if (status) query = query.eq("status", status);
  if (readState === "read") query = query.eq("is_read", true);
  if (readState === "unread") query = query.eq("is_read", false);

  const { data, error, count } = await query;
  if (error) {
    return { ok: false, error: error.message || "query_failed", tickets: [], total: 0, totalPages: 1, page: safePage, pageSize: safePageSize };
  }

  const total = Number(count || 0);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  return {
    ok: true,
    error: null,
    tickets: data || [],
    total,
    totalPages,
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function listRepliesForTickets(ticketIds) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", repliesByTicket: {} };

  const ids = Array.isArray(ticketIds) ? ticketIds.map((id) => String(id || "").trim()).filter(Boolean) : [];
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
      is_read: true,
      read_at: new Date().toISOString(),
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

export async function markTicketAsRead(ticketId) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured" };

  const id = String(ticketId || "").trim();
  if (!id) return { ok: false, error: "invalid_input" };

  const { error } = await admin
    .from("support_tickets")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("is_read", false);

  if (error) return { ok: false, error: error.message || "update_failed" };
  return { ok: true, error: null };
}

export async function markAllTicketsAsRead({ type = "", status = "", readState = "" } = {}) {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured" };

  let query = admin.from("support_tickets").update({ is_read: true, read_at: new Date().toISOString() }).eq("is_read", false);
  if (type) query = query.eq("request_type", type);
  if (status) query = query.eq("status", status);
  if (readState === "unread") query = query.eq("is_read", false);
  if (readState === "read") return { ok: true, error: null };

  const { error } = await query;
  if (error) return { ok: false, error: error.message || "update_failed" };
  return { ok: true, error: null };
}

export async function getSupportInboxStats() {
  const admin = await getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured", stats: null };

  const [
    { count: openCount, error: openError },
    { count: unreadCount, error: unreadError },
    { data: latestData, error: latestError },
    { data: latestUnreadData, error: latestUnreadError },
  ] = await Promise.all([
    admin.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("support_tickets").select("id", { count: "exact", head: true }).eq("is_read", false),
    admin.from("support_tickets").select("id,created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("support_tickets").select("id,created_at").eq("is_read", false).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (openError) return { ok: false, error: openError.message || "stats_query_failed", stats: null };
  if (unreadError) return { ok: false, error: unreadError.message || "stats_query_failed", stats: null };
  if (latestError) return { ok: false, error: latestError.message || "stats_query_failed", stats: null };
  if (latestUnreadError) return { ok: false, error: latestUnreadError.message || "stats_query_failed", stats: null };

  return {
    ok: true,
    error: null,
    stats: {
      openCount: Number(openCount || 0),
      unreadCount: Number(unreadCount || 0),
      latestTicketId: latestData?.id || null,
      latestCreatedAt: latestData?.created_at || null,
      latestUnreadTicketId: latestUnreadData?.id || null,
      latestUnreadCreatedAt: latestUnreadData?.created_at || null,
      generatedAt: new Date().toISOString(),
    },
  };
}
