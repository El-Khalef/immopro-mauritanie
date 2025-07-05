import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPropertySchema, insertContactRequestSchema, insertFavoriteSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage_multer });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Create uploads directory if it doesn't exist
  const fs = await import("fs");
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Property routes
  app.get('/api/properties', async (req, res) => {
    try {
      const filters = {
        type: req.query.type as string,
        propertyType: req.query.propertyType as string,
        city: req.query.city as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minSurface: req.query.minSurface ? Number(req.query.minSurface) : undefined,
        maxSurface: req.query.maxSurface ? Number(req.query.maxSurface) : undefined,
        rooms: req.query.rooms ? Number(req.query.rooms) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      };

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const properties = await storage.getFeaturedProperties(limit);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const property = await storage.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post('/api/properties', isAuthenticated, upload.array('images', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const files = req.files as Express.Multer.File[];
      const images = files ? files.map(file => `/uploads/${file.filename}`) : [];

      const propertyData = {
        ...req.body,
        price: parseFloat(req.body.price),
        surface: parseInt(req.body.surface),
        rooms: parseInt(req.body.rooms),
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : undefined,
        images,
        features: req.body.features ? JSON.parse(req.body.features) : [],
      };

      const validatedData = insertPropertySchema.parse(propertyData);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put('/api/properties/:id', isAuthenticated, upload.array('images', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = Number(req.params.id);
      const files = req.files as Express.Multer.File[];
      const newImages = files ? files.map(file => `/uploads/${file.filename}`) : [];

      const propertyData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        surface: req.body.surface ? parseInt(req.body.surface) : undefined,
        rooms: req.body.rooms ? parseInt(req.body.rooms) : undefined,
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : undefined,
        features: req.body.features ? JSON.parse(req.body.features) : undefined,
      };

      if (newImages.length > 0) {
        const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        propertyData.images = [...existingImages, ...newImages];
      }

      const property = await storage.updateProperty(id, propertyData);
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = Number(req.params.id);
      await storage.deleteProperty(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteData = insertFavoriteSchema.parse({
        userId,
        propertyId: Number(req.body.propertyId),
      });

      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = Number(req.params.propertyId);
      await storage.removeFavorite(userId, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites/:propertyId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = Number(req.params.propertyId);
      const isFavorite = await storage.isFavorite(userId, propertyId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ message: "Failed to check favorite" });
    }
  });

  // Contact requests routes
  app.get('/api/contact-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;
      const requests = await storage.getContactRequests(propertyId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching contact requests:", error);
      res.status(500).json({ message: "Failed to fetch contact requests" });
    }
  });

  app.post('/api/contact-requests', async (req, res) => {
    try {
      const requestData = insertContactRequestSchema.parse(req.body);
      const request = await storage.createContactRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating contact request:", error);
      res.status(500).json({ message: "Failed to create contact request" });
    }
  });

  app.put('/api/contact-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = Number(req.params.id);
      const { status } = req.body;
      const request = await storage.updateContactRequestStatus(id, status);
      res.json(request);
    } catch (error) {
      console.error("Error updating contact request:", error);
      res.status(500).json({ message: "Failed to update contact request" });
    }
  });

  // Admin stats route
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
