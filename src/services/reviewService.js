import { supabase } from './supabase';

export const getReviewsByPlaceId = async (placeId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};

export const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([reviewData]);

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};