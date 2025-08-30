import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const destinations = pgTable("destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  country: text("country").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
});

export const propertyTypes = pgTable("property_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
});

export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  buttonText: text("button_text").notNull(),
});

export const searchRequests = pgTable("search_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  destination: text("destination").notNull(),
  checkInDate: text("check_in_date").notNull(),
  checkOutDate: text("check_out_date").notNull(),
  adults: integer("adults").notNull().default(2),
  children: integer("children").notNull().default(0),
  rooms: integer("rooms").notNull().default(1),
  searchForFlights: text("search_for_flights").notNull().default("false"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
});

export const insertPropertyTypeSchema = createInsertSchema(propertyTypes).omit({
  id: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
});

export const insertSearchRequestSchema = createInsertSchema(searchRequests).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;
export type InsertPropertyType = z.infer<typeof insertPropertyTypeSchema>;
export type PropertyType = typeof propertyTypes.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertSearchRequest = z.infer<typeof insertSearchRequestSchema>;
export type SearchRequest = typeof searchRequests.$inferSelect;
