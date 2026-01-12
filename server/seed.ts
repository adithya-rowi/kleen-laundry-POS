import { db } from "./db";
import { orders } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEMO_ORDER_ID = "TZM251015091748056";

const demoOrder = {
  orderId: DEMO_ORDER_ID,
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
  ],
  photos: [
    "/stock_images/folded_clean_laundry_d1303af8.jpg",
    "/stock_images/folded_clean_laundry_c505cf98.jpg",
    "/stock_images/folded_clean_laundry_dee54f9a.jpg"
  ],
  businessName: "KLEEN Laundry & General Cleaning",
  businessAddress: "Ruko Grand Panglima Polim 90. Pulo, Kebayoran Baru - Adm. Jakarta Selatan",
  businessPhone: "628119909933"
};

export async function seedDemoOrder(): Promise<void> {
  console.log("[Seed] Starting demo order seed process...");

  try {
    // Check if demo order already exists
    console.log("[Seed] Checking if demo order exists...");
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, DEMO_ORDER_ID))
      .limit(1);

    if (existingOrder) {
      console.log(`[Seed] Demo order ${DEMO_ORDER_ID} already exists, skipping seed.`);
      return;
    }

    // Insert demo order
    console.log("[Seed] Inserting demo order...");
    await db.insert(orders).values(demoOrder);
    console.log(`[Seed] Demo order ${DEMO_ORDER_ID} seeded successfully!`);
  } catch (error: any) {
    console.error("[Seed] Error seeding demo order:", error?.message || error);
    console.error("[Seed] Full error:", JSON.stringify(error, null, 2));
  }
}

// Allow running as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoOrder().then(() => process.exit(0)).catch(() => process.exit(1));
}
