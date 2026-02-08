# CLAUDE.md — Kleen Laundry POS

## What is this project?

A custom POS (Point of Sale) system replacing SmartLink for **Kleen Laundry**, a laundry business with 10-12 branches across Jakarta and Tangerang, ~22K customers, ~91 employees.

The owner wants to stop paying SmartLink and own their system — especially so QRIS payments go directly to Kleen's account (via Xendit) instead of SmartLink's.

## Architecture

Monorepo with 3 apps + 1 shared backend:

```
kleen-laundry-POS/
├── apps/
│   ├── nota/          # Customer-facing order status page (React, DONE)
│   └── admin/         # Web admin dashboard (React + Vite, IN PROGRESS)
├── server/            # Express API (shared backend)
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   └── db.js      # Supabase client
│   └── package.json
├── supabase/
│   ├── migrations/    # SQL schema files
│   └── seed.sql
├── .env               # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (DO NOT COMMIT)
└── package.json       # Root with npm workspaces
```

## The 3 Apps

| App | Platform | Users | Status |
|-----|----------|-------|--------|
| **Nota Page** (apps/nota) | React web | Customers | DONE - deployed on Replit |
| **Web Admin** (apps/admin) | React + Vite web | Owner + admin staff | IN PROGRESS |
| **Smart Kasir** | React Native Expo (Android) | Cashiers | PLANNED |
| **Smart Produksi** | React Native Expo (Android) | Production workers | PLANNED |

## Tech Stack

- **Database**: Supabase (PostgreSQL) — project: kleen-pos, region: Singapore
- **Auth**: Supabase Auth
- **Backend**: Node.js + Express
- **Web Apps**: React + Vite
- **Mobile Apps**: React Native (Expo) — Android only
- **Payments**: Xendit (QRIS)
- **WhatsApp**: Fonnte or Wablas (TBD)
- **Photo Storage**: Supabase Storage
- **Hosting**: Replit (web), Railway (backend)

## Database Schema (13 tables in Supabase)

- `branches` — 10-12 locations. Type: drop_off_only or production.
- `production_stage_config` — 11 possible stages per branch (Label, Sortir, Cleaning, Spotting, Detailing, Cuci, Kering, Setrika, Extra Setrika, Lipat, Pengemasan). Configurable per outlet.
- `users` — employees with roles: admin, kasir, kurir, produksi. Assigned to a branch.
- `customers` — 22K+ rows. Fields: name, phone (format 628xxx), address.
- `services` — 146 per outlet. Categories: kiloan, luas, unit, snapbridge. Has price, unit, min_quantity, turnaround_days.
- `perfumes` — 9 types per branch.
- `orders` — the nota/transaction. Has order_code (e.g. TZM251015091748056), status (new→processing→done→picked_up→cancelled), payment_status (unpaid→partial→paid).
- `order_items` — items within an order. Links to service, has quantity, price at time of order, specifications (jsonb).
- `order_photos` — intake, production, and pickup photos.
- `production_tracking` — tracks which stage is complete, by whom, with photo proof.
- `payments` — methods: qris, cash, transfer, edc, e_payment. Transfer requires proof photo.
- `wa_templates` — per-branch WhatsApp message templates with variables like [nama_outlet], [kode_transaksi], etc.
- `attendance` — location-based clock in/out for employees.

## Branding

- Primary: Navy Blue #1E3A5F
- Accent: Cyan #00D4AA
- CTA: Royal Blue #2E5CB8
- Logo: Water droplet with "LAUNDRY & GENERAL CLEANING"

## SmartLink Reference

We are replicating SmartLink's core features. Key SmartLink screens to match:
- **Admin sidebar**: Dashboard, Outlet & Workshop, Karyawan, Penggajian/Komisi
- **Outlet detail**: name, phone, city, address, services list, production stages, perfumes, transaction/nota settings
- **Kasir app home**: 4 buttons (Buat Transaksi, Proses Transaksi, Ambil & Pelunasan, Top Up Saldo), Absensi, today's stats
- **Kasir bottom nav**: Beranda, Konsumen, Antar Jemput, Pengaturan
- **Payment methods**: QRIS, E-Payment, Tunai, Transfer (w/ proof), EDC

SmartLink trial login: kltrainingsmartlink@gmail.com / Kleen123
SmartLink live login: Admintraining / Kleen123

## Key Business Rules

1. Each outlet can be "drop off only" or "production" — production outlets have configurable workflow stages
2. Services are per-branch (146 per outlet) with categories: kiloan (by kg), luas (by area), unit (by piece), snapbridge
3. Orders have a unique order_code used in QR codes and WhatsApp links
4. QRIS payments MUST go to Kleen's Xendit account, not a third party — this is the #1 reason for building this app
5. WhatsApp messages use SmartEngine 4.0 templates with variable substitution
6. Customers can pick up without paying ("Ambil Saja") or pay and pick up ("Lunasi")
7. Transfer payments require screenshot/photo proof

## Development Workflow

1. Code locally with Claude Code
2. Push to GitHub: github.com/adithya-rowi/kleen-laundry-POS
3. Sync to Replit for deployment
4. Test → ship → validate with client

## Current Sprint: Web Admin Dashboard

Building the admin web app (apps/admin) that covers:
- Login + auth (Supabase Auth)
- Outlet management (list, detail, edit)
- Service & pricing management
- Employee management + role assignment
- Order tracking (all branches, filter)
- Basic reports (revenue per branch)
- Customer database view

## Commands

```bash
# Install dependencies
npm install

# Run admin dashboard (dev)
cd apps/admin && npm run dev

# Run API server
cd server && npm run dev

# Run nota page
cd apps/nota && npm run dev
```

## Environment Variables (.env in root)

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
```
