import { supabase } from './supabase'

export const getPlacesByType = async (type) => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('type', type)

  if (error) {
    console.error(error)
    return []
  }

  return data
}