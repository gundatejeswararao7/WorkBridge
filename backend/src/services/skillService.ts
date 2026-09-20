import { supabaseAdmin } from '../config/supabase';

export const getAllSkills = async (category?: string) => {
  let query = supabaseAdmin.from('skills').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getSkillById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('skills')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};
