-- Kleen Laundry POS — Ensure schema columns exist for seed data
-- Run this in Supabase SQL Editor before running seed.js
-- Safe to re-run (uses IF NOT EXISTS)

-- ============================================
-- BRANCHES TABLE — add columns for rich data
-- ============================================

ALTER TABLE branches ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS smartlink_id text;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS smartlink_workshop_id text;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS absen_radius integer DEFAULT 100;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS pajak numeric DEFAULT 0;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS diskon numeric DEFAULT 0;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS nota_transaksi text;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';

-- ============================================
-- SERVICES TABLE — add SmartLink ID column
-- ============================================

ALTER TABLE services ADD COLUMN IF NOT EXISTS smartlink_id text;

-- ============================================
-- USERS TABLE — add columns for employee management
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS pin text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
