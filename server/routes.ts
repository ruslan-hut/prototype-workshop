import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchRequestSchema, type TravelOffer, type Itinerary, type SearchInput } from "@shared/schema";
import { randomUUID } from "crypto";

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
      
      const offers: TravelOffer[] = generateMockOffers(searchInput, seed);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate offers" });
    }
  });

  app.post("/ai/refine", async (req, res) => {
    try {
      const { constraints, currentOffer } = req.body;
      const refinedOffers: TravelOffer[] = generateRefinedOffers(constraints, currentOffer);
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

function generateMockOffers(searchInput: SearchInput, seed: number): TravelOffer[] {
  const destinations = searchInput.to.length > 0 ? searchInput.to : ['Барселона'];
  const basePrice = searchInput.budget.max * 0.7;
  
  return [
    {
      id: randomUUID(),
      title: `${destinations[0]}: 5 днів (економ)`,
      summary: 'Бюджетний варіант з гарним співвідношенням ціна-якість',
      price: {
        total: Math.round(basePrice * 0.8),
        perPerson: Math.round(basePrice * 0.8 / Math.max(1, searchInput.budget.perPerson ? 1 : 2)),
        currency: 'EUR'
      },
      flights: [{
        from: searchInput.from || 'KBP',
        to: destinations[0],
        dep: searchInput.dateFrom || '2024-09-15',
        ret: searchInput.dateTo || '2024-09-20',
        carrier: 'Ryanair',
        price: 120
      }],
      stay: [{
        name: 'Hotel Barcelona Center',
        stars: 3,
        area: 'Eixample',
        nights: 4,
        price: 85
      }],
      itineraryPreview: [
        { day: 1, items: ['Прибуття', 'Sagrada Familia', 'Вечеря в Готичному кварталі'] },
        { day: 2, items: ['Park Güell', 'Casa Batlló', 'Пляж Barceloneta'] }
      ],
      tags: ['бюджет', 'центр', 'культура']
    },
    {
      id: randomUUID(),
      title: `${destinations[0]}: 5 днів (комфорт)`,
      summary: 'Оптимальний баланс комфорту та вражень',
      price: {
        total: Math.round(basePrice),
        perPerson: Math.round(basePrice / Math.max(1, searchInput.budget.perPerson ? 1 : 2)),
        currency: 'EUR'
      },
      flights: [{
        from: searchInput.from || 'KBP',
        to: destinations[0],
        dep: searchInput.dateFrom || '2024-09-15',
        ret: searchInput.dateTo || '2024-09-20',
        carrier: 'Vueling',
        price: 180
      }],
      stay: [{
        name: 'Hotel Majestic',
        stars: 4,
        area: 'Passeig de Gràcia',
        nights: 4,
        price: 150
      }],
      itineraryPreview: [
        { day: 1, items: ['Прибуття', 'Sagrada Familia', 'Гастрономічний тур'] },
        { day: 2, items: ['Park Güell', 'Музей Пікассо', 'Фламенко шоу'] }
      ],
      tags: ['комфорт', 'центр', 'гастрономія']
    },
    {
      id: randomUUID(),
      title: `${destinations[0]}: 5 днів (преміум)`,
      summary: 'Розкішний відпочинок без компромісів',
      price: {
        total: Math.round(basePrice * 1.4),
        perPerson: Math.round(basePrice * 1.4 / Math.max(1, searchInput.budget.perPerson ? 1 : 2)),
        currency: 'EUR'
      },
      flights: [{
        from: searchInput.from || 'KBP',
        to: destinations[0],
        dep: searchInput.dateFrom || '2024-09-15',
        ret: searchInput.dateTo || '2024-09-20',
        carrier: 'Lufthansa',
        price: 320
      }],
      stay: [{
        name: 'Hotel Arts Barcelona',
        stars: 5,
        area: 'Port Olímpic',
        nights: 4,
        price: 300
      }],
      itineraryPreview: [
        { day: 1, items: ['Прибуття', 'Spa процедури', 'Мішеленівський ресторан'] },
        { day: 2, items: ['Приватна екскурсія по Gaudí', 'Яхт тур', 'Дегустація вин'] }
      ],
      tags: ['преміум', 'люкс', 'ексклюзив']
    }
  ];
}

function generateRefinedOffers(constraints: any, currentOffer: TravelOffer): TravelOffer[] {
  // Return modified versions of the current offer based on constraints
  return [
    {
      ...currentOffer,
      id: randomUUID(),
      title: currentOffer.title + ' (уточнено)',
      summary: 'Варіант з урахуванням ваших побажань'
    }
  ];
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
