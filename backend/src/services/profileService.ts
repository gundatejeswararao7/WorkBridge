import { supabaseAdmin } from '../config/supabase';
import { getUserReputation } from './reputationService';
import { Profile } from '../types';

export const getProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw profileError;

  // If profile row doesn't exist yet, initialize one gracefully
  if (!profile) {
    let email = '';
    let fullName = '';
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      email = userData?.user?.email || '';
      fullName = userData?.user?.user_metadata?.full_name || '';
    } catch {
      // ignore
    }

    const defaultProfile = {
      id: userId,
      email: email,
      full_name: fullName,
      about: '',
      profession: '',
      location: '',
      latitude: null,
      longitude: null,
      experience: '',
      availability: 'available' as const,
      category: 'both' as const,
      profile_photo_url: '',
      work_can_provide: '',
      work_interested_in: '',
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('profiles')
      .upsert(defaultProfile)
      .select()
      .single();

    if (!insertError && inserted) {
      return { ...inserted, skills: [] };
    }
    return { ...defaultProfile, skills: [] };
  }

  const { data: skillsData, error: skillsError } = await supabaseAdmin
    .from('user_skills')
    .select(`
      skill_id,
      skills (*)
    `)
    .eq('user_id', userId);

  if (skillsError) throw skillsError;

  const reputation = await getUserReputation(userId).catch(() => ({
    delayed_work_count: 0,
    completed_jobs_count: 0,
    reputation_status: 'fresher' as const,
    average_rating: 0,
    review_count: 0,
  }));

  return {
    ...profile,
    skills: (skillsData || []).map((s: any) => s.skills).filter(Boolean),
    ...reputation,
  };
};

export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  // Strip virtual or non-column fields like 'skills'
  const { skills, ...cleanData } = data as any;

  const { data: updatedProfile, error } = await supabaseAdmin
    .from('profiles')
    .update(cleanData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return updatedProfile;
};

export const getProfileById = async (profileId: string) => {
  return getProfile(profileId);
};

export const updateUserSkills = async (userId: string, skillIds: string[]) => {
  const { error: deleteError } = await supabaseAdmin
    .from('user_skills')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  if (skillIds && skillIds.length > 0) {
    const inserts = skillIds.map((skillId) => ({ user_id: userId, skill_id: skillId }));
    const { error: insertError } = await supabaseAdmin
      .from('user_skills')
      .insert(inserts);
      
    if (insertError) throw insertError;
  }

  return { success: true };
};

export const uploadProfilePhoto = async (
  userId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string }
) => {
  const fileExt = file.originalname.split('.').pop() || 'jpg';
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('profile-photos')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage
    .from('profile-photos')
    .getPublicUrl(filePath);

  await supabaseAdmin
    .from('profiles')
    .update({ profile_photo_url: data.publicUrl })
    .eq('id', userId);

  return data.publicUrl;
};
