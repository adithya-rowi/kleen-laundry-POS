import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";

async function seedDemoOrder() {
  const demoOrderId = "TZM251015091748056";
  
  try {
    const existing = await storage.getOrderByOrderId(demoOrderId);
    if (existing) {
      console.log(`Demo order ${demoOrderId} already exists`);
      return;
    }

    await storage.createOrder({
      orderId: demoOrderId,
      customerName: "Priza",
      customerPhone: "628111095503",
      customerAddress: "Pinang Emas 1 B4",
      transactionType: "REGULER",
      receivedAt: new Date("2025-10-15T09:17:00"),
      expectedAt: new Date("2025-10-16T09:17:00"),
      status: "SELESAI",
      progress: 100,
      totalAmount: 50000,
      paidAmount: 0,
      balanceDue: 50000,
      isPaid: false,
      timeline: [
        { step: "Order Diterima", timestamp: "2025-10-15T09:17:00", staff: "Kasir Pangpol", service: "Cuci Lipat 1 hari", completed: true },
        { step: "Cuci", timestamp: "2025-10-15T14:56:00", staff: "DianiMY", service: "Cuci Lipat 1 hari", completed: true },
        { step: "Kering", timestamp: "2025-10-15T15:08:00", staff: "DianiMY", service: "Cuci Lipat 1 hari", completed: true },
        { step: "Setrika", timestamp: "2025-10-15T15:13:00", staff: "Ratih Pondok Labu", service: "Cuci Lipat 1 hari", completed: true },
        { step: "Pengemasan", timestamp: "2025-10-15T15:13:00", staff: "Ratih Pondok Labu", service: "Cuci Lipat 1 hari", completed: true },
        { step: "Finishing", timestamp: "2025-10-16T14:06:00", staff: "Kasir Pangpol", service: "Cuci Lipat 1 hari", completed: true },
        { step: "Selesai", timestamp: "2025-10-16T14:06:00", staff: "Kasir Pangpol", service: "Siap diambil", completed: true }
      ],
      photos: [
        "/stock_images/folded_clean_laundry_d1303af8.jpg",
        "/stock_images/folded_clean_laundry_c505cf98.jpg",
        "/stock_images/folded_clean_laundry_dee54f9a.jpg"
      ],
      businessName: "KLEEN Laundry & General Cleaning",
      businessAddress: "Ruko Grand Panglima Polim 90. Pulo, Kebayoran Baru - Adm. Jakarta Selatan",
      businessPhone: "628119909933"
    });

    console.log(`Demo order ${demoOrderId} seeded successfully`);
  } catch (error) {
    console.error("Error seeding demo order:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed demo data on startup
  await seedDemoOrder();

  app.get("/api/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      console.log(`Fetching order: ${orderId}`);
      const order = await storage.getOrderByOrderId(orderId);
      
      if (!order) {
        console.log(`Order not found: ${orderId}`);
        return res.status(404).json({ error: "Order not found" });
      }
      
      console.log(`Order found: ${orderId}`);
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validated);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
