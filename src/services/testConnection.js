import { supabase } from './supabase'

export const testConnection = async () => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .limit(1)

  console.log('DATA:', data)
  console.log('ERROR:', error)
}