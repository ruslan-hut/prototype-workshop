import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchRequestSchema, type TravelOffer, type Itinerary, type SearchInput } from "@shared/schema";
import { randomUUID } from "crypto";
import { generateTravelOffers, refineOffer, buildItinerary } from "./openai-service";

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
      
      // Convert SearchInput to TravelOfferRequest format
      const request = {
        destination: searchInput.to.length > 0 ? searchInput.to[0] : 'Барселона',
        checkInDate: searchInput.dateFrom || '2024-09-15',
        checkOutDate: searchInput.dateTo || '2024-09-20', 
        adults: 2, // Default adults
        children: 0, // Default children
        rooms: 1, // Default rooms
        budget: searchInput.budget.max || 1000,
        interests: searchInput.interests || ['sightseeing', 'culture'],
        accommodationType: searchInput.stayType?.[0] || 'hotel',
        transportPreference: searchInput.transport?.[0] || 'any'
      };
      
      const aiOffers = await generateTravelOffers(request);
      
      // Convert AI response to TravelOffer format
      const offers: TravelOffer[] = aiOffers.map((offer: any) => ({
        id: offer.id || randomUUID(),
        title: offer.title,
        summary: offer.description,
        price: {
          total: offer.price,
          perPerson: Math.round(offer.price / Math.max(1, request.adults)),
          currency: 'EUR'
        },
        flights: [{
          from: searchInput.from || 'KBP',
          to: request.destination,
          dep: request.checkInDate,
          ret: request.checkOutDate,
          carrier: 'AI Generated',
          price: offer.flightPrice || Math.round(offer.price * 0.4)
        }],
        stay: [{
          name: offer.hotelName || 'Generated Hotel',
          stars: offer.hotelStars || 4,
          area: 'City Center',
          nights: Math.ceil((new Date(request.checkOutDate).getTime() - new Date(request.checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
          price: offer.hotelPrice || Math.round(offer.price * 0.6)
        }],
        itineraryPreview: [
          { day: 1, items: offer.highlights?.slice(0, 3) || ['Прибуття', 'Оглядова екскурсія'] },
          { day: 2, items: offer.highlights?.slice(1, 4) || ['Культурні памятки', 'Місцева кухня'] }
        ],
        tags: [offer.category, ...offer.highlights?.slice(0, 2) || []]
      }));
      
      res.json(offers);
    } catch (error) {
      console.error('Error generating offers:', error);
      res.status(500).json({ message: "Failed to generate offers" });
    }
  });

  app.post("/ai/refine", async (req, res) => {
    try {
      const { constraints, currentOffer } = req.body;
      
      const refinedOffer = await refineOffer({
        currentOffer,
        feedback: constraints || 'Будь ласка, покращте цю пропозицію',
        newRequirements: constraints
      });
      
      // Convert back to TravelOffer format
      const offers: TravelOffer[] = [{
        ...currentOffer,
        id: randomUUID(),
        title: refinedOffer.title || currentOffer.title + ' (уточнено)',
        summary: refinedOffer.description || refinedOffer.summary || 'Варіант з урахуванням ваших побажань',
        price: {
          total: refinedOffer.price || currentOffer.price.total,
          perPerson: Math.round((refinedOffer.price || currentOffer.price.total) / Math.max(1, 2)),
          currency: 'EUR'
        }
      }];
      
      res.json(offers);
    } catch (error) {
      console.error('Error refining offers:', error);
      res.status(500).json({ message: "Failed to refine offers" });
    }
  });

  app.post("/ai/itinerary", async (req, res) => {
    try {
      const selectedOffer: TravelOffer = req.body;
      
      const request = {
        destination: selectedOffer.flights?.[0]?.to || 'Барселона',
        checkInDate: selectedOffer.flights?.[0]?.dep || '2024-09-15',
        checkOutDate: selectedOffer.flights?.[0]?.ret || '2024-09-20',
        adults: 2,
        children: 0,
        interests: selectedOffer.tags || ['sightseeing'],
        budget: selectedOffer.price.total,
        accommodationType: 'hotel',
        selectedOffer
      };
      
      const aiItinerary = await buildItinerary(request);
      
      // Convert AI response to Itinerary format
      const itinerary: Itinerary = {
        days: aiItinerary.itinerary?.map((day: any) => ({
          date: new Date(Date.parse(request.checkInDate) + (day.day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          segments: day.activities?.map((activity: any) => ({
            type: activity.time?.includes('Flight') || activity.title?.includes('переліт') ? 'move' : 'activity',
            title: activity.title,
            time: activity.time || '10:00',
            price: activity.price || undefined
          })) || [
            { type: 'activity', title: day.title, time: '10:00' }
          ]
        })) || [
          {
            date: request.checkInDate,
            segments: [
              { type: 'activity', title: 'День заплановано ШІ', time: '10:00' }
            ]
          }
        ],
        totals: {
          price: aiItinerary.totalBudget || selectedOffer.price.total,
          currency: 'EUR'
        }
      };
      
      res.json(itinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      res.status(500).json({ message: "Failed to generate itinerary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Old mock functions removed - now using OpenAI API
