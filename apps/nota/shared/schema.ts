import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  transactionType: text("transaction_type").notNull(),
  receivedAt: timestamp("received_at").notNull(),
  expectedAt: timestamp("expected_at").notNull(),
  status: text("status").notNull(),
  progress: integer("progress").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  balanceDue: integer("balance_due").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  timeline: jsonb("timeline").notNull(),
  photos: jsonb("photos").notNull(),
  businessName: text("business_name").notNull(),
  businessAddress: text("business_address").notNull(),
  businessPhone: text("business_phone").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
