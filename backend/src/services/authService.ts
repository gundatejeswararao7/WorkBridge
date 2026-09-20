import { supabaseAdmin } from '../config/supabase';

export const signUp = async (email: string, password: string, fullName: string) => {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
    });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw profileError;
  }

  return authData.user;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return true;
};
