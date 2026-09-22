import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Compass,
  ArrowRight,
  Clock,
  CheckCircle2,
  Inbox,
  Send,
  Plus,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Activity,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import type { Work, WorkRequest, Profile } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [givingWork, setGivingWork] = useState<Work[]>([]);
  const [takingWork, setTakingWork] = useState<Work[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<WorkRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [profileData, giving, taking, incoming, outgoing] = await Promise.all([
          api.get<Profile>('/profiles/me').catch(() => null),
          api.get<Work[]>('/works/my/giving').catch(() => []),
          api.get<Work[]>('/works/my/taking').catch(() => []),
          api.get<WorkRequest[]>('/requests/incoming').catch(() => []),
          api.get<WorkRequest[]>('/requests/outgoing').catch(() => []),
        ]);

        if (!isMounted) return;

        if (profileData) setProfile(profileData);
        setGivingWork(Array.isArray(giving) ? giving : []);
        setTakingWork(Array.isArray(taking) ? taking : []);
        setIncomingRequests(Array.isArray(incoming) ? incoming : []);
        setOutgoingRequests(Array.isArray(outgoing) ? outgoing : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute a personalized, human username rather than displaying raw email
  const getPersonalizedName = () => {
    if (profile?.full_name?.trim()) {
      return profile.full_name.trim();
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      // Clean numbers, dots, and underscores for a human name
      const cleaned = emailPrefix.replace(/[0-9._]/g, ' ').trim();
      if (cleaned) {
        return cleaned
          .split(' ')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }
    return 'Professional';
  };

  const username = getPersonalizedName();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ================= 1. USER PROFILE HEADER (SaaS Style) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle accent backdrop decoration */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-50/70 via-blue-50/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-start sm:items-center gap-4">
          <Link to="/profile" className="group shrink-0" title="Go to Profile">
            <div className="relative">
              <Avatar
                url={profile?.profile_photo_url}
                name={username}
                size="lg"
                className="w-16 h-16 sm:w-18 sm:h-18 ring-4 ring-indigo-50 border-2 border-white shadow-md text-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
            </div>
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {username}!
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Two-Way Active
              </span>
            </div>

            <p className="text-sm text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-3">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {currentDate}
              </span>
              <span>•</span>
              <span className="text-slate-600 font-medium">
                {profile?.profession ? profile.profession : 'Marketplace Member'}
              </span>
              {profile?.location && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Header Right Quick Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs hover:border-slate-300 transition-all duration-200"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search People</span>
          </Link>

          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-sm font-semibold transition-colors duration-200"
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="h-5 w-32 bg-slate-100 rounded-md" />
                <div className="h-3 w-full bg-slate-100 rounded-md" />
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        /* ================= 2. MAIN 6-CARD DASHBOARD GRID (3x2 / 2x3) ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ================= CARD 1: GIVE WORK (Action Box) ================= */}
          <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full uppercase tracking-wider">
                  Post Work
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Give Work
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Need a task completed? Create and publish a job to hire verified talent across tech and local non-tech services.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Tech & Non-Tech</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Custom Budget</span>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/give-work"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-bold shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-200 transform active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Work Post</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-1" />
              </Link>
            </div>
          </div>

          {/* ================= CARD 2: TAKE WORK (Action Box) ================= */}
          <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wider">
                  Find Work
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Take Work
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Looking to deliver your expertise? Explore available open tasks nearby and submit requests to take work.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">1–50 km Radius</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Direct Proposal</span>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/browse-work"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 transition-all duration-200 transform active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>🔍 Browse Open Work</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-1" />
              </Link>
            </div>
          </div>

          {/* ================= CARD 3: WORK I'M GIVING (Status Tracker) ================= */}
          <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-xs rounded-full">
                    {givingWork.length} Active
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Work I'm Giving
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Active tasks you created and assigned to other workers. Track milestone completion and manage posts.
              </p>

              {/* Work Preview Items */}
              <div className="mt-4 space-y-2">
                {givingWork.length > 0 ? (
                  givingWork.slice(0, 2).map((work) => (
                    <div
                      key={work.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{work.title}</p>
                        <p className="text-[11px] text-slate-400 capitalize">{work.category} • {work.status}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md shrink-0 capitalize">
                        {work.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium">No active tasks being given</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-slate-100">
              <Link
                to="/my-work"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 group/link"
              >
                <span>View All Given Tasks ({givingWork.length})</span>
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ================= CARD 4: WORK I'M TAKING (Status Tracker) ================= */}
          <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 p-6 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-all duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-bold text-xs rounded-full">
                  {takingWork.length} Ongoing
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                Work I'm Taking
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Ongoing tasks you accepted from other members. Review project requirements and submit for completion.
              </p>

              {/* Work Preview Items */}
              <div className="mt-4 space-y-2">
                {takingWork.length > 0 ? (
                  takingWork.slice(0, 2).map((work) => (
                    <div
                      key={work.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{work.title}</p>
                        <p className="text-[11px] text-slate-400 capitalize">{work.category} • In Progress</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-700 rounded-md shrink-0">
                        In Progress
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium">No ongoing tasks right now</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-slate-100">
              <Link
                to="/my-work"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-800 group/link"
              >
                <span>View All Taken Tasks ({takingWork.length})</span>
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ================= CARD 5: INCOMING REQUESTS (Notification Card) ================= */}
          <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-amber-300 p-6 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-all duration-300">
                  <Inbox className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                  {incomingRequests.length} Pending
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Incoming Requests
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Candidates offering to take your posted work. Review their profiles, accept offers, or decline proposals.
              </p>

              {/* Request Items */}
              <div className="mt-4 space-y-2">
                {incomingRequests.length > 0 ? (
                  incomingRequests.slice(0, 2).map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {req.requester?.full_name || 'Worker Request'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{req.work?.title || 'Job application'}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-md shrink-0">
                        Review
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium">All caught up! No pending requests</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-slate-100">
              <Link
                to="/requests"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-800 group/link"
              >
                <span>Manage Incoming ({incomingRequests.length})</span>
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ================= CARD 6: OUTGOING REQUESTS (Notification Card) ================= */}
          <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 p-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-all duration-300">
                  <Send className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-bold text-xs rounded-full">
                  {outgoingRequests.length} Sent
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Outgoing Requests
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Work applications and service offers you sent to job posters. Track real-time approval status.
              </p>

              {/* Request Items */}
              <div className="mt-4 space-y-2">
                {outgoingRequests.length > 0 ? (
                  outgoingRequests.slice(0, 2).map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {req.work?.title || 'Applied Work'}
                        </p>
                        <p className="text-[11px] text-slate-400 capitalize">{req.status}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 rounded-md shrink-0 capitalize">
                        {req.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium">No active outgoing proposals</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-slate-100">
              <Link
                to="/requests"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-800 group/link"
              >
                <span>Track Outgoing ({outgoingRequests.length})</span>
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
