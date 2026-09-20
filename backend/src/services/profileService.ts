import { supabaseAdmin } from '../config/supabase';
import { Profile } from '../types';

export const getProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  const { data: skillsData, error: skillsError } = await supabaseAdmin
    .from('user_skills')
    .select(`
      skill_id,
      skills (*)
    `)
    .eq('user_id', userId);

  if (skillsError) throw skillsError;

  return {
    ...profile,
    skills: skillsData.map((s: any) => s.skills),
  };
};

export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  const { data: updatedProfile, error } = await supabaseAdmin
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return updatedProfile;
};

export const getProfileById = async (profileId: string) => {
  return getProfile(profileId); // Reuse the same logic
};

export const updateUserSkills = async (userId: string, skillIds: string[]) => {
  const { error: deleteError } = await supabaseAdmin
    .from('user_skills')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  if (skillIds.length > 0) {
    const inserts = skillIds.map((skillId) => ({ user_id: userId, skill_id: skillId }));
    const { error: insertError } = await supabaseAdmin
      .from('user_skills')
      .insert(inserts);
      
    if (insertError) throw insertError;
  }
  
  return skillIds;
};

export const uploadProfilePhoto = async (userId: string, file: { buffer: Buffer, mimetype: string, originalname: string }) => {
  const path = `${userId}/${Date.now()}-${file.originalname}`;
  
  const { data, error } = await supabaseAdmin
    .storage
    .from('profile-photos')
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabaseAdmin
    .storage
    .from('profile-photos')
    .getPublicUrl(path);

  await updateProfile(userId, { profile_photo_url: publicUrlData.publicUrl });

  return publicUrlData.publicUrl;
};
