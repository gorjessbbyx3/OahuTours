import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookingSchema, insertCustomTourSchema, insertTourSchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { createCloverClient } from "./cloverClient";
import { Request, Response, NextFunction } from 'express'; // Import Request, Response, NextFunction

// Placeholder for getUserFromToken - replace with actual implementation
async function getUserFromToken(token: string): Promise<any | null> {
  // This is a placeholder. In a real application, you would verify the token
  // (e.g., JWT) and retrieve user information from your authentication provider
  // or database.
  // For demonstration purposes, let's assume a simple token validation.
  if (token === 'valid-token') {
    return {
      id: 'user-id-from-token',
      name: 'Test User',
      claims: { sub: 'user-id-from-token', name: 'Test User', roles: [] }
    };
  }
  return null;
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const token = authHeader.substring(7);
      const user = await getUserFromToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };


  // Auth routes
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json(null);
    }

    try {
      const token = authHeader.substring(7);
      const user = await getUserFromToken(token);
      res.json(user);
    } catch (error) {
      res.json(null);
    }
  });

  // Public tour routes
  app.get("/api/tours", async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      console.error("Error fetching tours:", error);
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const tour = await storage.getTour(req.params.id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      console.error("Error fetching tour:", error);
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedBooking = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedBooking);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings/availability/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const bookings = await storage.getBookingsByDateRange(startOfDay, endOfDay);
      res.json(bookings);
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Custom tour routes
  app.post("/api/custom-tours", async (req, res) => {
    try {
      const validatedCustomTour = insertCustomTourSchema.parse(req.body);
      const customTour = await storage.createCustomTour(validatedCustomTour);
      res.status(201).json(customTour);
    } catch (error) {
      console.error("Error creating custom tour:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid custom tour data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create custom tour" });
    }
  });

  // Protected admin routes
  app.get("/api/admin/bookings", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/admin/bookings", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedBooking = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedBooking);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating admin booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/admin/custom-tours", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const customTours = await storage.getCustomTours();
      res.json(customTours);
    } catch (error) {
      console.error("Error fetching custom tours:", error);
      res.status(500).json({ message: "Failed to fetch custom tours" });
    }
  });

  app.get("/api/admin/tours", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      console.error("Error fetching admin tours:", error);
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.post("/api/admin/tours", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedTour = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(validatedTour);
      res.status(201).json(tour);
    } catch (error) {
      console.error("Error creating tour:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tour data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tour" });
    }
  });

  // Settings routes
  app.get("/api/admin/settings", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedSettings = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Clover integration
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      const settings = await storage.getSettings();

      if (!settings?.cloverApiToken || !settings?.cloverAppId) {
        return res.status(400).json({ message: "Clover not configured" });
      }

      const cloverClient = createCloverClient({
        apiToken: settings.cloverApiToken,
        appId: settings.cloverAppId,
        environment: settings.cloverEnvironment as 'sandbox' | 'production',
      });

      const paymentIntent = await cloverClient.createPaymentIntent({
        amount: Math.round(amount * 100), // Clover expects amount in cents
        currency: "usd",
        orderId: bookingId,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  app.post("/api/create-clover-payment", async (req, res) => {
    try {
      const { amount, currency, card, billing, test } = req.body;
      const settings = await storage.getSettings();

      if (!settings?.cloverApiToken || !settings?.cloverAppId) {
        return res.status(400).json({ 
          success: false, 
          error: "Clover not configured. Please set up your Clover credentials in admin settings." 
        });
      }

      const cloverClient = createCloverClient({
        apiToken: settings.cloverApiToken,
        appId: settings.cloverAppId,
        environment: settings.cloverEnvironment as 'sandbox' | 'production',
      });

      const result = await cloverClient.createPayment({
        amount,
        currency,
        source: {
          object: "card",
          number: card.number,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          cvv: card.cvv,
        },
        metadata: {
          billing_name: billing.name,
          billing_zip: billing.zip,
          test: test ? "true" : "false",
        },
      });

      res.json({
        success: result.success,
        paymentId: result.payment?.id,
        error: result.error,
      });
    } catch (error) {
      console.error("Error creating Clover payment:", error);
      res.status(500).json({ 
        success: false, 
        error: "Payment processing failed" 
      });
    }
  });

  app.post("/api/clover/webhook", async (req, res) => {
    try {
      const cloverClient = createCloverClient();
      const event = await cloverClient.verifyWebhookSignature(req.body, req.headers['x-cc-webhook-signature']);

      switch (event.type) {
        case 'payment.captured':
          // Handle payment captured event
          await storage.updateBookingStatus(event.data.order_id, "paid");
          break;
        case 'payment.failed':
          // Handle payment failed event
          await storage.updateBookingStatus(event.data.order_id, "failed");
          break;
        // Add more event types as needed
        default:
          console.log(`Received unhandled event type: ${event.type}`);
      }

      res.status(200).send("Webhook received");
    } catch (error) {
      console.error("Error handling Clover webhook:", error);
      res.status(500).json({ message: "Error handling webhook" });
    }
  });

  app.get("/api/admin/clover/test-connection", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const cloverClient = createCloverClient();
      await cloverClient.testConnection(); // Assuming testConnection is a method on CloverClient

      res.status(200).json({ message: "Clover connection successful" });
    } catch (error) {
      console.error("Error testing Clover connection:", error);
      res.status(500).json({ message: "Failed to connect to Clover" });
    }
  });

  app.get("/api/clover/dashboard", requireAuth, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getSettings();
      if (!settings?.cloverApiToken || !settings?.cloverAppId) {
        return res.status(400).json({ message: "Clover not configured. Please set up your Clover credentials in admin settings." });
      }

      const cloverClient = createCloverClient({
        apiToken: settings.cloverApiToken,
        appId: settings.cloverAppId,
        environment: settings.cloverEnvironment as 'sandbox' | 'production',
      });

      const dashboardUrl = cloverClient.getDashboardUrl();
      res.redirect(dashboardUrl);
    } catch (error) {
      console.error("Error getting Clover dashboard URL:", error);
      res.status(500).json({ message: "Failed to get Clover dashboard URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}