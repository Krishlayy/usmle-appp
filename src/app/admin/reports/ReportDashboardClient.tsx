'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  MessageSquare, 
  ChevronRight, 
  Send, 
  Filter,
  AlertTriangle
} from 'lucide-react';

interface Report {
  id: string;
  issueType: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  question: {
    id: string;
    qid: string;
    questionText: string;
    subtopic: string | null;
    difficulty: string;
    qbank?: { id: string; title: string; slug: string };
  };
  replyCount: number;
  latestReply: any;
  historyCount: number;
}

interface ReportDetail extends Report {
  replies: Array<{
    id: string;
    authorId: string;
    authorName?: string;
    authorRole?: string;
    message: string;
    createdAt: string;
  }>;
  history: Array<{
    id: string;
    actorRole?: string;
    oldStatus: string;
    newStatus: string;
    timestamp: string;
  }>;
}

const STALE_THRESHOLD_DAYS = 3;

export default function ReportDashboardClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState({ all: 0, open: 0, inReview: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (reasonFilter !== 'ALL') params.set('reason', reasonFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, reasonFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const openReportDetail = async (reportId: string) => {
    setSelectedReportId(reportId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`);
      if (res.ok) {
        const data = await res.json();
        setReportDetail(data);
      }
    } catch (err) {
      console.error('Error loading report detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedReportId) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/reports/${selectedReportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await openReportDetail(selectedReportId);
        await fetchReports();
      }
    } catch (err) {
      console.error('Error changing status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !replyMessage.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/reports/${selectedReportId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      });
      if (res.ok) {
        setReplyMessage('');
        await openReportDetail(selectedReportId);
        await fetchReports();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const isStale = (createdAt: string, status: string) => {
    if (status !== 'OPEN') return false;
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const daysOld = (now - created) / (1000 * 60 * 60 * 24);
    return daysOld >= STALE_THRESHOLD_DAYS;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Question Reports & Quality Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Review student issues, triage board questions, and reply to inquiries.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Stale indicator: &gt; {STALE_THRESHOLD_DAYS}d open
          </span>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'All Reports', key: 'ALL', count: counts.all, color: 'border-slate-300' },
          { label: 'Open', key: 'OPEN', count: counts.open, color: 'border-blue-500 text-blue-600' },
          { label: 'In Review', key: 'IN_REVIEW', count: counts.inReview, color: 'border-amber-500 text-amber-600' },
          { label: 'Resolved', key: 'RESOLVED', count: counts.resolved, color: 'border-emerald-500 text-emerald-600' },
          { label: 'Rejected', key: 'REJECTED', count: counts.rejected, color: 'border-rose-500 text-rose-600' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`p-3 text-left rounded-xl border transition-all ${
              statusFilter === tab.key
                ? 'bg-white shadow-sm ring-2 ring-cyan-500 border-transparent'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs font-medium text-slate-500">{tab.label}</div>
            <div className={`text-xl font-bold mt-1 ${tab.color.split(' ')[1] || 'text-slate-900'}`}>
              {tab.count}
            </div>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Question ID (e.g. CARD-1), subtopic, or text..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            aria-label="Filter reports by issue reason"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="ALL">All Reasons</option>
            <option value="INCORRECT_QUESTION">Incorrect Question</option>
            <option value="INCORRECT_ANSWER">Incorrect Answer</option>
            <option value="INCORRECT_EXPLANATION">Incorrect Explanation</option>
            <option value="MULTIPLE_CORRECT_ANSWERS">Multiple Correct</option>
            <option value="NO_CORRECT_ANSWER">No Correct Answer</option>
            <option value="TYPO">Typo / Formatting</option>
            <option value="AMBIGUITY">Ambiguity</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Reports Table & Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={selectedReportId ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No reports matching filter criteria.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report) => {
                  const stale = isStale(report.createdAt, report.status);
                  const isSelected = selectedReportId === report.id;
                  return (
                    <div
                      key={report.id}
                      onClick={() => openReportDetail(report.id)}
                      className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                        isSelected ? 'bg-cyan-50/60 border-l-4 border-cyan-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                            {report.question.qid}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {report.issueType.replace(/_/g, ' ')}
                          </span>
                          {stale && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Stale (&gt;3d)
                            </span>
                          )}
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            report.status === 'OPEN' ? 'bg-blue-50 text-blue-700' :
                            report.status === 'IN_REVIEW' ? 'bg-amber-50 text-amber-700' :
                            report.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 line-clamp-2 italic">
                          "{report.description}"
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Reporter: {report.user?.name || report.user?.email}</span>
                          <span>&bull;</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          {report.replyCount > 0 && (
                            <>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1 text-cyan-700 font-semibold">
                                <MessageSquare className="w-3 h-3" /> {report.replyCount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail Drawer */}
        {selectedReportId && (
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-6">
              {detailLoading || !reportDetail ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading details...</div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Question Review</div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{reportDetail.question.qid}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedReportId(null)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  {/* Status Switcher */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block" htmlFor="report-status-select">
                      Change Report Status
                    </label>
                    <select
                      id="report-status-select"
                      aria-label="Change report status"
                      disabled={updatingStatus}
                      value={reportDetail.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_REVIEW">IN_REVIEW</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  {/* Question Stem */}
                  <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50/50 space-y-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Context</div>
                    <div 
                      className="text-xs text-slate-700 line-clamp-4 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: reportDetail.question.questionText }}
                    />
                  </div>

                  {/* Student Description */}
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student's Issue</div>
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-sm text-slate-800 leading-relaxed">
                      "{reportDetail.description}"
                    </div>
                  </div>

                  {/* Conversation Thread */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Discussion Thread ({reportDetail.replies.length})
                    </div>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {reportDetail.replies.length === 0 ? (
                        <div className="text-xs text-slate-400 italic">No replies yet. Post a response below.</div>
                      ) : (
                        reportDetail.replies.map((reply) => (
                          <div key={reply.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600">
                              <span>{reply.authorName} ({reply.authorRole || 'Faculty'})</span>
                              <span className="text-slate-400 font-normal">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs text-slate-800 leading-relaxed">{reply.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Input */}
                    <form onSubmit={handleSendReply} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Reply to student..."
                        className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingReply || !replyMessage.trim()}
                        className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Reply
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}