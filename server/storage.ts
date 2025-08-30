import { type User, type InsertUser, type Destination, type InsertDestination, type PropertyType, type InsertPropertyType, type Offer, type InsertOffer, type SearchRequest, type InsertSearchRequest } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDestinations(): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  getPropertyTypes(): Promise<PropertyType[]>;
  createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType>;
  getOffers(): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  createSearchRequest(searchRequest: InsertSearchRequest): Promise<SearchRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private destinations: Map<string, Destination>;
  private propertyTypes: Map<string, PropertyType>;
  private offers: Map<string, Offer>;
  private searchRequests: Map<string, SearchRequest>;

  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.propertyTypes = new Map();
    this.offers = new Map();
    this.searchRequests = new Map();
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Initialize destinations
    const destinations: InsertDestination[] = [
      {
        name: "Barcelona",
        country: "Spain",
        imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        description: "Beautiful Mediterranean city with stunning architecture"
      },
      {
        name: "Madrid",
        country: "Spain",
        imageUrl: "https://images.unsplash.com/photo-1543785734-4b6e564642f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        description: "Spain's vibrant capital with rich history and culture"
      },
      {
        name: "Paris",
        country: "France",
        imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        description: "The City of Light with iconic landmarks"
      },
      {
        name: "London",
        country: "United Kingdom",
        imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        description: "Historic British capital with royal heritage"
      },
      {
        name: "Rome",
        country: "Italy",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        description: "The Eternal City with ancient Roman history"
      },
      {
        name: "Amsterdam",
        country: "Netherlands",
        imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        description: "Charming Dutch city with beautiful canals"
      }
    ];

    destinations.forEach(destination => {
      this.createDestination(destination);
    });

    // Initialize property types
    const propertyTypes: InsertPropertyType[] = [
      {
        name: "Hotels",
        imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Luxury hotel accommodations"
      },
      {
        name: "Apartments",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Modern apartment living"
      },
      {
        name: "Resorts",
        imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Tropical resort experiences"
      },
      {
        name: "Villas",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Private villa accommodations"
      }
    ];

    propertyTypes.forEach(propertyType => {
      this.createPropertyType(propertyType);
    });

    // Initialize offers
    const offers: InsertOffer[] = [
      {
        title: "Live the dream in a vacation home",
        description: "Choose from houses, villas, cabins, and more",
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        category: "Vacation rentals",
        buttonText: "Book yours"
      },
      {
        title: "Quick escape, quality time",
        description: "Save up to 20% with a Getaway Deal",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        category: "Getaway Deals",
        buttonText: "Save on stays"
      }
    ];

    offers.forEach(offer => {
      this.createOffer(offer);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = randomUUID();
    const destination: Destination = { 
      ...insertDestination, 
      id,
      description: insertDestination.description || null 
    };
    this.destinations.set(id, destination);
    return destination;
  }

  async getPropertyTypes(): Promise<PropertyType[]> {
    return Array.from(this.propertyTypes.values());
  }

  async createPropertyType(insertPropertyType: InsertPropertyType): Promise<PropertyType> {
    const id = randomUUID();
    const propertyType: PropertyType = { 
      ...insertPropertyType, 
      id,
      description: insertPropertyType.description || null 
    };
    this.propertyTypes.set(id, propertyType);
    return propertyType;
  }

  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = randomUUID();
    const offer: Offer = { ...insertOffer, id };
    this.offers.set(id, offer);
    return offer;
  }

  async createSearchRequest(insertSearchRequest: InsertSearchRequest): Promise<SearchRequest> {
    const id = randomUUID();
    const searchRequest: SearchRequest = { 
      ...insertSearchRequest, 
      id,
      adults: insertSearchRequest.adults || 2,
      children: insertSearchRequest.children || 0,
      rooms: insertSearchRequest.rooms || 1,
      searchForFlights: insertSearchRequest.searchForFlights || 'false'
    };
    this.searchRequests.set(id, searchRequest);
    return searchRequest;
  }
}

export const storage = new MemStorage();
