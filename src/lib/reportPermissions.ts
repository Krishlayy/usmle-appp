export interface AuthUser {
  id: string;
  role: string;
  email?: string | null;
}

export interface ReportItem {
  id: string;
  userId: string;
  questionId: string;
  qbankId?: string;
  status: string;
}

/**
 * Server-side authorization check for viewing reports.
 * - Students can ONLY view their own reports.
 * - Superadmins can view reports across all QBanks.
 * - Admins and Contributors can view reports belonging to QBanks they are authorized for.
 */
export function canViewReport(user: AuthUser, report: ReportItem, permittedQBankIds?: string[]): boolean {
  if (user.role === 'SUPERADMIN') return true;
  if (user.role === 'ADMIN') {
    if (!permittedQBankIds || permittedQBankIds.length === 0) return true;
    return !report.qbankId || permittedQBankIds.includes(report.qbankId);
  }
  if (user.role === 'CONTRIBUTOR') {
    return Boolean(report.qbankId && permittedQBankIds?.includes(report.qbankId));
  }
  // Student
  return report.userId === user.id;
}

export function canChangeReportStatus(user: AuthUser, report: ReportItem, permittedQBankIds?: string[]): boolean {
  if (user.role === 'SUPERADMIN') return true;
  if (user.role === 'ADMIN') {
    if (!permittedQBankIds || permittedQBankIds.length === 0) return true;
    return !report.qbankId || permittedQBankIds.includes(report.qbankId);
  }
  if (user.role === 'CONTRIBUTOR') {
    return Boolean(report.qbankId && permittedQBankIds?.includes(report.qbankId));
  }
  return false;
}

export function canReplyToReport(user: AuthUser, report: ReportItem, permittedQBankIds?: string[]): boolean {
  // Student can reply to their own report
  if (report.userId === user.id) return true;
  // Admin / Contributor with permission can reply
  return canChangeReportStatus(user, report, permittedQBankIds);
}