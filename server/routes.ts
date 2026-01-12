import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import Xendit from "xendit-node";

// Initialize Xendit client (use test/sandbox key for development)
const xenditSecretKey = process.env.XENDIT_SECRET_KEY || "xnd_development_your_test_key_here";
const xendit = new Xendit({ secretKey: xenditSecretKey });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await storage.getOrderByOrderId(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
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

  // Create Xendit payment invoice
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { orderId, amount, customerName, customerPhone } = req.body;

      // Validate required fields
      if (!orderId || !amount || !customerName) {
        return res.status(400).json({ error: "Missing required fields: orderId, amount, customerName" });
      }

      // Create Xendit Invoice
      const invoice = await xendit.Invoice.createInvoice({
        data: {
          externalId: `KLEEN-${orderId}-${Date.now()}`,
          amount: amount,
          description: `Pembayaran Laundry - Order ${orderId}`,
          currency: "IDR",
          customer: {
            givenNames: customerName,
            mobileNumber: customerPhone || undefined,
          },
          customerNotificationPreference: {
            invoiceCreated: customerPhone ? ["whatsapp"] : [],
            invoicePaid: customerPhone ? ["whatsapp"] : [],
          },
          successRedirectUrl: `${req.headers.origin || "http://localhost:5000"}/order/${orderId}?payment=success`,
          failureRedirectUrl: `${req.headers.origin || "http://localhost:5000"}/order/${orderId}?payment=failed`,
          // Enable QRIS and Bank Transfer payment methods
          paymentMethods: ["QRIS", "BCA", "BNI", "BRI", "MANDIRI", "PERMATA", "OVO", "DANA", "SHOPEEPAY"],
          locale: "id",
          invoiceDuration: 86400, // 24 hours
          metadata: {
            orderId: orderId,
          },
        },
      });

      console.log("Xendit invoice created:", invoice.id);

      res.json({
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoiceUrl,
        expiryDate: invoice.expiryDate,
        status: invoice.status,
      });
    } catch (error: any) {
      console.error("Error creating Xendit invoice:", error);
      res.status(500).json({
        error: "Failed to create payment",
        details: error.message || "Unknown error"
      });
    }
  });

  return httpServer;
}
