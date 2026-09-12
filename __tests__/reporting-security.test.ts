import { describe, it, expect } from 'vitest';
import { canViewReport, canChangeReportStatus, canReplyToReport } from '../src/lib/reportPermissions';
import { VALID_REASONS } from '../src/app/api/reports/route';

describe('Question Reporting Security & IDOR Authorization', () => {
  const studentAlice = { id: 'user_alice', role: 'STUDENT', email: 'alice@med.edu' };
  const studentBob = { id: 'user_bob', role: 'STUDENT', email: 'bob@med.edu' };
  const adminCardio = { id: 'admin_1', role: 'ADMIN', email: 'admin@usmle.com' };
  const contributorCardioOnly = { id: 'contrib_cardio', role: 'CONTRIBUTOR', email: 'contrib@usmle.com' };

  const aliceReportInCardio = {
    id: 'report_1',
    userId: 'user_alice',
    questionId: 'q_cardio_1',
    qbankId: 'qbank_cardiology',
    status: 'OPEN'
  };

  const bobReportInNeuro = {
    id: 'report_2',
    userId: 'user_bob',
    questionId: 'q_neuro_1',
    qbankId: 'qbank_neurology',
    status: 'OPEN'
  };

  describe('Report View IDOR Prevention', () => {
    it('allows a student to view their own submitted report', () => {
      expect(canViewReport(studentAlice, aliceReportInCardio)).toBe(true);
    });

    it('PREVENTS Student Alice from viewing Student Bob private report (IDOR)', () => {
      expect(canViewReport(studentAlice, bobReportInNeuro)).toBe(false);
    });

    it('allows admin to view reports belonging to their administered QBank', () => {
      expect(canViewReport(adminCardio, aliceReportInCardio)).toBe(true);
    });

    it('allows contributor to view reports ONLY for permitted QBanks', () => {
      const permittedQBanks = ['qbank_cardiology'];
      // Permitted
      expect(canViewReport(contributorCardioOnly, aliceReportInCardio, permittedQBanks)).toBe(true);
      // Denied (Unrelated QBank)
      expect(canViewReport(contributorCardioOnly, bobReportInNeuro, permittedQBanks)).toBe(false);
    });
  });

  describe('Report Status Change Authorization', () => {
    it('PREVENTS students from modifying report status', () => {
      expect(canChangeReportStatus(studentAlice, aliceReportInCardio)).toBe(false);
    });

    it('allows authorized admin to change report status', () => {
      expect(canChangeReportStatus(adminCardio, aliceReportInCardio)).toBe(true);
    });

    it('PREVENTS contributor from changing status on unassigned QBank', () => {
      const permitted = ['qbank_cardiology'];
      expect(canChangeReportStatus(contributorCardioOnly, bobReportInNeuro, permitted)).toBe(false);
    });
  });

  describe('Report Reply Authorization', () => {
    it('allows student to reply to their own report thread', () => {
      expect(canReplyToReport(studentAlice, aliceReportInCardio)).toBe(true);
    });

    it('PREVENTS a third-party student from posting replies to another student report', () => {
      expect(canReplyToReport(studentAlice, bobReportInNeuro)).toBe(false);
    });

    it('allows permitted contributor to post replies', () => {
      expect(canReplyToReport(contributorCardioOnly, aliceReportInCardio, ['qbank_cardiology'])).toBe(true);
    });
  });

  describe('Report Reasons & Validation', () => {
    it('supports all 8 required reporting reasons', () => {
      expect(VALID_REASONS).toContain('INCORRECT_QUESTION');
      expect(VALID_REASONS).toContain('INCORRECT_ANSWER');
      expect(VALID_REASONS).toContain('INCORRECT_EXPLANATION');
      expect(VALID_REASONS).toContain('MULTIPLE_CORRECT_ANSWERS');
      expect(VALID_REASONS).toContain('NO_CORRECT_ANSWER');
      expect(VALID_REASONS).toContain('TYPO');
      expect(VALID_REASONS).toContain('AMBIGUITY');
      expect(VALID_REASONS).toContain('OTHER');
      expect(VALID_REASONS.length).toBe(8);
    });
  });
});