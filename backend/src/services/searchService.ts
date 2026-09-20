import { supabaseAdmin } from '../config/supabase';

export const searchPeople = async (params: {
  query?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  availability?: string;
}) => {
  const { data, error } = await supabaseAdmin.rpc('search_people', {
    search_query: params.query || null,
    search_category: params.category || null,
    user_lat: params.latitude || null,
    user_lng: params.longitude || null,
    search_radius: params.radius || 50,
    search_availability: params.availability || null,
  });

  if (error) throw error;
  return data;
};
