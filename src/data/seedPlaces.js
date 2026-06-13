const cities = [
  "Ahmedabad",
  "Vadodara",
  "Surat",
  "Anand",
  "Udaipur",
  "Jaipur",
  "Mumbai",
  "Pune",
]

const createPlaces = (type, names, count) => {
  const places = []

  for (let i = 0; i < count; i++) {
    const city = cities[i % cities.length]

    places.push({
      name: `${names[i % names.length]} ${city}`,
      type,
      description: `${type} facility near major highway route in ${city}.`,
      distance_from_route: Number((Math.random() * 2).toFixed(1)),
      rating: Number((4 + Math.random()).toFixed(1)),
      total_reviews: Math.floor(Math.random() * 500) + 20,
      latitude: Number((20 + Math.random() * 8).toFixed(6)),
      longitude: Number((72 + Math.random() * 5).toFixed(6)),
    })
  }

  return places
}

const washrooms = createPlaces(
  "washroom",
  [
    "Swachh Toilet",
    "CleanStop",
    "Highway Comfort Toilet",
    "TravelEase Washroom",
    "Express Toilet Hub",
  ],
  15
)

const fuelStations = createPlaces(
  "fuel",
  [
    "Indian Oil",
    "HP Fuel Hub",
    "Bharat Petroleum",
    "Reliance Fuel Point",
    "Highway Fuel Station",
  ],
  15
)

const restaurants = createPlaces(
  "restaurant",
  [
    "Highway King Dhaba",
    "Gujarat Spice Stop",
    "Shree Krishna Restaurant",
    "Traveler's Kitchen",
    "Family Food Plaza",
  ],
  15
)

const restStops = createPlaces(
  "rest_stop",
  [
    "NH48 Traveler Plaza",
    "Safe Night Stop",
    "Expressway Rest Zone",
    "Highway Relax Point",
    "Journey Break Hub",
  ],
  15
)

export const seedPlaces = [
  ...washrooms,
  ...fuelStations,
  ...restaurants,
  ...restStops,
]