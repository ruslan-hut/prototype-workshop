import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchRequestSchema, type TravelOffer, type Itinerary, type SearchInput } from "@shared/schema";
import { randomUUID } from "crypto";
import { describeDestination } from "./ai/destination";
import { searchHotels, getCityCode } from "./ai/hotels";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all destinations
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  // Get all property types
  app.get("/api/property-types", async (req, res) => {
    try {
      const propertyTypes = await storage.getPropertyTypes();
      res.json(propertyTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property types" });
    }
  });

  // Get all offers
  app.get("/api/offers", async (req, res) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Submit search request
  app.post("/api/search", async (req, res) => {
    try {
      const validatedData = insertSearchRequestSchema.parse(req.body);
      const searchRequest = await storage.createSearchRequest(validatedData);
      res.json({ 
        message: "Search request submitted successfully",
        searchId: searchRequest.id 
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ message: "Invalid search parameters" });
      } else {
        res.status(500).json({ message: "Failed to process search request" });
      }
    }
  });

  // AI Travel Assistant Endpoints
  app.post("/ai/generate_offers", async (req, res) => {
    try {
      const searchInput: SearchInput = req.body;
      
      // Generate deterministic seed for consistent results
      const seed = JSON.stringify(searchInput).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const offers: TravelOffer[] = await generateMockOffers(searchInput, seed);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate offers" });
    }
  });

  app.post("/ai/refine", async (req, res) => {
    try {
      const { constraints, currentOffer } = req.body;
      const refinedOffers: TravelOffer[] = await generateRefinedOffers(constraints, currentOffer);
      res.json(refinedOffers);
    } catch (error) {
      res.status(500).json({ message: "Failed to refine offers" });
    }
  });

  app.post("/ai/itinerary", async (req, res) => {
    try {
      const selectedOffer: TravelOffer = req.body;
      const itinerary: Itinerary = generateMockItinerary(selectedOffer);
      res.json(itinerary);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate itinerary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateMockOffers(searchInput: SearchInput, seed: number): Promise<TravelOffer[]> {
  const destinations = searchInput.to.length > 0 ? searchInput.to : ['Барселона'];
  const checkInDate = searchInput.dateFrom || '2024-09-15';
  const checkOutDate = searchInput.dateTo || '2024-09-20';
  const nights = Math.max(1, new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24);
  
  // Determine season from date
  const season = getSeasonFromDate(searchInput.dateFrom || undefined);
  
  // Get real hotel data for the destination
  const cityCode = getCityCode(destinations[0]);
  const hotels = await searchHotels({
    cityCode,
    checkInDate,
    checkOutDate,
    adults: searchInput.travelers?.adults || 2,
    children: searchInput.travelers?.children || 0,
    roomQuantity: 1,
    currency: 'EUR'
  });

  // Create offers using real hotel data
  const baseOffers: TravelOffer[] = hotels.slice(0, 3).map((hotel, index) => {
    const budgetMultipliers = [0.8, 1.0, 1.4]; // budget, comfort, premium
    const tierNames = ['економ', 'комфорт', 'преміум'];
    const carriers = ['Ryanair', 'Vueling', 'Lufthansa'];
    const flightPrices = [120, 180, 320];
    const tags = [
      ['бюджет', 'центр', 'культура'],
      ['комфорт', 'центр', 'гастрономія'],
      ['преміум', 'люкс', 'ексклюзив']
    ];

    const flightPrice = flightPrices[index];
    const totalPrice = hotel.price.total + flightPrice;

    return {
      id: randomUUID(),
      title: `${destinations[0]}: ${nights} днів (${tierNames[index]})`,
      summary: index === 0 ? 'Бюджетний варіант з гарним співвідношенням ціна-якість' :
               index === 1 ? 'Оптимальний баланс комфорту та вражень' :
               'Розкішний відпочинок без компромісів',
      price: {
        total: totalPrice,
        perPerson: Math.round(totalPrice / Math.max(1, searchInput.travelers?.adults || 2)),
        currency: 'EUR'
      },
      flights: [{
        from: searchInput.from || 'KBP',
        to: destinations[0],
        dep: checkInDate,
        ret: checkOutDate,
        carrier: carriers[index],
        price: flightPrice
      }],
      stay: [{
        name: hotel.name,
        stars: Math.round(hotel.rating || 4),
        area: hotel.location.address,
        nights: Math.round(nights),
        price: hotel.price.perNight,
        photos: hotel.photos,
        description: hotel.description,
        amenities: hotel.amenities,
        rating: hotel.rating,
        roomType: hotel.roomType,
        boardType: hotel.boardType,
        cancellation: hotel.cancellation
      }],
      itineraryPreview: [
        { day: 1, items: ['Прибуття', 'Sagrada Familia', index === 0 ? 'Вечеря в Готичному кварталі' : index === 1 ? 'Гастрономічний тур' : 'Мішеленівський ресторан'] },
        { day: 2, items: ['Park Güell', index === 0 ? 'Casa Batlló' : index === 1 ? 'Музей Пікассо' : 'Приватна екскурсія по Gaudí', index === 0 ? 'Пляж Barceloneta' : index === 1 ? 'Фламенко шоу' : 'Яхт тур'] }
      ],
      tags: tags[index]
    };
  });

  // Add AI-generated destination summaries to each offer
  const enrichedOffers = await Promise.all(
    baseOffers.map(async (offer) => {
      try {
        const destinationSummary = await describeDestination({
          city: destinations[0],
          season,
          currency: 'EUR',
          budgetHint: offer.tags?.includes('преміум') ? 'luxury' : 
                     offer.tags?.includes('бюджет') ? 'budget' : 'mid-range',
          travelers: `${searchInput.travelers?.adults || 2} adults${searchInput.travelers?.children ? `, ${searchInput.travelers.children} children` : ''}`,
          interests: searchInput.preferences?.interests || ['culture', 'food'],
          pace: searchInput.preferences?.pace || 'balanced',
          locale: 'uk-UA'
        });
        
        return {
          ...offer,
          destinationSummary
        };
      } catch (error) {
        // If AI fails, return offer without destination summary
        return offer;
      }
    })
  );

  return enrichedOffers;
}

async function generateRefinedOffers(constraints: any, currentOffer: TravelOffer): Promise<TravelOffer[]> {
  // Return modified versions of the current offer based on constraints
  const refinedOffer = {
    ...currentOffer,
    id: randomUUID(),
    title: currentOffer.title + ' (уточнено)',
    summary: 'Варіант з урахуванням ваших побажань'
  };

  // If the original offer doesn't have a destination summary, try to generate one
  if (!currentOffer.destinationSummary) {
    try {
      const destinationName = currentOffer.title.split(':')[0];
      const destinationSummary = await describeDestination({
        city: destinationName,
        season: 'spring',
        currency: 'EUR',
        budgetHint: 'mid-range',
        travelers: '2 adults',
        interests: ['culture', 'food'],
        pace: 'balanced',
        locale: 'uk-UA'
      });
      
      refinedOffer.destinationSummary = destinationSummary;
    } catch (error) {
      // Continue without destination summary if AI fails
    }
  }

  return [refinedOffer];
}

function getSeasonFromDate(dateString?: string): string {
  if (!dateString) return 'spring';
  
  const date = new Date(dateString);
  const month = date.getMonth(); // 0-indexed
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function generateMockItinerary(selectedOffer: TravelOffer): Itinerary {
  return {
    days: [
      {
        date: '2024-09-15',
        segments: [
          { type: 'move', title: 'Переліт до Барселони', time: '09:00', price: 320 },
          { type: 'activity', title: 'Заїзд в готель', time: '14:00' },
          { type: 'activity', title: 'Прогулянка Готичним кварталом', time: '16:00' },
          { type: 'activity', title: 'Вечеря в традиційній тапас-барі', time: '20:00', price: 35 }
        ]
      },
      {
        date: '2024-09-16',
        segments: [
          { type: 'activity', title: 'Відвідування Sagrada Familia', time: '10:00', price: 26 },
          { type: 'activity', title: 'Обід', time: '13:00', price: 20 },
          { type: 'activity', title: 'Park Güell', time: '15:00', price: 10 },
          { type: 'rest', title: 'Відпочинок в готелі', time: '18:00' }
        ]
      },
      {
        date: '2024-09-17',
        segments: [
          { type: 'activity', title: 'Casa Batlló та Casa Milà', time: '10:00', price: 50 },
          { type: 'activity', title: 'Шопінг на Passeig de Gràcia', time: '14:00' },
          { type: 'activity', title: 'Пляж Barceloneta', time: '16:00' },
          { type: 'activity', title: 'Ужин з видом на море', time: '20:00', price: 45 }
        ]
      },
      {
        date: '2024-09-18',
        segments: [
          { type: 'activity', title: 'Музей Пікассо', time: '10:00', price: 14 },
          { type: 'activity', title: 'Прогулянка по Борн кварталу', time: '12:00' },
          { type: 'activity', title: 'Канатна дорога на Монжуїк', time: '15:00', price: 12 },
          { type: 'activity', title: 'Фламенко шоу', time: '21:00', price: 40 }
        ]
      },
      {
        date: '2024-09-19',
        segments: [
          { type: 'activity', title: 'Останні покупки', time: '10:00' },
          { type: 'move', title: 'Трансфер в аеропорт', time: '12:00', price: 25 },
          { type: 'move', title: 'Переліт додому', time: '15:00' }
        ]
      }
    ],
    totals: {
      price: selectedOffer.price.total,
      currency: 'EUR'
    }
  };
}
