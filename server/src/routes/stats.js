import { Router } from "express";
import { supabase } from "../db.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const { count: totalBranches } = await supabase
      .from("branches")
      .select("*", { count: "exact", head: true });

    const { count: totalEmployees } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: totalCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    const today = new Date().toISOString().split("T")[0];
    const { count: todayOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`);

    res.json({
      totalBranches: totalBranches ?? 0,
      totalEmployees: totalEmployees ?? 0,
      totalCustomers: totalCustomers ?? 0,
      todayOrders: todayOrders ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
