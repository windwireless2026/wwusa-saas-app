# 🔐 RLS (Row Level Security) COMPLIANCE REPORT

**Date**: 2026-02-03  
**Status**: ⚠️ NEEDS REVIEW & FIX  
**Last Updated by**: Security Audit

---

## Executive Summary

The project has **46 RLS policies** across **15 tables**. However, the implementation shows:
- ✅ Policies ARE enabled on tables
- ✅ Basic structure follows RBAC pattern (operacional/socio/admin roles)
- ⚠️ **CRITICAL**: Some policies conflict or override each other
- ⚠️ **CRITICAL**: Migration 090 refactor may have introduced gaps
- ⚠️ **HIGH**: Some tables allow "ALL authenticated users" without proper filtering

---

## Table: PROFILES

**RLS Status**: ✅ ENABLED

### Current Policies (from migration 090/096):
1. **profiles_select_policy** (SELECT)
   ```sql
   USING (auth.uid() = id OR (SELECT ... company_id))
   ```
   - Allows users to see themselves + other company members
   - ✅ Appears secure

2. **profiles_update_policy** (UPDATE)
   ```sql
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id)
   ```
   - Users can only update their own profile
   - ✅ Secure

3. **profiles_insert_policy** (INSERT)
   ```sql
   WITH CHECK (auth.uid() = id)
   ```
   - Only new auth users can create profiles
   - ✅ Secure

### ⚠️ CONFLICTS DETECTED:
- Migration 088 has **7 conflicting policies** for profiles (still active?)
  - "Profiles are readable by authenticated users" (ALL users can see all profiles!)
  - "Users can update their own profile"
  - "Operacional and socio can update any profile"
  - "profiles_insert_admin"
  - "profiles_update_self_or_admin"
  - "profiles_delete_admin"
- Migration 090 supposedly **DROPS** these (line 131-133)
- Migration 096 RECREATES them properly

**Action**: Verify which policies are ACTUALLY active in production via:
```sql
SELECT policyname, qual, with_check FROM pg_policies 
WHERE tablename = 'profiles' ORDER BY policyname;
```

---

## Table: INVOICES (Contas a Pagar)

**RLS Status**: ✅ ENABLED (created migration 20260112)

### Current Policies:
1. **Allow authenticated users to read invoices**
   ```sql
   USING (true)
   ```
   - ❌ **CRITICAL VULNERABILITY**: Allows ALL authenticated users to see ALL invoices!
   - No company_id filtering
   - No role-based filtering

2. **Allow authenticated users to insert invoices**
   ```sql
   WITH CHECK (true)
   ```
   - ❌ **CRITICAL**: Anyone can INSERT invoices

3. **Allow authenticated users to update invoices**
   - ❌ **CRITICAL**: Anyone can UPDATE any invoice

4. **Allow authenticated users to delete invoices**
   - ❌ **CRITICAL**: Anyone can DELETE any invoice

### 🔴 SEVERITY: **CRITICAL**
**Invoices contain sensitive financial data and are accessible to ALL users across ALL companies!**

**Recommended Fix**:
```sql
-- Delete invoices for specific company only
CREATE POLICY "invoices_select_company"
ON invoices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.company_id = invoices.company_id
  )
);

-- Similar for INSERT, UPDATE, DELETE
```

---

## Table: INVENTORY

**RLS Status**: ✅ ENABLED

### Current Policies (from migration 088):
1. **Inventory is readable by authenticated users**
   ```sql
   USING (true)
   ```
   - ❌ Allows ALL users to see ALL inventory

2. **Operacional and socio can manage inventory**
   - Only operacional/socio roles (via RBAC)
   - ⚠️ But still accessed via company filtering?

3. **inventory_manage_staff**
4. **inventory_update_authenticated**

### ⚠️ ISSUE:
- Inventory linked to `stock_locations` table
- `stock_locations` has `company_id` (presumably)
- But policies don't enforce company_id filtering
- Users can potentially see inventory from OTHER companies

---

## Table: COST_CENTERS

**RLS Status**: ✅ ENABLED (migration 20260112)

### Current Policies:
```sql
CREATE POLICY "Allow authenticated users to read cost_centers"
USING (true)

CREATE POLICY "Allow authenticated users to insert cost_centers"
WITH CHECK (true)

CREATE POLICY "Allow authenticated users to update cost_centers"
WITH CHECK (true)

CREATE POLICY "Allow authenticated users to delete cost_centers"
WITH CHECK (true)
```

### 🔴 CRITICAL: 
**All cost_centers are readable/editable by ALL users regardless of company!**

---

## Table: FINANCIAL_CLASSES

**RLS Status**: ✅ ENABLED

### Policies (migration 095):
```sql
CREATE POLICY "Users can view financial_classes" ON financial_classes
FOR SELECT TO authenticated USING (true);
```

### ⚠️ ISSUE:
- Allows all authenticated users to view all financial classes
- No company filtering

---

## Table: PRODUCT_CATALOG

**RLS Status**: ✅ ENABLED

### Policies:
- "Product catalog is readable by all authenticated users" (true)
- "Operacional and socio can manage product catalog"

### Consideration:
- Shared product data across companies (acceptable)
- ✅ Makes sense

---

## Table: ACCESS_PROFILES & ACCESS_PROFILE_PERMISSIONS

**RLS Status**: ✅ ENABLED

### Policies (migration 090):
```sql
CREATE POLICY "access_profiles_select_policy"
ON access_profiles
FOR SELECT
TO authenticated
USING (
  (SELECT company_id FROM profiles WHERE id = auth.uid()) = access_profiles.company_id
);
```

### ✅ GOOD:
- Filters by company_id
- Users only see access profiles from their own company
- Properly implements company-level isolation

---

## SUMMARY TABLE: RLS Coverage by Table

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Company-Filter | Severity |
|-------|-----|--------|--------|--------|--------|---|---|
| profiles | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ NEEDS REVIEW |
| invoices | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔴 **CRITICAL** |
| cost_centers | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔴 **CRITICAL** |
| inventory | ✅ | ❌ | ✅ | ✅ | ❌ | ⚠️ | 🔴 **CRITICAL** |
| financial_classes | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | 🟠 **HIGH** |
| access_profiles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **GOOD** |
| agents | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ NEEDS REVIEW |
| stock_locations | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ NEEDS REVIEW |
| audit_logs | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ **GOOD** |
| Others | Varies | Varies | Varies | Varies | Varies | Varies | ⚠️ REVIEW |

---

## Recommended Actions (Priority Order)

### 🔴 CRITICAL (Do IMMEDIATELY):

1. **FIX INVOICES RLS**
   - Add company_id filtering to all 4 policies
   - Verify cost_center_id belongs to user's company
   - Only show invoices to users in same company

2. **FIX COST_CENTERS RLS**
   - Add company_id filtering
   - Only operacional/socio can manage

3. **FIX INVENTORY RLS**
   - Filter by stock_locations.company_id
   - Ensure location relationship is loaded

### 🟠 HIGH (Next Sprint):

4. **FIX FINANCIAL_CLASSES RLS**
   - Add company_id if available
   - Or restrict to operacional role minimum

5. **AUDIT AGENTS & STOCK_LOCATIONS**
   - Verify company_id filtering is applied
   - Check if agents/locations are shared (multi-tenant vs isolated)

### 🟡 MEDIUM (Next Review):

6. **Review Product_Catalog, Manufacturers, Product_Types**
   - Shared data across companies (expected) or isolated?
   - Document intentionality

---

## Verification Script

Run this in Supabase SQL Editor to audit current state:

```sql
-- List all active RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check which tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for overlapping/conflicting policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) > 3  -- Flag tables with many policies
ORDER BY policy_count DESC;
```

---

## Documentation

This report should be:
1. ✅ Reviewed by security team
2. ✅ Fixes implemented by backend team
3. ✅ Tests added for RLS via migrations (insert & select should fail cross-company)
4. ✅ Added to docs/SECURITY.md

---

**Status**: 🔴 BLOCKS PRODUCTION  
**Estimated Fix Time**: 8-12 hours  
**Risk Level**: CRITICAL - Data Breach Potential
