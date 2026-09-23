import { supabaseAdmin } from '../config/supabase';

export const createRequest = async (workId: string, requesterId: string, message: string) => {
  // Check the work opportunity and creator
  const { data: work, error: workError } = await supabaseAdmin
    .from('works')
    .select('id, creator_id, status')
    .eq('id', workId)
    .single();

  if (workError || !work) {
    throw new Error('Work opportunity not found');
  }

  // Strict rule: prevent self-request / self-application
  if (work.creator_id === requesterId) {
    throw new Error('You cannot apply to or accept your own posted work.');
  }

  if (work.status !== 'open') {
    throw new Error('This work opportunity is no longer open.');
  }

  // Check if an active request already exists from this requester
  const { data: existingReq } = await supabaseAdmin
    .from('work_requests')
    .select('id, status')
    .eq('work_id', workId)
    .eq('requester_id', requesterId)
    .neq('status', 'cancelled')
    .neq('status', 'rejected')
    .maybeSingle();

  if (existingReq) {
    throw new Error('You have already submitted a request for this work.');
  }

  const { data, error } = await supabaseAdmin
    .from('work_requests')
    .insert({ work_id: workId, requester_id: requesterId, message })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getIncomingRequests = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('work_requests')
    .select(`
      *,
      work:works!inner(id, title, creator_id),
      requester:profiles!requester_id(full_name, profile_photo_url, profession)
    `)
    .eq('work.creator_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
};

export const getOutgoingRequests = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('work_requests')
    .select(`
      *,
      work:works!inner(id, title, creator_id),
      creator:profiles!works.creator_id(full_name, profile_photo_url)
    `)
    .eq('requester_id', userId);

  if (error) throw error;
  return data;
};

export const acceptRequest = async (requestId: string, userId: string) => {
  // First get the request and check if the user is the creator of the work
  const { data: request, error: fetchError } = await supabaseAdmin
    .from('work_requests')
    .select('*, work:works!inner(creator_id)')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) throw new Error('Request not found');
  if ((request.work as any).creator_id !== userId) throw new Error('Unauthorized');

  // Prevent self-assignment
  if (request.requester_id === userId) {
    throw new Error('You cannot assign work to yourself.');
  }

  // Accept this request
  const { data: updatedReq, error: acceptError } = await supabaseAdmin
    .from('work_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select()
    .single();

  if (acceptError) throw acceptError;

  // Update work to assigned
  const { error: workError } = await supabaseAdmin
    .from('works')
    .update({ assigned_to: request.requester_id, status: 'assigned' })
    .eq('id', request.work_id);

  if (workError) throw workError;

  // Reject all other pending requests for this work
  await supabaseAdmin
    .from('work_requests')
    .update({ status: 'rejected' })
    .eq('work_id', request.work_id)
    .eq('status', 'pending')
    .neq('id', requestId);

  return updatedReq;
};

export const rejectRequest = async (requestId: string, userId: string) => {
  const { data: request, error: fetchError } = await supabaseAdmin
    .from('work_requests')
    .select('*, work:works!inner(creator_id)')
    .eq('id', requestId)
    .single();

  if (fetchError) throw fetchError;
  if ((request.work as any).creator_id !== userId) throw new Error('Unauthorized');

  const { error: rejectError } = await supabaseAdmin
    .from('work_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (rejectError) throw rejectError;
  return true;
};

export const cancelRequest = async (requestId: string, userId: string) => {
  const { error } = await supabaseAdmin
    .from('work_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('requester_id', userId);

  if (error) throw error;
  return true;
};
