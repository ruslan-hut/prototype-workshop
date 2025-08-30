// @ts-ignore - Amadeus types not available
import Amadeus from 'amadeus';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

type HotelSearchParams = {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  roomQuantity?: number;
  radius?: number;
  radiusUnit?: string;
  currency?: string;
};

type AmadeusHotel = {
  chainCode?: string;
  iataCode: string;
  dupeId: number;
  name: string;
  hotelId: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    countryCode: string;
  };
  lastUpdate: string;
};

type AmadeusOffer = {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  roomQuantity: number;
  rateCode: string;
  rateFamilyEstimated: {
    code: string;
    type: string;
  };
  category: string;
  description: {
    text: string;
    lang: string;
  };
  commission: {
    percentage: string;
  };
  boardType: string;
  room: {
    type: string;
    typeEstimated: {
      category: string;
      beds: number;
      bedType: string;
    };
    description: {
      text: string;
      lang: string;
    };
  };
  guests: {
    adults: number;
    childAges?: number[];
  };
  price: {
    currency: string;
    base: string;
    total: string;
    variations: {
      average: {
        base: string;
      };
      changes: Array<{
        startDate: string;
        endDate: string;
        base: string;
      }>;
    };
  };
  policies: {
    paymentType: string;
    cancellation: {
      type: string;
      amount: string;
      deadline: string;
    };
  };
  self: string;
};

type HotelSearchResult = {
  id: string;
  name: string;
  description: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating?: number;
  amenities: string[];
  price: {
    total: number;
    currency: string;
    perNight: number;
  };
  roomType: string;
  boardType: string;
  cancellation: string;
};

const memoryCache = new Map<string, { data: HotelSearchResult[]; ts: number }>();
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCacheKey(params: HotelSearchParams): string {
  return [
    params.cityCode,
    params.checkInDate,
    params.checkOutDate,
    params.adults,
    params.children || 0,
    params.roomQuantity || 1
  ].join('|');
}

// Fallback hotel data when API fails
function generateFallbackHotels(cityCode: string, params: HotelSearchParams): HotelSearchResult[] {
  const basePrice = 120;
  const nights = Math.max(1, new Date(params.checkOutDate).getTime() - new Date(params.checkInDate).getTime()) / (1000 * 60 * 60 * 24);
  
  return [
    {
      id: `fallback-${cityCode}-1`,
      name: `Central Hotel ${cityCode}`,
      description: 'A comfortable hotel in the city center with modern amenities and excellent service.',
      photos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
      ],
      location: {
        latitude: 41.3851,
        longitude: 2.1734,
        address: `City Center, ${cityCode}`
      },
      rating: 4.2,
      amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Bar', 'Fitness Center'],
      price: {
        total: Math.round(basePrice * nights),
        currency: params.currency || 'EUR',
        perNight: basePrice
      },
      roomType: 'Standard Double Room',
      boardType: 'Room Only',
      cancellation: 'Free cancellation until 24h before check-in'
    },
    {
      id: `fallback-${cityCode}-2`,
      name: `Boutique Hotel ${cityCode}`,
      description: 'A stylish boutique hotel with unique design and personalized service in a prime location.',
      photos: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'
      ],
      location: {
        latitude: 41.3851,
        longitude: 2.1734,
        address: `Historic District, ${cityCode}`
      },
      rating: 4.5,
      amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Concierge'],
      price: {
        total: Math.round(basePrice * 1.5 * nights),
        currency: params.currency || 'EUR',
        perNight: Math.round(basePrice * 1.5)
      },
      roomType: 'Superior Room',
      boardType: 'Breakfast Included',
      cancellation: 'Free cancellation until 48h before check-in'
    },
    {
      id: `fallback-${cityCode}-3`,
      name: `Luxury Resort ${cityCode}`,
      description: 'A premium resort offering exceptional comfort and world-class facilities for an unforgettable stay.',
      photos: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
      ],
      location: {
        latitude: 41.3851,
        longitude: 2.1734,
        address: `Premium Area, ${cityCode}`
      },
      rating: 4.8,
      amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Pool', 'Gym', 'Room Service'],
      price: {
        total: Math.round(basePrice * 2.5 * nights),
        currency: params.currency || 'EUR',
        perNight: Math.round(basePrice * 2.5)
      },
      roomType: 'Deluxe Suite',
      boardType: 'Half Board',
      cancellation: 'Non-refundable'
    }
  ];
}

export async function searchHotels(params: HotelSearchParams): Promise<HotelSearchResult[]> {
  const cacheKey = getCacheKey(params);
  const now = Date.now();
  
  // Check cache first
  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.ts < TTL_MS) {
    return cached.data;
  }

  // If no API credentials, return fallback data
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    const fallbackData = generateFallbackHotels(params.cityCode, params);
    memoryCache.set(cacheKey, { data: fallbackData, ts: now });
    return fallbackData;
  }

  try {
    // Search for hotels by city
    const hotelSearch = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: params.cityCode,
      radius: params.radius || 20,
      radiusUnit: params.radiusUnit || 'KM'
    });

    if (!hotelSearch.data || hotelSearch.data.length === 0) {
      const fallbackData = generateFallbackHotels(params.cityCode, params);
      memoryCache.set(cacheKey, { data: fallbackData, ts: now });
      return fallbackData;
    }

    // Get hotel offers for found hotels (limit to first 10 hotels for performance)
    const hotelIds = hotelSearch.data.slice(0, 10).map((hotel: AmadeusHotel) => hotel.hotelId);
    
    const hotelOffers = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
      children: params.children || 0,
      roomQuantity: params.roomQuantity || 1,
      currency: params.currency || 'EUR'
    });

    if (!hotelOffers.data || hotelOffers.data.length === 0) {
      const fallbackData = generateFallbackHotels(params.cityCode, params);
      memoryCache.set(cacheKey, { data: fallbackData, ts: now });
      return fallbackData;
    }

    // Transform Amadeus data to our format
    const results: HotelSearchResult[] = hotelOffers.data.map((hotelData: any) => {
      const hotel = hotelData.hotel;
      const offer = hotelData.offers[0]; // Take first offer
      
      // Generate sample hotel photos (Amadeus doesn't provide photos in basic tier)
      const hotelPhotos = [
        `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop`
      ];

      const nights = Math.max(1, new Date(params.checkOutDate).getTime() - new Date(params.checkInDate).getTime()) / (1000 * 60 * 60 * 24);
      
      return {
        id: hotel.hotelId,
        name: hotel.name,
        description: offer.room?.description?.text || `A comfortable stay at ${hotel.name} with modern amenities and excellent service.`,
        photos: hotelPhotos,
        location: {
          latitude: hotel.geoCode?.latitude || 0,
          longitude: hotel.geoCode?.longitude || 0,
          address: hotel.address?.lines?.join(', ') || `${hotel.address?.cityName || params.cityCode}, ${hotel.address?.countryCode || ''}`
        },
        rating: Math.round((Math.random() * 2 + 3.5) * 10) / 10, // Random rating 3.5-5.0
        amenities: generateAmenities(hotel.name, offer.category),
        price: {
          total: parseFloat(offer.price.total),
          currency: offer.price.currency,
          perNight: Math.round(parseFloat(offer.price.total) / nights)
        },
        roomType: offer.room?.typeEstimated?.category || offer.room?.type || 'Standard Room',
        boardType: offer.boardType || 'Room Only',
        cancellation: offer.policies?.cancellation?.type === 'FULL_STAY' ? 'Non-refundable' : 'Free cancellation'
      };
    });

    memoryCache.set(cacheKey, { data: results, ts: now });
    return results;

  } catch (error) {
    console.error('Amadeus API error:', error);
    
    // Return fallback data on API failure
    const fallbackData = generateFallbackHotels(params.cityCode, params);
    memoryCache.set(cacheKey, { data: fallbackData, ts: now });
    return fallbackData;
  }
}

function generateAmenities(hotelName: string, category: string): string[] {
  const baseAmenities = ['WiFi', 'Air Conditioning'];
  const categoryAmenities: Record<string, string[]> = {
    'LUXURY': ['Restaurant', 'Spa', 'Pool', 'Gym', 'Room Service', 'Concierge', 'Valet Parking'],
    'PREMIUM': ['Restaurant', 'Bar', 'Fitness Center', 'Business Center', 'Room Service'],
    'STANDARD': ['Restaurant', 'Bar', 'Fitness Center'],
    'BUDGET': ['Reception 24h']
  };

  const additionalAmenities = categoryAmenities[category?.toUpperCase()] || categoryAmenities['STANDARD'];
  return [...baseAmenities, ...additionalAmenities];
}

// Convert city name to IATA city code (simplified mapping)
export function getCityCode(cityName: string): string {
  const cityCodeMap: Record<string, string> = {
    'барселона': 'BCN',
    'barcelona': 'BCN',
    'париж': 'PAR',
    'paris': 'PAR',
    'рим': 'ROM',
    'rome': 'ROM',
    'madrid': 'MAD',
    'мадрид': 'MAD',
    'лондон': 'LON',
    'london': 'LON',
    'амстердам': 'AMS',
    'amsterdam': 'AMS',
    'берлін': 'BER',
    'berlin': 'BER',
    'милан': 'MIL',
    'milan': 'MIL',
    'new york': 'NYC',
    'нью-йорк': 'NYC',
    'tokyo': 'TYO',
    'токіо': 'TYO'
  };

  return cityCodeMap[cityName.toLowerCase()] || 'BCN'; // Default to Barcelona
}