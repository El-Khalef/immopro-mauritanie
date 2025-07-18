import {
  users,
  properties,
  favorites,
  contactRequests,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Favorite,
  type InsertFavorite,
  type ContactRequest,
  type InsertContactRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Property operations
  getProperties(filters?: {
    type?: string;
    propertyType?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minSurface?: number;
    maxSurface?: number;
    rooms?: number;
    limit?: number;
    offset?: number;
  }): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;

  // Favorites operations
  getUserFavorites(userId: string): Promise<(Favorite & { property: Property })[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, propertyId: number): Promise<void>;
  isFavorite(userId: string, propertyId: number): Promise<boolean>;

  // Contact requests operations
  getContactRequests(propertyId?: number): Promise<(ContactRequest & { property: Property })[]>;
  createContactRequest(request: InsertContactRequest): Promise<ContactRequest>;
  updateContactRequestStatus(id: number, status: string): Promise<ContactRequest>;

  // Stats for admin dashboard
  getStats(): Promise<{
    totalProperties: number;
    activeUsers: number;
    monthlyVisits: number;
    monthlyRevenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async getProperties(filters?: {
    type?: string;
    propertyType?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minSurface?: number;
    maxSurface?: number;
    rooms?: number;
    limit?: number;
    offset?: number;
  }): Promise<Property[]> {
    let query = db.select().from(properties);
    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(properties.type, filters.type));
    }
    if (filters?.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters?.city) {
      conditions.push(ilike(properties.city, `%${filters.city}%`));
    }
    if (filters?.minPrice) {
      conditions.push(gte(properties.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice.toString()));
    }
    if (filters?.minSurface) {
      conditions.push(gte(properties.surface, filters.minSurface));
    }
    if (filters?.maxSurface) {
      conditions.push(lte(properties.surface, filters.maxSurface));
    }
    if (filters?.rooms) {
      conditions.push(eq(properties.rooms, filters.rooms));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(properties.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values(property)
      .returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async getFeaturedProperties(limit = 6): Promise<Property[]> {
    // Option 1: Propriétés les plus récentes disponibles
    return await db
      .select()
      .from(properties)
      .where(eq(properties.status, "available"))
      .orderBy(desc(properties.createdAt))
      .limit(limit);
      
    // Option 2: Pour sélectionner des propriétés spécifiques en vedette,
    // ajouter un champ 'featured' à la table et utiliser :
    // .where(and(eq(properties.status, "available"), eq(properties.featured, true)))
  }

  // Favorites operations
  async getUserFavorites(userId: string): Promise<(Favorite & { property: Property })[]> {
    return await db
      .select()
      .from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, propertyId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
  }

  async isFavorite(userId: string, propertyId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
    return !!favorite;
  }

  // Contact requests operations
  async getContactRequests(propertyId?: number): Promise<(ContactRequest & { property: Property })[]> {
    let query = db
      .select()
      .from(contactRequests)
      .innerJoin(properties, eq(contactRequests.propertyId, properties.id));

    if (propertyId) {
      query = query.where(eq(contactRequests.propertyId, propertyId));
    }

    return await query.orderBy(desc(contactRequests.createdAt));
  }

  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const [newRequest] = await db
      .insert(contactRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateContactRequestStatus(id: number, status: string): Promise<ContactRequest> {
    const [updatedRequest] = await db
      .update(contactRequests)
      .set({ status })
      .where(eq(contactRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Stats for admin dashboard
  async getStats(): Promise<{
    totalProperties: number;
    activeUsers: number;
    monthlyVisits: number;
    monthlyRevenue: string;
  }> {
    const totalPropertiesResult = await db
      .select({ count: properties.id })
      .from(properties);
    
    const activeUsersResult = await db
      .select({ count: users.id })
      .from(users);

    const monthlyVisitsResult = await db
      .select({ count: contactRequests.id })
      .from(contactRequests)
      .where(gte(contactRequests.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)));

    return {
      totalProperties: totalPropertiesResult.length,
      activeUsers: activeUsersResult.length,
      monthlyVisits: monthlyVisitsResult.length,
      monthlyRevenue: "125K€", // This would be calculated based on actual sales data
    };
  }
}

export const storage = new DatabaseStorage();
