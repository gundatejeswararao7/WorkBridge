import { supabaseAdmin } from '../config/supabase';
import { Work } from '../types';

export const createWork = async (data: Partial<Work> & { creator_id: string }) => {
  const { data: work, error } = await supabaseAdmin
    .from('works')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return work;
};

export const getWorks = async (filters?: { category?: string, status?: string }) => {
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
  const { data: work, error } = await supabaseAdmin
    .from('works')
    .update(data)
    .eq('id', id)
    .eq('creator_id', userId)
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
      assignee:profiles!assigned_to(full_name, profile_photo_url)
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
      creator:profiles!creator_id(full_name, profile_photo_url)
    `)
    .eq('assigned_to', userId);

  if (error) throw error;
  return data;
};
