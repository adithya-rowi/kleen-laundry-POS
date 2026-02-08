# 🧺 Project KLEEN — Full Project Plan

## The Honest Truth First

Adith, before we plan anything, I need to be straight with you as your partner on this.

### On Pricing: IDR 50M is Significantly Below Market

A custom system like this — web admin + 2 mobile apps + payment integration + WhatsApp API + real-time OCC dashboard — would typically cost:

| Approach | Market Rate |
|----------|-------------|
| Indonesian dev agency (mid-tier) | IDR 150–300M |
| Freelance team (2-3 devs, 4-6 months) | IDR 100–200M |
| Offshore dev shop (India/Vietnam) | IDR 200–500M |
| US/SG agency | IDR 500M–1.5B |

**You accepted IDR 50M.** That's roughly $3,100 USD. For context, SmartLink has been built since 2016 by an entire team and charges per-nota (coin-based model) across hundreds of laundry businesses.

### But Here's Why It Can Still Work

1. **AI-assisted coding** (Claude Code + Replit) genuinely compresses development time by 3–5x
2. **You're not starting from zero** — you have SmartLink as a living reference to copy from
3. **This is a relationship investment** — your friend has 12 branches and knows other business owners
4. **Portfolio value** — a working production app serving 91 users across 12 locations is an incredible portfolio piece
5. **Recurring revenue potential** — you can charge maintenance/hosting fees monthly

### My Recommendation

**Take the project, but restructure the deal:**

- **IDR 50M for Phase 1 (MVP)** — core features that replace SmartLink's essentials
- **IDR 25–35M for Phase 2** — OCC dashboard + advanced features
- **IDR 1–2M/month maintenance** — hosting, updates, bug fixes, support
- **Revenue share on QRIS** — since payments go through your system now, negotiate 0.5–1% transaction fee

This way, your total project value becomes IDR 75–85M + recurring revenue. Much more sustainable.

---

## What We're Building

### System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    BACKEND (API)                      │
│         Node.js/Express + PostgreSQL (Supabase)       │
│         Hosted on Railway / Supabase                  │
├───────────┬──────────────┬──────────────┬────────────┤
│  Web Admin│  Cashier App │Production App│ Customer   │
│  (React)  │  (React      │(React Native)│ Nota Page  │
│  Replit   │   Native)    │              │ (Web)      │
│           │  Play Store  │ Play Store   │            │
└───────────┴──────────────┴──────────────┴────────────┘
         │            │           │              │
    ┌────┴────┐  ┌────┴───┐ ┌────┴───┐   ┌─────┴────┐
    │Dashboard│  │WhatsApp│ │  QR    │   │  QRIS    │
    │  OCC    │  │  API   │ │Scanner │   │ Payment  │
    └─────────┘  └────────┘ └────────┘   └──────────┘
```

### The Three Apps + One Page

| # | Component | Platform | Purpose |
|---|-----------|----------|---------|
| 1 | **Web Admin (BOS)** | Web (React) | Owner/admin dashboard, user management, reports, OCC |
| 2 | **Smart Kasir** | Android (React Native) | Cashier order entry, customer registration, photos, WhatsApp nota |
| 3 | **Smart Produksi** | Android (React Native) | Production QR scanning, status updates per station |
| 4 | **Nota Page** | Web (responsive) | Customer-facing order status + QRIS payment link |

---

## Phase 1: MVP (Replace SmartLink Core)
**Timeline: 8–10 weeks | Budget: IDR 50M**

### Week 1–2: Discovery & Setup

**Tasks:**
- [ ] Get SmartLink login credentials from your friend
- [ ] Screenshot/record EVERY screen in SmartLink (web admin, kasir app, produksi app, nota page)
- [ ] Get the Excel files with branch data, employee data, service types, pricing
- [ ] Set up development environment (GitHub repo, Replit project, Supabase project)
- [ ] Design database schema
- [ ] Set up CI/CD pipeline (GitHub → Replit deploy)

**Key Data to Collect from Your Friend:**
- Complete list of 12 branches (names, addresses, phone numbers)
- All employee names, roles (kasir/kurir/produksi), assigned branches
- All service types and pricing (laundry kiloan, satuan, stroller, perlengkapan bayi, etc.)
- Production workflow stations (cuci, setrika, lipat, etc. — what order?)
- Current QRIS merchant details (who is their payment provider?)
- WhatsApp Business API — do they have one or use personal numbers?
- Customer data format (what fields are required?)
- Sample nota/invoice — the exact format customers see

### Week 3–4: Backend API + Database

**Core Database Tables:**
- `branches` — 12 locations with details
- `users` — employees with roles (admin, kasir, kurir, produksi)
- `customers` — registered customers
- `services` — service types with pricing per branch
- `orders` (nota) — the main transaction record
- `order_items` — individual items within an order
- `order_photos` — photos taken at intake
- `production_stages` — tracking wash → iron → fold → done
- `payments` — payment records linked to QRIS
- `branches_daily_load` — for OCC forecasting

**API Endpoints Priority:**
1. Auth (login/register for employees)
2. Customer CRUD
3. Order creation (nota) + photo upload
4. Production status updates
5. Payment recording
6. Reports & dashboard data
7. WhatsApp notification trigger

### Week 5–6: Cashier Mobile App (Smart Kasir)

**Must-have features (copy from SmartLink exactly):**
- Employee login (per branch)
- Register new customer (name, phone, address)
- Create new order (nota):
  - Select customer
  - Add items (service type, quantity/weight, special notes)
  - Take photos of items
  - Auto-calculate total
  - Set pickup date
- Generate nota number
- Trigger WhatsApp message to customer with nota link
- View active orders
- Mark order as "ready for pickup" or "picked up"
- Accept payment (cash, QRIS — goes to OWNER's account)

### Week 7–8: Production Mobile App (Smart Produksi)

**Must-have features:**
- Employee login
- QR code scanner to scan nota
- View order details (items, special notes, photos)
- Update production status per station:
  - Cuci (Wash) ✓
  - Setrika (Iron) ✓
  - Lipat (Fold) ✓
  - QC (Quality Check) ✓
  - Selesai (Done) ✓
- Dashboard showing pending work queue
- Notification to kasir when order is complete

### Week 8–9: Web Admin (BOS)

**Must-have features:**
- Admin login with role-based access
- Branch management (add/edit branches)
- Employee management (add/edit/assign to branches)
- Service & pricing management
- Order tracking (all branches, filter/search)
- Basic reports:
  - Daily/weekly/monthly revenue per branch
  - Order count per branch
  - Payment reconciliation
- Customer database view

### Week 9–10: Customer Nota Page + Integration Testing

**Nota page (what customer sees from WhatsApp link):**
- Order details (items, weight, pricing)
- Real-time production status (cuci → setrika → lipat → done)
- Total amount due
- QRIS code for payment (linked to owner's merchant account)
- Estimated pickup date/time
- Branch contact info

**Integration testing:**
- End-to-end flow: kasir creates order → production updates → customer sees status → customer pays
- Test across all 12 branches simultaneously
- Load testing with ~50 concurrent users
- WhatsApp delivery testing
- QRIS payment testing

---

## Phase 2: OCC + Advanced Features
**Timeline: 4–6 weeks | Budget: IDR 25–35M (negotiate separately)**

### Operation Command Center (OCC) Dashboard

This is the killer feature — what makes your app BETTER than SmartLink.

**Live Dashboard showing:**
- **Real-time branch load map** — visual heat map of all 12 branches showing current order volume
- **Tomorrow's forecast** — based on historical data + current pending orders:
  - Predicted order volume per branch
  - Predicted production workload (kg or items)
  - Staffing recommendation (how many kasir + produksi needed)
  - Risk alerts (⚠️ "Branch BSD expected 2x normal load — consider moving 2 staff from Tebet")
- **SLA tracker** — what % of orders are on-time vs late
- **Employee utilization** — who's handling how many orders
- **Real-time alerts:**
  - Order stuck at a station too long
  - Branch approaching capacity
  - Customer complaint/issue flag

**How the forecast works (simplified AI):**
- Analyze last 90 days of order data by branch, by day-of-week
- Apply moving average + day-of-week seasonality
- Factor in current backlog (unfinished orders carry over)
- Flag anomalies (>1.5x above average = potential surge)

### Additional Phase 2 Features

- Inventory management (detergent, plastic bags, etc.)
- Employee attendance/shift management
- Payroll calculator (based on orders processed)
- Promo/discount management
- Customer loyalty program
- Bulk invoicing (faktur tagihan massal)
- Advanced reporting & data export

---

## Tech Stack Recommendation

| Component | Technology | Why |
|-----------|-----------|-----|
| **Backend** | Node.js + Express | Fast to build with Claude Code, huge ecosystem |
| **Database** | Supabase (PostgreSQL) | Free tier for dev, managed, real-time subscriptions, auth built-in |
| **Mobile Apps** | React Native (Expo) | Single codebase for Android, easy Play Store deployment |
| **Web Admin** | React + Vite | Fast, familiar, works on Replit |
| **Customer Nota** | Next.js or plain React | SEO doesn't matter, just needs to be fast |
| **WhatsApp** | Fonnte.com or Wablas | Indonesian WhatsApp API providers, cheap, reliable |
| **QRIS Payment** | Midtrans or Xendit | Indonesian payment gateways with QRIS, funds go to owner |
| **Photo Storage** | Supabase Storage or Cloudflare R2 | Cheap, fast |
| **Hosting** | Railway (backend) + Replit (web) | Affordable, easy deploy |
| **QR Codes** | react-native-camera + zxing | For production app scanning |

### Cost Breakdown (Monthly Operating)

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Supabase (Pro) | ~$25 (IDR 400K) | Database + auth + storage |
| Railway (backend) | ~$5–20 (IDR 80–320K) | Scales with usage |
| Replit (web hosting) | Free–$7/mo | For web admin |
| WhatsApp API (Fonnte) | ~IDR 100–200K/mo | Based on message volume |
| Midtrans/Xendit | 0.7% per QRIS tx | Charged to merchant |
| Google Play Store | IDR 400K (one-time) | $25 developer account |
| Domain | ~IDR 150K/year | For web admin + nota page |
| **Total Monthly** | **~IDR 800K–1.5M** | **Pass to client + margin** |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Scope creep** — friend keeps adding features | HIGH | Written scope document signed before starting. Anything extra = Phase 2+ |
| **QRIS integration complexity** | MEDIUM | Start Midtrans/Xendit sandbox account in Week 1. This is a known process. |
| **WhatsApp API reliability** | MEDIUM | Use established Indonesian providers (Fonnte/Wablas). Have backup plan (SMS). |
| **91 users need training** | HIGH | Match SmartLink's UX exactly. Create video tutorials. Rollout branch-by-branch. |
| **Data migration from SmartLink** | MEDIUM | Ask friend to export all customer data. Build import script. |
| **Play Store rejection** | LOW | Follow guidelines, no controversial content. Use Expo EAS for builds. |
| **Performance at scale** | MEDIUM | Supabase handles this well. Index queries properly. |
| **Your friend changes mind** | LOW | Written agreement + milestone payments (see below) |

---

## Payment & Contract Structure

### Recommended Milestone Payments

| Milestone | Deliverable | Payment |
|-----------|------------|---------|
| **Kickoff** | Signed agreement + requirements doc | IDR 15M (30%) |
| **Backend + Kasir App** | Working cashier app with backend | IDR 15M (30%) |
| **Production App + Admin** | Full system working in testing | IDR 10M (20%) |
| **Go-Live** | Deployed to Play Store, all branches live | IDR 10M (20%) |

### What to Include in the Agreement

1. Exact scope of Phase 1 (list every feature)
2. What is NOT included (everything else is Phase 2)
3. Timeline with milestones
4. Payment schedule tied to milestones
5. Who provides hosting costs (client)
6. Maintenance agreement (monthly fee after launch)
7. Bug fix period (30 days free after go-live, then maintenance kicks in)
8. IP ownership (client owns the final product, you retain right to reuse architecture for other clients)
9. Change request process (new features = new quote)

---

## Rollout Strategy

### Don't go live at all 12 branches simultaneously!

| Week | Action |
|------|--------|
| Week 1 | Pilot at 1 branch (pick the smallest/simplest one) |
| Week 2 | Fix bugs from pilot, add missing items |
| Week 3 | Expand to 3 branches |
| Week 4 | Fix bugs, optimize |
| Week 5+ | Roll out to remaining branches in batches of 3-4 |

**Run SmartLink and your app in parallel** for at least 2 weeks at the pilot branch. This way, if something breaks, they can fall back to SmartLink.

---

## Your Immediate Next Steps

### This Week
1. **Get SmartLink access** — login to web admin, download both mobile apps
2. **Screenshot everything** — every screen, every button, every flow
3. **Get the Excel files** — branches, employees, services, pricing
4. **Set up GitHub repo** — `kleen-app` with monorepo structure
5. **Set up Supabase project** — free tier is fine for now
6. **Send your friend a simple scope document** — even a WhatsApp message listing exactly what Phase 1 includes

### Before You Write Any Code
1. **Ask your friend:** Who is your current QRIS provider? (We need to know for Midtrans/Xendit setup)
2. **Ask your friend:** Do you have a WhatsApp Business API, or do branches use personal WhatsApp?
3. **Ask your friend:** Can you export customer data from SmartLink?
4. **Ask your friend:** What's the production workflow? List every station in order.
5. **Ask your friend:** Is there any feature in SmartLink you DON'T use? (So we can skip it)

---

## How I'll Help You

Throughout this project, come to me for:

- **Architecture decisions** — "Should I use X or Y?"
- **Code reviews** — paste code, I'll review and improve
- **Database design** — I'll help design schemas
- **Problem solving** — stuck on QRIS integration? WhatsApp API? Bring it here
- **Project management** — track progress, adjust timelines
- **Business advice** — pricing, contracts, negotiations
- **Documentation** — user guides, API docs, training materials

The key to making this successful: **ship fast, copy SmartLink's UX exactly, and deliver value quickly.** Don't try to innovate in Phase 1. Just make it work the way they're already used to, minus the pain points (QRIS going to SmartLink's account instead of your friend's).

The OCC dashboard in Phase 2 is where you truly differentiate and prove your value. That's the "wow" moment.

Let's go build this. 🚀
