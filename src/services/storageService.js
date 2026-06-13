import { supabase } from './supabase';

export const uploadReviewImage = async (file) => {
  const cleanFileName =
  file.name.replace(/[^a-zA-Z0-9.]/g, '_');

const fileName =
  `${Date.now()}-${cleanFileName}`;
  const { error } = await supabase.storage
    .from('review_images')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('review_images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};