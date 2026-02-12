import { Router } from "express";
import { supabase } from "../db.js";

const router = Router();

const VALID_TYPES = ["reguler", "member"];

// Detect whether the optional 'type' column exists on the customers table
let hasTypeCol = null;
async function checkTypeCol() {
  if (hasTypeCol !== null) return hasTypeCol;
  const { error } = await supabase.from("customers").select("type").limit(0);
  hasTypeCol = !error;
  return hasTypeCol;
}

// GET /api/customers — list all, optionally search by name/phone
router.get("/customers", async (req, res) => {
  const { search } = req.query;
  const limit = parseInt(req.query.limit) || 100;
  const typeExists = await checkTypeCol();

  const selectFields = typeExists
    ? "id, name, phone, address, type, created_at"
    : "id, name, phone, address, created_at";

  let query = supabase
    .from("customers")
    .select(selectFields)
    .order("name")
    .limit(limit);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data: customers, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Aggregate order stats for each customer in a single query
  const customerIds = customers.map((c) => c.id);
  const orderStats = {};

  if (customerIds.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("customer_id, created_at")
      .in("customer_id", customerIds);

    if (orders) {
      for (const order of orders) {
        if (!orderStats[order.customer_id]) {
          orderStats[order.customer_id] = { total: 0, last: null };
        }
        orderStats[order.customer_id].total += 1;
        const d = order.created_at;
        if (!orderStats[order.customer_id].last || d > orderStats[order.customer_id].last) {
          orderStats[order.customer_id].last = d;
        }
      }
    }
  }

  const result = customers.map((c) => ({
    ...c,
    type: c.type || "reguler",
    total_orders: orderStats[c.id]?.total || 0,
    last_order: orderStats[c.id]?.last || null,
  }));

  res.json(result);
});

// POST /api/customers — create new customer
router.post("/customers", async (req, res) => {
  const { name, phone, address, type } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nama wajib diisi" });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Nomor telepon wajib diisi" });
  }

  if (!/^628\d{8,13}$/.test(phone.trim())) {
    return res
      .status(400)
      .json({ error: "Nomor telepon harus format 628xxxxxxxxxx" });
  }

  if (type && !VALID_TYPES.includes(type)) {
    return res
      .status(400)
      .json({ error: `Tipe harus salah satu dari: ${VALID_TYPES.join(", ")}` });
  }

  const typeExists = await checkTypeCol();

  const row = {
    name: name.trim(),
    phone: phone.trim(),
    address: address?.trim() || null,
  };
  if (typeExists) row.type = type || "reguler";

  const { data, error } = await supabase
    .from("customers")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Nomor telepon sudah terdaftar" });
    }
    return res.status(500).json({ error: error.message });
  }

  res
    .status(201)
    .json({ ...data, type: data.type || "reguler", total_orders: 0, last_order: null });
});

// PUT /api/customers/:id — update customer
router.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, type } = req.body;

  if (phone && !/^628\d{8,13}$/.test(phone.trim())) {
    return res
      .status(400)
      .json({ error: "Nomor telepon harus format 628xxxxxxxxxx" });
  }

  if (type && !VALID_TYPES.includes(type)) {
    return res
      .status(400)
      .json({ error: `Tipe harus salah satu dari: ${VALID_TYPES.join(", ")}` });
  }

  const typeExists = await checkTypeCol();
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone.trim();
  if (address !== undefined) updates.address = address?.trim() || null;
  if (type !== undefined && typeExists) updates.type = type;

  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Nomor telepon sudah terdaftar" });
    }
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE /api/customers/:id — delete customer
router.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return res
        .status(409)
        .json({ error: "Pelanggan tidak bisa dihapus karena memiliki transaksi" });
    }
    return res.status(500).json({ error: error.message });
  }

  res.status(204).end();
});

export default router;
