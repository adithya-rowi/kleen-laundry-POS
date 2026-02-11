import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

// Load .env from project root
dotenv.config({ path: resolve(ROOT, ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Helpers ────────────────────────────────────────────

function readJSON(filename) {
  const path = resolve(__dirname, "seed-data", filename);
  return JSON.parse(readFileSync(path, "utf-8"));
}

function msToTurnaroundDays(ms) {
  if (!ms || ms <= 0) return 1;
  const days = Math.ceil(ms / 86_400_000);
  return days < 1 ? 1 : days;
}

function inferCategory(service) {
  if (service.snap?.use_snapbrige) return "snapbridge";
  const unit = service.layanan?.satuan?.nama?.toUpperCase();
  if (unit === "KG") return "kiloan";
  if (unit === "M2") return "luas";
  return "unit"; // PCS, Barang, Unit, Paket, Pasang, Stel
}

// ─── Column detection ──────────────────────────────────
// Probes the table to find which columns exist, so the script
// works with or without ensure-schema.sql having been run.

async function detectColumns(table, columns) {
  // Try all at once first (fast path)
  const { error } = await supabase
    .from(table)
    .select(columns.join(","))
    .limit(0);
  if (!error) return new Set(columns);

  // Fall back to probing each column individually
  const existing = new Set();
  for (const col of columns) {
    const { error: colErr } = await supabase
      .from(table)
      .select(col)
      .limit(0);
    if (!colErr) existing.add(col);
  }
  return existing;
}

function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

// ─── Transform SmartLink outlet → branches row ─────────

function buildBranchRow(outlet) {
  const workshop = outlet.workshop;

  const settings = {
    nota_beli_deposit: outlet.nota_beli_deposit || null,
    nota_beli_emoney: outlet.nota_beli_emoney || null,
    nota_daftar_member: outlet.nota_daftar_member || null,
    nota_surat_jemput: outlet.nota_surat_jemput || null,
    nota_surat_antar: outlet.nota_surat_antar || null,
    nota_surat_jemput_workshop: outlet.nota_surat_jemput_workshop || null,
    nota_surat_antar_workshop: outlet.nota_surat_antar_workshop || null,
    nota_topup_paylink: outlet.nota_topup_paylink || null,
    biaya: outlet.biaya ?? 0,
    biaya_tipe: outlet.biaya_tipe ?? 0,
    biaya_pengantaran: outlet.biaya_pengantaran ?? 0,
    wajib_bukti_tf: outlet.wajib_bukti_tf ?? 0,
    display_qrcode: outlet.display_qrcode ?? 0,
    display_barcode: outlet.display_barcode ?? 1,
    editable_diskon: outlet.editable_diskon ?? 0,
    editable_pajak: outlet.editable_pajak ?? 0,
    editable_biaya: outlet.editable_biaya ?? 0,
    hide_customer: outlet.hide_customer ?? 0,
    enable_express: outlet.enable_express ?? 0,
    workshop_name: workshop?.nama || null,
    workshop_address: workshop?.alamat || null,
    workshop_city: workshop?.kota || null,
    workshop_phone: workshop?.telp || null,
  };

  // All possible fields — will be filtered to only existing columns
  return {
    name: outlet.nama,
    city: outlet.kota,
    phone: outlet.telp,
    address: outlet.alamat,
    type: outlet.workshop_idworkshop ? "production" : "drop_off_only",
    latitude: outlet.latitude,
    longitude: outlet.longitude,
    smartlink_id: outlet.idoutlet,
    smartlink_workshop_id: outlet.workshop_idworkshop || null,
    absen_radius: outlet.absen_radius ?? 100,
    pajak: outlet.pajak ?? 0,
    diskon: outlet.diskon ?? 0,
    nota_transaksi: outlet.nota_transaksi || null,
    settings,
  };
}

// ─── Transform SmartLink service → services row ────────

function buildServiceRow(svc, branchId) {
  return {
    branch_id: branchId,
    name: svc.layanan.nama_layanan,
    category: inferCategory(svc),
    price: svc.harga ?? 0,
    unit: svc.layanan?.satuan?.nama || "PCS",
    min_quantity: svc.min_order_reg ?? 1,
    turnaround_days: msToTurnaroundDays(svc.layanan.durasi_penyelesaian),
    smartlink_id: svc.layanan.idlayanan,
  };
}

// ─── Main seed logic ───────────────────────────────────

async function detectSchema() {
  console.log("Detecting table schemas...");

  const BRANCH_COLUMNS = [
    "name",
    "city",
    "phone",
    "type",
    "address",
    "latitude",
    "longitude",
    "smartlink_id",
    "smartlink_workshop_id",
    "absen_radius",
    "pajak",
    "diskon",
    "nota_transaksi",
    "settings",
  ];

  const SERVICE_COLUMNS = [
    "branch_id",
    "name",
    "category",
    "price",
    "unit",
    "min_quantity",
    "turnaround_days",
    "smartlink_id",
  ];

  const branchCols = await detectColumns("branches", BRANCH_COLUMNS);
  const serviceCols = await detectColumns("services", SERVICE_COLUMNS);

  const missingBranch = BRANCH_COLUMNS.filter((c) => !branchCols.has(c));
  const missingService = SERVICE_COLUMNS.filter((c) => !serviceCols.has(c));

  console.log(
    `  branches: ${branchCols.size}/${BRANCH_COLUMNS.length} columns available`
  );
  console.log(
    `  services: ${serviceCols.size}/${SERVICE_COLUMNS.length} columns available`
  );

  if (missingBranch.length || missingService.length) {
    console.log("\n  Missing columns (run ensure-schema.sql to add them):");
    if (missingBranch.length)
      console.log(`    branches: ${missingBranch.join(", ")}`);
    if (missingService.length)
      console.log(`    services: ${missingService.join(", ")}`);
    console.log("  Continuing with available columns...\n");
  }

  return { branchCols, serviceCols };
}

async function clearData() {
  console.log("Clearing existing data...");

  // Delete services first (FK to branches)
  const { error: svcErr } = await supabase
    .from("services")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (svcErr) {
    console.error("  Warning clearing services:", svcErr.message);
  } else {
    console.log("  Cleared services table");
  }

  // Then delete branches
  const { error: brErr } = await supabase
    .from("branches")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (brErr) {
    console.error("  Warning clearing branches:", brErr.message);
  } else {
    console.log("  Cleared branches table");
  }
}

async function seedBranches(branchCols) {
  console.log("Seeding branches...");

  const raw = readJSON("all_outlets.json");
  const outlets = raw.data.map((entry) => entry.outlet);

  const rows = outlets.map((outlet) => {
    const full = buildBranchRow(outlet);
    return pick(full, branchCols);
  });

  const selectCols = ["id"];
  if (branchCols.has("name")) selectCols.push("name");
  if (branchCols.has("smartlink_id")) selectCols.push("smartlink_id");

  const { data, error } = await supabase
    .from("branches")
    .insert(rows)
    .select(selectCols.join(","));

  if (error) {
    console.error("  Error inserting branches:", error.message);
    process.exit(1);
  }

  console.log(`  Inserted ${data.length} branches:`);
  for (const b of data) {
    console.log(
      `    - ${b.name || "?"}${b.smartlink_id ? ` (${b.smartlink_id})` : ""}`
    );
  }

  return data;
}

async function seedServices(branches, serviceCols) {
  console.log("\nSeeding services for Bintaro...");

  // Find Bintaro branch — try by smartlink_id first, fall back to name
  const BINTARO_SMARTLINK_ID = "OTL15916123581223";
  let bintaro = branches.find((b) => b.smartlink_id === BINTARO_SMARTLINK_ID);
  if (!bintaro) {
    bintaro = branches.find((b) => b.name?.includes("Bintaro"));
  }

  if (!bintaro) {
    console.error("  Could not find Bintaro branch!");
    console.error(
      "  Available:",
      branches.map((b) => b.name || b.id)
    );
    process.exit(1);
  }

  console.log(`  Bintaro branch ID: ${bintaro.id}`);

  const raw = readJSON("bintaro_services_merged.json");
  const services = raw.data;
  const rows = services.map((svc) => {
    const full = buildServiceRow(svc, bintaro.id);
    return pick(full, serviceCols);
  });

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("services")
      .insert(batch)
      .select("id");

    if (error) {
      console.error(
        `  Error inserting services batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error.message
      );
      process.exit(1);
    }

    totalInserted += data.length;
  }

  console.log(`  Inserted ${totalInserted} services for ${bintaro.name || "Bintaro"}`);

  // Category breakdown
  const categories = {};
  for (const svc of services) {
    const cat = inferCategory(svc);
    categories[cat] = (categories[cat] || 0) + 1;
  }
  console.log("  Category breakdown:");
  for (const [cat, count] of Object.entries(categories).sort()) {
    console.log(`    - ${cat}: ${count}`);
  }
}

async function main() {
  console.log("=== Kleen Laundry POS — Seed Script ===\n");
  console.log(`Supabase: ${supabaseUrl}\n`);

  // Step 1: Detect available columns
  const { branchCols, serviceCols } = await detectSchema();

  // Step 2: Clear existing data
  await clearData();

  // Step 3: Seed branches
  console.log();
  const branches = await seedBranches(branchCols);

  // Step 4: Seed services
  await seedServices(branches, serviceCols);

  console.log("\n=== Seed complete! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
