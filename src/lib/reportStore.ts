export interface StatusAuditEntry {
  id: string;
  reportId: string;
  actorId: string;
  actorRole?: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}

export interface ReportReplyEntry {
  id: string;
  reportId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  message: string;
  createdAt: string;
}

const globalReportStore = globalThis as unknown as {
  __reportAudits?: Map<string, StatusAuditEntry[]>;
  __reportReplies?: Map<string, ReportReplyEntry[]>;
};

if (!globalReportStore.__reportAudits) {
  globalReportStore.__reportAudits = new Map<string, StatusAuditEntry[]>();
}
if (!globalReportStore.__reportReplies) {
  globalReportStore.__reportReplies = new Map<string, ReportReplyEntry[]>();
}

export function logStatusTransition({
  reportId,
  actorId,
  actorRole,
  oldStatus,
  newStatus
}: {
  reportId: string;
  actorId: string;
  actorRole?: string;
  oldStatus: string;
  newStatus: string;
}): StatusAuditEntry {
  const store = globalReportStore.__reportAudits!;
  const audits = store.get(reportId) || [];

  const entry: StatusAuditEntry = {
    id: 'audit_' + Math.random().toString(36).substring(2, 11),
    reportId,
    actorId,
    actorRole,
    oldStatus,
    newStatus,
    timestamp: new Date().toISOString()
  };

  audits.push(entry);
  store.set(reportId, audits);
  return entry;
}

export function getStatusTransitions(reportId: string): StatusAuditEntry[] {
  const store = globalReportStore.__reportAudits!;
  return store.get(reportId) || [];
}

export function addReportReply({
  reportId,
  authorId,
  authorName,
  authorRole,
  message
}: {
  reportId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  message: string;
}): ReportReplyEntry {
  const store = globalReportStore.__reportReplies!;
  const replies = store.get(reportId) || [];

  const reply: ReportReplyEntry = {
    id: 'reply_' + Math.random().toString(36).substring(2, 11),
    reportId,
    authorId,
    authorName,
    authorRole,
    message,
    createdAt: new Date().toISOString()
  };

  replies.push(reply);
  store.set(reportId, replies);
  return reply;
}

export function getReportReplies(reportId: string): ReportReplyEntry[] {
  const store = globalReportStore.__reportReplies!;
  return store.get(reportId) || [];
}