import { supabase } from './supabase'
import { seedPlaces } from '../data/seedPlaces'



console.log(seedPlaces.length)

export const seedData = async () => {
  const { data: existingPlaces, error: fetchError } = await supabase
    .from('places')
    .select('id')

  if (fetchError) {
    console.error('Error checking existing places:', fetchError)
    return
  }

  if (existingPlaces.length > 0) {
    console.log('Places already seeded')
    return
  }

  const { data, error } = await supabase
    .from('places')
    .insert(seedPlaces)

  if (error) {
    console.error('Insert error:', error)
  } else {
    console.log('Seed successful!', data)
  }
}