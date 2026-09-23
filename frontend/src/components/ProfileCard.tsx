import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Eye, Send, Sparkles, Laptop, Building2, Globe2, CheckCircle2, Star } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { ReputationBadge } from './ReputationBadge';
import type { Profile } from '../types';

interface ProfileCardProps {
  profile: Profile;
  onQuickView?: (profile: Profile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onQuickView }) => {
  // Determine work mode based on profile data or default intelligently
  const getWorkMode = (): { mode: 'Remote' | 'Hybrid' | 'In-Office'; icon: typeof Laptop; color: string } | null => {
    const text = `${profile.about || ''} ${profile.work_can_provide || ''} ${profile.profession || ''}`.toLowerCase();
    if (text.includes('remote')) {
      return { mode: 'Remote', icon: Globe2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' };
    }
    if (text.includes('hybrid')) {
      return { mode: 'Hybrid', icon: Laptop, color: 'bg-blue-50 text-blue-700 border-blue-200/70' };
    }
    if (text.includes('in-office') || text.includes('office') || text.includes('onsite')) {
      return { mode: 'In-Office', icon: Building2, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    if (profile.category === 'tech') {
      return { mode: 'Remote', icon: Globe2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' };
    }
    if (profile.category === 'non-tech') {
      return { mode: 'In-Office', icon: Building2, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    if (profile.category === 'both') {
      return { mode: 'Hybrid', icon: Laptop, color: 'bg-blue-50 text-blue-700 border-blue-200/70' };
    }
    return null;
  };

  const workModeInfo = getWorkMode();
  const WorkModeIcon = workModeInfo?.icon;

  const categoryColor =
    profile.category === 'tech'
      ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
      : profile.category === 'non-tech'
      ? 'bg-amber-50 text-amber-700 border-amber-200/80'
      : 'bg-purple-50 text-purple-700 border-purple-200/80';

  const categoryLabel =
    profile.category === 'tech'
      ? 'Tech'
      : profile.category === 'non-tech'
      ? 'Non-Tech'
      : 'Tech & Non-Tech';

  return (
    <div
      onClick={() => onQuickView && onQuickView(profile)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out p-5 flex flex-col justify-between cursor-pointer select-none"
    >
      {/* Top row: Avatar + Name + Badges */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Avatar
                url={profile.profile_photo_url}
                name={profile.full_name || 'Member'}
                size="md"
                className="w-12 h-12 ring-2 ring-indigo-50 border border-slate-100 group-hover:scale-105 transition-transform duration-200"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  profile.availability === 'busy'
                    ? 'bg-amber-400'
                    : profile.availability === 'unavailable'
                    ? 'bg-slate-400'
                    : 'bg-emerald-500'
                }`}
                title={profile.availability || 'Available'}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-600 transition-colors">
                  {profile.full_name || 'Member'}
                </h3>
                <span title="Verified Member">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {profile.profession || 'Member'}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          {profile.category && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${categoryColor}`}>
              {categoryLabel}
            </span>
          )}
        </div>

        {/* Location & Work Mode Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          {/* Work Mode Badge */}
          {workModeInfo && WorkModeIcon && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${workModeInfo.color}`}>
              <WorkModeIcon className="w-3 h-3" />
              <span>{workModeInfo.mode}</span>
            </span>
          )}

          {/* Location Badge */}
          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px]">{profile.location || 'Location not specified'}</span>
            {profile.distance_km !== undefined && profile.distance_km !== null && (
              <span className="text-indigo-600 font-semibold ml-0.5 shrink-0">
                • {profile.distance_km.toFixed(1)} km
              </span>
            )}
          </span>
        </div>

        {/* Reputation Badge & Rating Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <ReputationBadge
            delayCount={profile.delayed_work_count}
            completedJobs={profile.completed_jobs_count}
            status={profile.reputation_status}
            size="sm"
          />

          {profile.average_rating ? (
            <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-200/70">
              <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>{profile.average_rating.toFixed(1)}</span>
              {profile.review_count ? (
                <span className="text-[10px] text-slate-400 font-medium">({profile.review_count})</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Short Bio / About Snippet */}
        <p className={`text-xs line-clamp-2 leading-relaxed min-h-[32px] mb-3 ${profile.about || profile.work_can_provide ? 'text-slate-500' : 'text-slate-400 italic'}`}>
          {profile.about || profile.work_can_provide || 'No bio provided yet.'}
        </p>

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.skills && profile.skills.length > 0 ? (
            <>
              {profile.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill.id}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${
                    skill.category === 'tech'
                      ? 'bg-indigo-50/70 text-indigo-700 border-indigo-100'
                      : 'bg-amber-50/70 text-amber-800 border-amber-100'
                  }`}
                >
                  {skill.name}
                </span>
              ))}
              {profile.skills.length > 4 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md">
                  +{profile.skills.length - 4}
                </span>
              )}
            </>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Open for task opportunities</span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div
        className="pt-3 border-t border-slate-100 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onQuickView && onQuickView(profile)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold hover:border-slate-300 transition-colors shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick View</span>
        </button>

        <Link
          to={`/give-work?assignTo=${profile.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-xs shadow-indigo-100 transition-all duration-200"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Give Work</span>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;
