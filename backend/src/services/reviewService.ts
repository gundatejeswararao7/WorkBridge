import { supabaseAdmin } from '../config/supabase';

export const createReview = async (data: { work_id: string, reviewer_id: string, reviewee_id: string, rating: number, comment: string }) => {
  const { data: review, error: reviewError } = await supabaseAdmin
    .from('reviews')
    .insert(data)
    .select()
    .single();

  if (reviewError) throw reviewError;

  // Also update work status to completed if not already
  const { error: workError } = await supabaseAdmin
    .from('works')
    .update({ status: 'completed' })
    .eq('id', data.work_id);

  if (workError) throw workError;

  return review;
};

export const getReviewsForUser = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id(full_name, profile_photo_url),
      work:works(title)
    `)
    .eq('reviewee_id', userId);

  if (error) throw error;
  return data;
};
