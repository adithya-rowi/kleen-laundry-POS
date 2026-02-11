import { Router } from "express";
import { supabase } from "../db.js";

const router = Router();

const VALID_ROLES = ["admin", "kasir", "kurir", "produksi"];
const SELECT_FIELDS = "*, branches(name)";

// Detect which optional columns exist on the users table
let optionalCols = null;
async function getOptionalCols() {
  if (optionalCols) return optionalCols;
  const cols = new Set();
  for (const col of ["pin", "is_active"]) {
    const { error } = await supabase.from("users").select(col).limit(0);
    if (!error) cols.add(col);
  }
  optionalCols = cols;
  return cols;
}

// GET /api/employees — list all, optionally filter by branch_id
router.get("/employees", async (req, res) => {
  const { branch_id } = req.query;

  let query = supabase.from("users").select(SELECT_FIELDS).order("name");

  if (branch_id) {
    query = query.eq("branch_id", branch_id);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// POST /api/employees — create new employee
router.post("/employees", async (req, res) => {
  const { name, phone, role, branch_id, pin, is_active } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nama wajib diisi" });
  }

  if (role && !VALID_ROLES.includes(role)) {
    return res
      .status(400)
      .json({ error: `Role harus salah satu dari: ${VALID_ROLES.join(", ")}` });
  }

  if (pin && !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: "PIN harus 4 digit angka" });
  }

  const cols = await getOptionalCols();

  // Auto-generate username from name if not provided
  const username =
    req.body.username ||
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

  const row = {
    name: name.trim(),
    username,
    phone: phone || null,
    role: role || "kasir",
    branch_id: branch_id || null,
  };
  if (cols.has("pin")) row.pin = pin || null;
  if (cols.has("is_active"))
    row.is_active = is_active !== undefined ? is_active : true;

  const { data, error } = await supabase
    .from("users")
    .insert(row)
    .select(SELECT_FIELDS)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// PUT /api/employees/:id — update employee
router.put("/employees/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, branch_id, pin, is_active } = req.body;

  if (role && !VALID_ROLES.includes(role)) {
    return res
      .status(400)
      .json({ error: `Role harus salah satu dari: ${VALID_ROLES.join(", ")}` });
  }

  if (pin && !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: "PIN harus 4 digit angka" });
  }

  const cols = await getOptionalCols();
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (req.body.username !== undefined) updates.username = req.body.username;
  if (phone !== undefined) updates.phone = phone || null;
  if (role !== undefined) updates.role = role;
  if (branch_id !== undefined) updates.branch_id = branch_id || null;
  if (pin !== undefined && cols.has("pin")) updates.pin = pin || null;
  if (is_active !== undefined && cols.has("is_active"))
    updates.is_active = is_active;

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select(SELECT_FIELDS)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE /api/employees/:id — delete employee
router.delete("/employees/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(204).end();
});

export default router;
