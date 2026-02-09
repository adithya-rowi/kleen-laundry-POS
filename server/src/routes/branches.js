import { Router } from "express";
import { supabase } from "../db.js";

const router = Router();

router.get("/branches", async (_req, res) => {
  const { data, error } = await supabase
    .from("branches")
    .select("id, name, city, phone, type")
    .order("name");

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.get("/branches/:id", async (req, res) => {
  const { id } = req.params;

  const { data: branch, error: branchError } = await supabase
    .from("branches")
    .select("*")
    .eq("id", id)
    .single();

  if (branchError) {
    return res.status(404).json({ error: "Branch not found" });
  }

  let production_stages = [];
  if (branch.type === "production") {
    const { data: stages } = await supabase
      .from("production_stage_config")
      .select("*")
      .eq("branch_id", id)
      .order("stage_order");
    production_stages = stages || [];
  }

  res.json({ ...branch, production_stages });
});

export default router;
