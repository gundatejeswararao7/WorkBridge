import { supabaseAdmin } from '../config/supabase';

export interface UserReputation {
  delayed_work_count: number;
  completed_jobs_count: number;
  reputation_status: 'fresher' | 'reliable' | 'delayed';
  average_rating: number;
  review_count: number;
}

/**
 * Calculates dynamic reputation metrics for a single user:
 * - Delayed Work Count (+1 on late completion, -1 on on-time completion, min 0)
 * - Badges: 'delayed' (delay > 0), 'reliable' (delay == 0 && completed > 0), 'fresher' (delay == 0 && completed == 0)
 * - Average review rating and total reviews
 */
export const getUserReputation = async (userId: string): Promise<UserReputation> => {
  // 1. Fetch completed works where this user was the assigned worker
  const { data: completedWorks } = await supabaseAdmin
    .from('works')
    .select('id, deadline, updated_at, created_at')
    .eq('assigned_to', userId)
    .eq('status', 'completed')
    .order('updated_at', { ascending: true });

  const works = completedWorks || [];

  // 2. Compute delayed work count strictly following trigger rules:
  // - Starts at 0
  // - When a completed project was submitted after deadline: +1
  // - When a completed project was submitted on or before deadline: -1 (min 0)
  let delayed_work_count = 0;
  for (const work of works) {
    if (work.deadline) {
      const deadlineMs = new Date(work.deadline).getTime();
      const completionMs = new Date(work.updated_at).getTime();
      // Allow 2-minute buffer for submission/network latency
      if (completionMs > deadlineMs + 120000) {
        delayed_work_count += 1;
      } else {
        delayed_work_count = Math.max(0, delayed_work_count - 1);
      }
    } else {
      delayed_work_count = Math.max(0, delayed_work_count - 1);
    }
  }

  const completed_jobs_count = works.length;

  // 3. Determine badging status
  let reputation_status: 'fresher' | 'reliable' | 'delayed' = 'fresher';
  if (delayed_work_count > 0) {
    reputation_status = 'delayed';
  } else if (completed_jobs_count > 0) {
    reputation_status = 'reliable';
  } else {
    reputation_status = 'fresher';
  }

  // 4. Fetch reviews for reviewee
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId);

  const reviewList = reviews || [];
  const review_count = reviewList.length;
  const average_rating = review_count > 0
    ? Number((reviewList.reduce((acc, r) => acc + r.rating, 0) / review_count).toFixed(1))
    : 0;

  return {
    delayed_work_count,
    completed_jobs_count,
    reputation_status,
    average_rating,
    review_count,
  };
};

/**
 * Efficiently batch-attaches reputation metrics to a list of candidate profiles.
 * Executes in 2 batched queries instead of N+1 individual queries.
 */
export const batchAttachReputation = async (profiles: any[]): Promise<any[]> => {
  if (!profiles || profiles.length === 0) return [];
  const userIds = profiles.map((p) => p.id);

  // Fetch completed works for all users in one batch
  const { data: allWorks } = await supabaseAdmin
    .from('works')
    .select('id, assigned_to, deadline, updated_at')
    .in('assigned_to', userIds)
    .eq('status', 'completed')
    .order('updated_at', { ascending: true });

  // Fetch all reviews for all users in one batch
  const { data: allReviews } = await supabaseAdmin
    .from('reviews')
    .select('reviewee_id, rating')
    .in('reviewee_id', userIds);

  const worksByUser: Record<string, any[]> = {};
  for (const w of allWorks || []) {
    if (w.assigned_to) {
      if (!worksByUser[w.assigned_to]) worksByUser[w.assigned_to] = [];
      worksByUser[w.assigned_to].push(w);
    }
  }

  const reviewsByUser: Record<string, any[]> = {};
  for (const r of allReviews || []) {
    if (r.reviewee_id) {
      if (!reviewsByUser[r.reviewee_id]) reviewsByUser[r.reviewee_id] = [];
      reviewsByUser[r.reviewee_id].push(r);
    }
  }

  return profiles.map((profile) => {
    const userWorks = worksByUser[profile.id] || [];
    let delayed_work_count = 0;
    for (const work of userWorks) {
      if (work.deadline) {
        const deadlineMs = new Date(work.deadline).getTime();
        const completionMs = new Date(work.updated_at).getTime();
        if (completionMs > deadlineMs + 120000) {
          delayed_work_count += 1;
        } else {
          delayed_work_count = Math.max(0, delayed_work_count - 1);
        }
      } else {
        delayed_work_count = Math.max(0, delayed_work_count - 1);
      }
    }

    const completed_jobs_count = userWorks.length;
    let reputation_status: 'fresher' | 'reliable' | 'delayed' = 'fresher';
    if (delayed_work_count > 0) {
      reputation_status = 'delayed';
    } else if (completed_jobs_count > 0) {
      reputation_status = 'reliable';
    } else {
      reputation_status = 'fresher';
    }

    const userReviews = reviewsByUser[profile.id] || [];
    const review_count = userReviews.length;
    const average_rating = review_count > 0
      ? Number((userReviews.reduce((acc, r) => acc + r.rating, 0) / review_count).toFixed(1))
      : 0;

    return {
      ...profile,
      delayed_work_count,
      completed_jobs_count,
      reputation_status,
      average_rating,
      review_count,
    };
  });
};
