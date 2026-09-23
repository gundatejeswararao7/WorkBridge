import { supabaseAdmin } from '../config/supabase';
import { Work } from '../types';

export const createWork = async (data: Partial<Work> & { creator_id: string }) => {
  // Prevent assigning work to oneself
  if (data.assigned_to && data.assigned_to === data.creator_id) {
    throw new Error('You cannot assign work to yourself.');
  }

  // Mandatory Deadline validation
  if (!data.deadline || !data.deadline.trim()) {
    throw new Error('A deadline is mandatory for every work post.');
  }

  const deadlineDate = new Date(data.deadline);
  if (isNaN(deadlineDate.getTime())) {
    throw new Error('Invalid deadline format.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (deadlineDate < today) {
    throw new Error('Deadline cannot be in the past. Please select a valid future date.');
  }

  const { data: work, error } = await supabaseAdmin
    .from('works')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return work;
};

export const getWorks = async (filters?: { category?: string; status?: string; excludeCreatorId?: string; creator_id?: string }) => {
  let query = supabaseAdmin
    .from('works')
    .select(`
      *,
      creator:profiles!creator_id(full_name, profile_photo_url)
    `);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'open');
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.creator_id) {
    query = query.eq('creator_id', filters.creator_id);
  } else if (filters?.excludeCreatorId) {
    query = query.neq('creator_id', filters.excludeCreatorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getWorkById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('works')
    .select(`
      *,
      creator:profiles!creator_id(full_name, profile_photo_url, profession),
      assignee:profiles!assigned_to(full_name, profile_photo_url)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateWork = async (id: string, userId: string, data: Partial<Work>) => {
  // Check existing work to verify permission
  const { data: currentWork, error: fetchError } = await supabaseAdmin
    .from('works')
    .select('id, creator_id, assigned_to, deadline, status')
    .eq('id', id)
    .single();

  if (fetchError || !currentWork) throw new Error('Work not found');

  const isCreator = currentWork.creator_id === userId;
  const isAssignee = currentWork.assigned_to === userId;

  if (!isCreator && !isAssignee) {
    throw new Error('Unauthorized to update this work');
  }

  // Prevent assigning work to creator
  if (data.assigned_to && data.assigned_to === currentWork.creator_id) {
    throw new Error('You cannot assign work to yourself.');
  }

  const updatePayload = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: work, error } = await supabaseAdmin
    .from('works')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return work;
};

export const deleteWork = async (id: string, userId: string) => {
  const { error } = await supabaseAdmin
    .from('works')
    .delete()
    .eq('id', id)
    .eq('creator_id', userId);

  if (error) throw error;
  return true;
};

export const getWorksGiving = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('works')
    .select(`
      *,
      assignee:profiles!assigned_to(id, full_name, profile_photo_url)
    `)
    .eq('creator_id', userId);

  if (error) throw error;
  return data;
};

export const getWorksTaking = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('works')
    .select(`
      *,
      creator:profiles!creator_id(id, full_name, profile_photo_url)
    `)
    .eq('assigned_to', userId);

  if (error) throw error;
  return data;
};
