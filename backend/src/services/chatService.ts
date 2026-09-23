import { supabaseAdmin } from '../config/supabase';

// ─────────────────────────────────────────────────────────────
// Chat Service — manages chats and messages tables
// ─────────────────────────────────────────────────────────────

export const getOrCreateChat = async (
  workId: string,
  participantOne: string,
  participantTwo: string
): Promise<string> => {
  // Check if a chat already exists for this work
  const { data: existing } = await supabaseAdmin
    .from('chats')
    .select('id')
    .eq('work_id', workId)
    .maybeSingle();

  if (existing) return existing.id;

  // Create new chat
  const { data: created, error } = await supabaseAdmin
    .from('chats')
    .insert({ work_id: workId, participant_one: participantOne, participant_two: participantTwo })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
};

export const getChatsForUser = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('chats')
    .select(`
      id,
      work_id,
      created_at,
      work:works!work_id(id, title, status),
      participant_one_profile:profiles!participant_one(id, full_name, profile_photo_url, profession),
      participant_two_profile:profiles!participant_two(id, full_name, profile_photo_url, profession)
    `)
    .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // For each chat, get the last message
  const chatsWithLastMessage = await Promise.all(
    (data || []).map(async (chat: any) => {
      const { data: lastMsg } = await supabaseAdmin
        .from('messages')
        .select('content, file_name, file_type, created_at, sender_id')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const otherParticipant =
        chat.participant_one_profile?.id === userId
          ? chat.participant_two_profile
          : chat.participant_one_profile;

      return {
        ...chat,
        other_participant: otherParticipant,
        last_message: lastMsg,
      };
    })
  );

  return chatsWithLastMessage;
};

export const getMessages = async (chatId: string, userId: string) => {
  // Verify user is participant
  const { data: chat, error: chatError } = await supabaseAdmin
    .from('chats')
    .select('participant_one, participant_two')
    .eq('id', chatId)
    .single();

  if (chatError || !chat) throw new Error('Chat not found');
  if (chat.participant_one !== userId && chat.participant_two !== userId) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, profile_photo_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content?: string,
  fileUrl?: string,
  fileName?: string,
  fileType?: string
) => {
  // Verify participant
  const { data: chat, error: chatError } = await supabaseAdmin
    .from('chats')
    .select('participant_one, participant_two')
    .eq('id', chatId)
    .single();

  if (chatError || !chat) throw new Error('Chat not found');
  if (chat.participant_one !== senderId && chat.participant_two !== senderId) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content: content || null,
      file_url: fileUrl || null,
      file_name: fileName || null,
      file_type: fileType || null,
    })
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, profile_photo_url)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const uploadChatFile = async (
  chatId: string,
  senderId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string }
): Promise<{ url: string; name: string; type: string }> => {
  // Verify participant
  const { data: chat } = await supabaseAdmin
    .from('chats')
    .select('participant_one, participant_two')
    .eq('id', chatId)
    .single();

  if (!chat || (chat.participant_one !== senderId && chat.participant_two !== senderId)) {
    throw new Error('Unauthorized');
  }

  const fileExt = file.originalname.split('.').pop() || 'bin';
  const filePath = `${chatId}/${senderId}/${Date.now()}_${file.originalname}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('chat-files')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage
    .from('chat-files')
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    name: file.originalname,
    type: file.mimetype,
  };
};
