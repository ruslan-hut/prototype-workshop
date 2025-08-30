import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchRequestSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
