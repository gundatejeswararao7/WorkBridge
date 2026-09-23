import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Globe2,
  Laptop,
  Building2,
  X,
  Sparkles,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Send,
  Eye,
  RotateCcw,
  Navigation,
  AlertCircle,
  Star,
} from 'lucide-react';
import { api } from '../lib/api';
import { cities } from '../data/cities';
import { useLocation as useGeoLocation } from '../hooks/useLocation';
import { useAuth } from '../contexts/AuthContext';
import { ProfileCard } from '../components/ProfileCard';
import { ReputationBadge } from '../components/ReputationBadge';
import { Avatar } from '../components/ui/Avatar';
import type { Profile } from '../types';

function getNearestCityName(lat: number, lng: number): string | null {
  let closest: (typeof cities)[0] | null = null;
  let minDiff = Infinity;
  for (const c of cities) {
    const diff = Math.hypot(c.latitude - lat, c.longitude - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = c;
    }
  }
  // Within ~1.5 degrees (~160 km)
  if (closest && minDiff < 1.5) {
    return closest.name;
  }
  return null;
}

export const SearchPeoplePage: React.FC = () => {
  const { user } = useAuth();

  // Search parameters
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'tech' | 'non-tech'>('all');
  const [workMode, setWorkMode] = useState<'all' | 'remote' | 'in-office' | 'hybrid'>('all');
  const [locationInput, setLocationInput] = useState('');
  const [radiusKm, setRadiusKm] = useState<number | ''>(''); // '' means Global
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Results & UI state
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCandidateModal, setActiveCandidateModal] = useState<Profile | null>(null);

  const { error: geoError, loading: geoLoading, getCurrentLocation } = useGeoLocation();
  const searchTimeoutRef = useRef<any>(null);

  // Execute candidate search
  const executeSearch = async (overrideCoords?: { latitude: number; longitude: number } | null) => {
    setLoading(true);
    try {
      let lat = '';
      let lng = '';

      const activeGps = overrideCoords !== undefined ? overrideCoords : gpsCoords;

      if (activeGps && locationInput.startsWith('Current Location')) {
        lat = activeGps.latitude.toString();
        lng = activeGps.longitude.toString();
      } else if (locationInput.trim() && !locationInput.startsWith('Current Location')) {
        const matchedCity = cities.find(
          (c) => c.name.toLowerCase() === locationInput.trim().toLowerCase()
        );
        if (matchedCity) {
          lat = matchedCity.latitude.toString();
          lng = matchedCity.longitude.toString();
        }
      }

      const queryParams = new URLSearchParams({
        q: query.trim(),
        category: category !== 'all' ? category : '',
        lat,
        lng,
        radius: lat && lng && radiusKm ? radiusKm.toString() : '',
      });

      const data = await api.get<Profile[]>(`/users/search?${queryParams.toString()}`);
      let candidateList = Array.isArray(data) ? data : [];

      // Account Visibility Rule: Exclude the current logged-in user from candidate search
      if (user?.id) {
        candidateList = candidateList.filter((p) => p.id !== user.id);
      }

      // Filter by location text if free text entered without exact lat/lng
      if (locationInput.trim() && !locationInput.startsWith('Current Location') && !lat) {
        const locLower = locationInput.toLowerCase();
        candidateList = candidateList.filter((p) =>
          (p.location || '').toLowerCase().includes(locLower)
        );
      }

      // Filter by Work Mode (Remote / In-Office / Hybrid)
      if (workMode !== 'all') {
        candidateList = candidateList.filter((p) => {
          const text = `${p.about} ${p.work_can_provide} ${p.profession}`.toLowerCase();
          if (workMode === 'remote') {
            return text.includes('remote') || p.category === 'tech';
          }
          if (workMode === 'in-office') {
            return text.includes('office') || text.includes('onsite') || p.category === 'non-tech';
          }
          if (workMode === 'hybrid') {
            return text.includes('hybrid') || p.category === 'both';
          }
          return true;
        });
      }

      setResults(candidateList);
    } catch (error) {
      console.error('Search request failed', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search on query and filter changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      executeSearch();
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, category, workMode, locationInput, radiusKm, gpsCoords]);

  // Handle setting current GPS location from browser
  const handleUseCurrentLocation = async () => {
    setIsLocationDropdownOpen(false);
    if (!radiusKm) setRadiusKm(25);

    const coords = await getCurrentLocation();
    if (coords) {
      setGpsCoords(coords);
      const nearestName = getNearestCityName(coords.latitude, coords.longitude);
      const label = nearestName ? `Current Location (${nearestName})` : 'Current Location';
      setLocationInput(label);
      executeSearch(coords);
    }
  };

  // Reset all filters to default
  const handleClearFilters = () => {
    setQuery('');
    setCategory('all');
    setWorkMode('all');
    setLocationInput('');
    setRadiusKm('');
    setGpsCoords(null);
  };

  const citySuggestions = useMemo(() => {
    if (!locationInput.trim() || locationInput.startsWith('Current Location')) {
      return cities.slice(0, 8);
    }
    return cities
      .filter((c) => c.name.toLowerCase().includes(locationInput.toLowerCase()))
      .slice(0, 8);
  }, [locationInput]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ================= 1. SEARCH & FILTER CONTAINER (Matching Picture Layout) ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6">
        {/* Header with Purple Squircle Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Find Candidates & People
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Search verified talent by skills, username, work style, and custom distance.
            </p>
          </div>
        </div>

        {/* Primary Full-Width Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by skill (e.g. React, Python), title, or username..."
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontal Stacked Filter Rows (Labels on Left, Controls on Right) */}
        <div className="space-y-4 pt-1">
          {/* Row 1: Category */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="w-36 text-sm font-medium text-slate-700 shrink-0">
              Category
            </label>
            <div className="flex-1 flex rounded-2xl p-1 bg-slate-100/80 border border-slate-200/60 max-w-2xl">
              {(['all', 'tech', 'non-tech'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 capitalize cursor-pointer ${
                    category === cat
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'non-tech' ? 'Non-Tech' : 'Tech'}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Location & Radius */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="w-36 text-sm font-medium text-slate-700 shrink-0">
              Location & Radius
            </label>

            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
              {/* Location Input with Pin & Globe Trigger */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    if (gpsCoords) setGpsCoords(null);
                    setIsLocationDropdownOpen(true);
                  }}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                  placeholder="City, state, or 'Global'..."
                  className="w-full pl-9 pr-16 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />

                {/* Right Globe / GPS trigger */}
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-0.5">
                  {locationInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationInput('');
                        setGpsCoords(null);
                      }}
                      title="Clear location"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    title="Use My GPS Location"
                    disabled={geoLoading}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                    title="Browse Cities"
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {isLocationDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsLocationDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-52 overflow-y-auto py-1">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer border-b border-slate-100"
                      >
                        <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                        <span>{geoLoading ? '📍 Detecting location...' : '📍 Use My Current Location'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLocationInput('');
                          setRadiusKm('');
                          setGpsCoords(null);
                          setIsLocationDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Global (Any Location)</span>
                      </button>

                      {citySuggestions.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setLocationInput(c.name);
                            setGpsCoords(null);
                            setIsLocationDropdownOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-400">City</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Radius Pills with Top Right Status Text */}
              <div className="relative flex flex-col">
                <div className="flex justify-end mb-1">
                  <span className="text-[11px] font-bold text-indigo-600">
                    {radiusKm ? `${radiusKm} km radius` : 'Global (No limit)'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRadiusKm('')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      radiusKm === ''
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Global
                  </button>

                  {([10, 25, 50] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadiusKm(radiusKm === r ? '' : r)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        radiusKm === r
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}k
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location Feedback & Error States */}
          {geoLoading && (
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 animate-pulse sm:ml-42">
              <Navigation className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting browser location... Please grant permission if prompted.</span>
            </div>
          )}

          {geoError && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 sm:ml-42">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}

          {/* Row 3: Work Availability (All, Remote, Office, Hybrid) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="w-36 text-sm font-medium text-slate-700 shrink-0">
              Work Availability
            </label>
            <div className="flex-1 flex rounded-2xl p-1 bg-slate-100/80 border border-slate-200/60 max-w-2xl">
              {(
                [
                  { id: 'all', label: 'All', icon: Sparkles },
                  { id: 'remote', label: 'Remote', icon: Cloud },
                  { id: 'in-office', label: 'Office', icon: Building2 },
                  { id: 'hybrid', label: 'Hybrid', icon: Laptop },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isSelected = workMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWorkMode(item.id)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-indigo-600 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row: Reset Button on the Right */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>

      {/* ================= 2. RESULTS TITLE & CANDIDATE PROFILE CARDS ================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Available Candidates</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {results.length} found
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {radiusKm ? `Within ${radiusKm} km` : 'Global Search'}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-white border border-slate-200 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 bg-slate-100 rounded-md" />
                      <div className="h-3 w-20 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-md" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded-md" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          /* Responsive 3-column Candidate Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((cand) => (
              <ProfileCard
                key={cand.id}
                profile={cand}
                onQuickView={(p) => setActiveCandidateModal(p)}
              />
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matching candidates found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find anyone matching your exact search filters. Try broadening your location, removing the radius, or clearing keywords.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 3. QUICK VIEW PROFILE MODAL ================= */}
      {activeCandidateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveCandidateModal(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 relative p-4 flex justify-end">
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6 pt-0 relative">
              {/* Avatar protruding above banner */}
              <div className="-mt-14 mb-4 flex items-end justify-between">
                <Avatar
                  url={activeCandidateModal.profile_photo_url}
                  name={activeCandidateModal.full_name || 'Member'}
                  size="lg"
                  className="w-20 h-20 ring-4 ring-white shadow-lg text-3xl"
                />

                {activeCandidateModal.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase">
                    {activeCandidateModal.category === 'both' ? 'Tech & Non-Tech' : activeCandidateModal.category}
                  </span>
                )}
              </div>

              {/* Candidate Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {activeCandidateModal.full_name || 'Member'}
                  </h2>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  {activeCandidateModal.profession || 'Member'}
                </p>

                {/* Location & Distance */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeCandidateModal.location || 'Location not specified'}</span>
                  </span>
                  {activeCandidateModal.distance_km !== undefined && activeCandidateModal.distance_km !== null && (
                    <span className="text-indigo-600 font-bold">
                      {activeCandidateModal.distance_km.toFixed(1)} km away
                    </span>
                  )}
                </div>

                {/* Reputation Badge + Star Rating */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <ReputationBadge
                    delayCount={activeCandidateModal.delayed_work_count ?? 0}
                    completedJobs={activeCandidateModal.completed_jobs_count ?? 0}
                    status={activeCandidateModal.reputation_status}
                    size="sm"
                  />
                  {typeof activeCandidateModal.average_rating === 'number' && activeCandidateModal.average_rating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {activeCandidateModal.average_rating.toFixed(1)}
                      <span className="font-normal text-amber-600 ml-0.5">
                        ({activeCandidateModal.review_count ?? 0} review{(activeCandidateModal.review_count ?? 0) !== 1 ? 's' : ''})
                      </span>
                    </span>
                  )}
                  {activeCandidateModal.completed_jobs_count != null && activeCandidateModal.completed_jobs_count > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/80">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {activeCandidateModal.completed_jobs_count} job{activeCandidateModal.completed_jobs_count !== 1 ? 's' : ''} done
                    </span>
                  )}
                </div>

              </div>

              {/* Bio */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  About
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeCandidateModal.about || 'No detailed biography provided yet.'}
                </p>
              </div>

              {/* Services Offered */}
              {activeCandidateModal.work_can_provide && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Services / Work Offered
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeCandidateModal.work_can_provide}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Skills & Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeCandidateModal.skills && activeCandidateModal.skills.length > 0 ? (
                    activeCandidateModal.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                          skill.category === 'tech'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                            : 'bg-amber-50 text-amber-800 border-amber-200/60'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <Link
                  to={`/user/${activeCandidateModal.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {activeCandidateModal.id !== user?.id ? (
                  <Link
                    to={`/give-work?assignTo=${activeCandidateModal.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all duration-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Give Work</span>
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-200"
                  >
                    <span>Edit My Profile</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPeoplePage;
