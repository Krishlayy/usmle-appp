'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import CountrySelect from '@/components/ui/CountrySelect';
import { 
  User, 
  ShoppingBag, 
  MessageSquare, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Send,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
    countryCode: string | null;
    countryName: string | null;
    createdAt: string;
  };
  purchases: Array<{
    id: string;
    amountPaidCents: number;
    status: string;
    purchasedAt: string;
    expiresAt: string | null;
    qbank: {
      id: string;
      title: string;
      slug: string;
      specialtyTag: string;
      totalQuestions: number;
    };
  }>;
  reports: Array<{
    id: string;
    issueType: string;
    description: string;
    status: string;
    createdAt: string;
    question: {
      id: string;
      qid: string;
      questionText: string;
      subtopic: string | null;
      qbank?: { id: string; title: string; slug: string };
    };
    replies: Array<{
      id: string;
      authorName?: string;
      authorRole?: string;
      message: string;
      createdAt: string;
    }>;
    replyCount: number;
    latestReply: any;
  }>;
  notifications: Array<any>;
}

export default function ProfileClient() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'reports'>('profile');
  
  // Edit state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selected report for thread viewer modal
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setName(json.user.name || '');
        setCountryCode(json.user.countryCode || '');
        setCountryName(json.user.countryName || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, countryCode, countryName }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setEditing(false);
        await fetchProfile();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });
      if (res.ok) {
        setReplyText('');
        await fetchProfile();
        // Refresh selected report
        const updatedRes = await fetch(`/api/reports/${selectedReport.id}`);
        if (updatedRes.ok) {
          const updated = await updatedRes.json();
          setSelectedReport(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500 font-medium">Loading student profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Profile Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-slate-900 text-white flex items-center justify-center text-xl font-bold font-serif shadow-md">
              {data.user.name ? data.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{data.user.name || 'Student'}</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                  {data.user.role}
                </span>
              </div>
              <p className="text-sm text-slate-500">{data.user.email}</p>
              {data.user.countryName && (
                <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{data.user.countryName} ({data.user.countryCode})</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Your profile details have been successfully updated.
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6">
          {[
            { key: 'profile', label: 'Personal Details', icon: User },
            { key: 'purchases', label: `Purchase History (${data.purchases.length})`, icon: ShoppingBag },
            { key: 'reports', label: `Report History (${data.reports.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
                  isActive
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500">Manage your name and geographical study jurisdiction.</p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs font-bold text-cyan-600 hover:text-cyan-700"
                >
                  Edit Information
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700" htmlFor="edit-name">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700" htmlFor="edit-country">Country</label>
                  <CountrySelect
                    id="edit-country"
                    value={countryCode}
                    onChange={(c) => {
                      setCountryCode(c.code);
                      setCountryName(c.name);
                    }}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">Full Name</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{data.user.name || 'Not provided'}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">Email Address</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{data.user.email}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">Country / Region</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">
                    {data.user.countryName ? `${data.user.countryName} (${data.user.countryCode})` : 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">Account Member Since</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">
                    {new Date(data.user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Purchase History */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your QBank Subscriptions</h3>
              <p className="text-xs text-slate-500">Track all your purchased question banks and access duration.</p>
            </div>

            {data.purchases.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No active purchases found on your account.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.purchases.map((purchase) => (
                  <div key={purchase.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {purchase.qbank.title}
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {purchase.status === 'active' ? 'Active Access' : 'Refunded'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {purchase.qbank.specialtyTag} &bull; {purchase.qbank.totalQuestions} Questions
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs font-semibold text-slate-900">
                        ${(purchase.amountPaidCents / 100).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Purchased: {new Date(purchase.purchasedAt).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        {purchase.expiresAt ? `Expires: ${new Date(purchase.expiresAt).toLocaleDateString()}` : 'Lifetime Access'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Report History */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Reported Questions & Quality Feedback</h3>
              <p className="text-xs text-slate-500">View faculty responses and conversation status for reported questions.</p>
            </div>

            {data.reports.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">You have not submitted any question reports yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="py-4 cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                          {report.question.qid}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {report.issueType.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          report.status === 'OPEN' ? 'bg-blue-50 text-blue-700' :
                          report.status === 'IN_REVIEW' ? 'bg-amber-50 text-amber-700' :
                          report.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-1 italic">
                        "{report.description}"
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Submitted: {new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.replyCount > 0 && (
                          <span className="flex items-center gap-1 text-cyan-700 font-semibold">
                            <MessageSquare className="w-3 h-3" /> {report.replyCount} faculty replies
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report Discussion Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-400">Question {selectedReport.question.qid}</div>
                  <h3 className="text-lg font-bold text-slate-900">Report Feedback & Discussion</h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              {/* Question Context */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Question Text</div>
                <div 
                  className="line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: selectedReport.question.questionText }}
                />
              </div>

              {/* Student Report */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Submitted Feedback</div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-slate-800 leading-relaxed">
                  "{selectedReport.description}"
                </div>
              </div>

              {/* Replies Thread */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Faculty Responses ({selectedReport.replies?.length || 0})
                </div>
                {(!selectedReport.replies || selectedReport.replies.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Our medical faculty has not posted a reply yet. Status: {selectedReport.status}.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedReport.replies.map((reply: any) => (
                      <div key={reply.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600">
                          <span>{reply.authorName || 'Faculty'}</span>
                          <span className="text-slate-400 font-normal">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-800">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow-up Message */}
              <form onSubmit={handleSendReply} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}