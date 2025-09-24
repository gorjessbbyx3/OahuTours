import {
  users,
  tours,
  bookings,
  customTours,
  settings,
  type User,
  type UpsertUser,
  type Tour,
  type InsertTour,
  type Booking,
  type InsertBooking,
  type CustomTour,
  type InsertCustomTour,
  type Settings,
  type InsertSettings,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Tour operations
  getTours(): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: string, tour: Partial<InsertTour>): Promise<Tour>;
  deleteTour(id: string): Promise<void>;

  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;

  // Custom tour operations
  getCustomTours(): Promise<CustomTour[]>;
  createCustomTour(customTour: InsertCustomTour): Promise<CustomTour>;
  updateCustomTour(id: string, customTour: Partial<InsertCustomTour>): Promise<CustomTour>;

  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(userId: string): Promise<User | undefined> {
    let user = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.length === 0) {
      return undefined; // User not found
    }
    return user[0];
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

  // Tour operations
  async getTours(): Promise<Tour[]> {
    return await db.select().from(tours).where(eq(tours.isActive, true)).orderBy(tours.name);
  }

  async getTour(id: string): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }

  async createTour(tour: InsertTour): Promise<Tour> {
    const [newTour] = await db.insert(tours).values(tour).returning();
    return newTour;
  }

  async updateTour(id: string, tour: Partial<InsertTour>): Promise<Tour> {
    const [updatedTour] = await db
      .update(tours)
      .set({ ...tour, updatedAt: new Date() })
      .where(eq(tours.id, id))
      .returning();
    return updatedTour;
  }

  async deleteTour(id: string): Promise<void> {
    await db.update(tours).set({ isActive: false }).where(eq(tours.id, id));
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.bookingDate, startDate),
          lte(bookings.bookingDate, endDate)
        )
      )
      .orderBy(bookings.bookingDate);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    await db
      .update(bookings)
      .set({ paymentStatus: status as any, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));
  }

  // Custom tour operations
  async getCustomTours(): Promise<CustomTour[]> {
    return await db.select().from(customTours).orderBy(desc(customTours.createdAt));
  }

  async createCustomTour(customTour: InsertCustomTour): Promise<CustomTour> {
    const [newCustomTour] = await db.insert(customTours).values(customTour).returning();
    return newCustomTour;
  }

  async updateCustomTour(id: string, customTour: Partial<InsertCustomTour>): Promise<CustomTour> {
    const [updatedCustomTour] = await db
      .update(customTours)
      .set({ ...customTour, updatedAt: new Date() })
      .where(eq(customTours.id, id))
      .returning();
    return updatedCustomTour;
  }

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    const [settingsRecord] = await db.select().from(settings).limit(1);
    return settingsRecord;
  }

  async updateSettings(settingsData: InsertSettings): Promise<Settings> {
    const existingSettings = await this.getSettings();

    if (existingSettings) {
      const [updatedSettings] = await db
        .update(settings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(settings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db.insert(settings).values(settingsData).returning();
      return newSettings;
    }
  }
}

export const storage = new DatabaseStorage();