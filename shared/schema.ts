import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tour types enum
export const tourTypeEnum = pgEnum('tour_type', ['day', 'night', 'custom']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);

// Tours table
export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  type: tourTypeEnum("type").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in hours
  maxGroupSize: integer("max_group_size").default(8),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").references(() => tours.id),
  customerName: varchar("customer_name").notNull(),
  customerEmail: varchar("customer_email").notNull(),
  customerPhone: varchar("customer_phone"),
  bookingDate: timestamp("booking_date").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default('pending'),
  specialRequests: text("special_requests"),
  cloverPaymentId: varchar("clover_payment_id"),
  paymentStatus: paymentStatusEnum("payment_status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom tour requests table
export const customTours = pgTable("custom_tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: varchar("customer_name").notNull(),
  customerEmail: varchar("customer_email").notNull(),
  customerPhone: varchar("customer_phone"),
  tourType: tourTypeEnum("tour_type").notNull(),
  activities: jsonb("activities").$type<string[]>(), // array of selected activities
  groupSize: integer("group_size").notNull(),
  specialRequests: text("special_requests"),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  status: bookingStatusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settings table for admin configuration
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloverAppId: varchar("clover_app_id"),
  cloverApiToken: varchar("clover_api_token"),
  cloverEnvironment: varchar("clover_environment").default('sandbox'),
  businessName: varchar("business_name").default('Oahu Elite Tours'),
  contactEmail: varchar("contact_email"),
  phoneNumber: varchar("phone_number"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('8.25'),
  defaultTourDuration: integer("default_tour_duration").default(6),
  maxGroupSize: integer("max_group_size").default(8),
  advanceBookingDays: integer("advance_booking_days").default(2),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  tour: one(tours, {
    fields: [bookings.tourId],
    references: [tours.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true, // Omit status from insert schema
});

export const insertCustomTourSchema = createInsertSchema(customTours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).extend({
  cloverEnvironment: z.enum(['sandbox', 'production']).default('sandbox'),
  cloverApiToken: z.string().optional(),
  cloverAppId: z.string().optional(),
});

export const selectSettingsSchema = createSelectSchema(settings);

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectTourSchema = createSelectSchema(tours);
export const selectBookingSchema = createSelectSchema(bookings);
export const selectCustomTourSchema = createSelectSchema(customTours);

// Types
export type User = z.infer<typeof selectUserSchema>;
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type Tour = z.infer<typeof selectTourSchema>;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type Booking = z.infer<typeof selectBookingSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type CustomTour = z.infer<typeof selectCustomTourSchema>;
export type InsertCustomTour = z.infer<typeof insertCustomTourSchema>;
export type Settings = z.infer<typeof selectSettingsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;