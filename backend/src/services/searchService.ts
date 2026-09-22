import { supabaseAdmin } from '../config/supabase';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const searchPeople = async (params: {
  query?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  availability?: string;
}) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, user_skills(skills(*))');

  if (error) throw error;
  if (!data) return [];

  let candidates = data.map((p: any) => {
    const rawSkills = (p.user_skills || [])
      .map((us: any) => us.skills)
      .filter(Boolean);

    let distance_km: number | null = null;
    if (
      params.latitude !== undefined &&
      params.latitude !== null &&
      params.longitude !== undefined &&
      params.longitude !== null &&
      p.latitude !== null &&
      p.longitude !== null
    ) {
      distance_km = getDistanceKm(
        params.latitude,
        params.longitude,
        p.latitude,
        p.longitude
      );
    }

    const { user_skills, ...profileFields } = p;
    return {
      ...profileFields,
      skills: rawSkills,
      distance_km,
    };
  });

  // Filter by query (name, profession, skills, about, work_can_provide)
  if (params.query && params.query.trim()) {
    const q = params.query.trim().toLowerCase();
    candidates = candidates.filter((c: any) => {
      const nameMatch = (c.full_name || '').toLowerCase().includes(q);
      const emailMatch = (c.email || '').toLowerCase().includes(q);
      const profMatch = (c.profession || '').toLowerCase().includes(q);
      const aboutMatch = (c.about || '').toLowerCase().includes(q);
      const provideMatch = (c.work_can_provide || '').toLowerCase().includes(q);
      const skillMatch = (c.skills || []).some((s: any) =>
        (s.name || '').toLowerCase().includes(q)
      );
      return nameMatch || emailMatch || profMatch || aboutMatch || provideMatch || skillMatch;
    });
  }

  // Filter by category
  if (params.category && params.category !== 'all') {
    candidates = candidates.filter((c: any) => {
      return (
        c.category === params.category ||
        c.category === 'both' ||
        (c.skills || []).some((s: any) => s.category === params.category)
      );
    });
  }

  // Filter by availability
  if (params.availability && params.availability !== 'all') {
    candidates = candidates.filter((c: any) => {
      return c.availability === params.availability;
    });
  }

  // Filter by radius if GPS/location coordinates are supplied
  if (
    params.radius &&
    params.radius > 0 &&
    params.latitude !== undefined &&
    params.longitude !== undefined
  ) {
    candidates = candidates.filter((c: any) => {
      if (c.distance_km === null) return true; // keep candidates without coordinates or include within radius
      return c.distance_km <= params.radius!;
    });

    // Sort by distance ascending
    candidates.sort((a: any, b: any) => {
      if (a.distance_km === null && b.distance_km === null) return 0;
      if (a.distance_km === null) return 1;
      if (b.distance_km === null) return -1;
      return a.distance_km - b.distance_km;
    });
  }

  return candidates;
};
