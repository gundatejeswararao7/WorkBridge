import { supabaseAdmin } from '../config/supabase';
import { getUserReputation } from './reputationService';

export const createReview = async (data: {
  work_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
}) => {
  if (data.reviewer_id === data.reviewee_id) {
    throw new Error('You cannot review yourself.');
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5 stars.');
  }

  // Check if review already exists for this work by this reviewer
  const { data: existingReview } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('work_id', data.work_id)
    .eq('reviewer_id', data.reviewer_id)
    .maybeSingle();

  let review: any;
  if (existingReview) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({
        rating: data.rating,
        comment: data.comment || '',
      })
      .eq('id', existingReview.id)
      .select()
      .single();

    if (updateError) throw updateError;
    review = updated;
  } else {
    const { data: inserted, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        work_id: data.work_id,
        reviewer_id: data.reviewer_id,
        reviewee_id: data.reviewee_id,
        rating: data.rating,
        comment: data.comment || '',
      })
      .select()
      .single();

    if (reviewError) throw reviewError;
    review = inserted;
  }

  // Ensure work is marked completed with timestamp
  await supabaseAdmin
    .from('works')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', data.work_id);

  // Fetch updated reputation metrics for reviewee
  const updatedReputation = await getUserReputation(data.reviewee_id).catch(() => null);

  return { review, updatedReputation };
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
