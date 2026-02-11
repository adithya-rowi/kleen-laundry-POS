import { Router } from "express";
import { supabase } from "../db.js";

const router = Router();

router.get("/services", async (req, res) => {
  const { branch_id, search, category } = req.query;

  if (!branch_id) {
    return res.status(400).json({ error: "branch_id is required" });
  }

  let query = supabase
    .from("services")
    .select(
      "id, name, price, unit, turnaround_days, min_quantity, category, smartlink_id"
    )
    .eq("branch_id", branch_id);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  query = query.order("name");

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;
